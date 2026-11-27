/**
 * Kidhar Chale? backend: feedback, real-cost reports, and sign-in accounts with
 * private, encrypted trip saving. Everything is stored in a Google Sheet in YOUR Drive.
 *
 * Setup (about 5 minutes, free):
 * 1. Go to https://script.google.com and click "New project".
 * 2. Delete what is there, paste this whole file, and click Save.
 * 3. Click Deploy > New deployment > Select type: Web app.
 *    Description: Kidhar Chale. Execute as: Me. Who has access: Anyone.
 * 4. Click Deploy and allow the permissions Google asks for
 *    (it needs a Sheet in your Drive and to send email: feedback to you, sign-in codes to users).
 * 5. Copy the "Web app URL" (it ends in /exec) and send it to Claude.
 * 6. Optional, for AI trip plans: see "AI trip plans" further down (add a free Gemini key).
 *
 * Updating later: paste the new file, then Deploy > Manage deployments > edit (pencil) >
 * Version: New version > Deploy. The /exec address stays the same.
 *
 * What is stored, and how:
 * - Feedback and cost reports: plain rows in the "Feedback" and "Reports" tabs.
 * - Accounts: the user's email is NEVER stored. Only a one-way scrambled key made from it
 *   (HMAC-SHA256 with a secret), so nobody, including you, can read the emails back.
 * - The user's name and saved trips are encrypted (HMAC-SHA256 stream cipher + tamper check)
 *   with a secret key kept in Script Properties, never in the Sheet. A leaked Sheet shows nothing.
 * - Sign-in codes live 10 minutes in Google's private cache, stored only as a scrambled hash.
 * - Sessions are stored only as scrambled hashes too. A stolen Sheet cannot sign anyone in.
 * - Group trips (shared expenses) are encrypted the same way; only people with the 6-letter code can open one.
 *   Trips nobody has changed for 180 days are removed.
 * Do not share the Apps Script project itself: whoever can edit it could read the secret key.
 *
 * Limits: a normal Gmail account can send about 100 emails a day. Sign-in codes stop for the
 * day after 90 (the site then asks people to try again later). Feedback emails count too.
 */

const SHEET_NAME = 'Kidhar Chale data';
const MAX_PER_HOUR = 120;           // flood guard for feedback and reports
const MIN_REPORTS_TO_SHOW = 3;

const CODE_MINUTES = 10;            // a sign-in code works this long
const CODE_TRIES = 5;               // wrong guesses allowed per code
const CODES_PER_HOUR = 5;           // codes one email can ask for in an hour
const CODES_PER_DAY_SITE = 90;      // all sign-in emails in a day (Gmail allows ~100)
const SESSION_DAYS = 90;            // stay signed in this long on a device
const MAX_DATA = 450000;            // biggest saved data per account (characters, before compression)
const CHUNK = 45000, CHUNKS = 8;    // a Sheet cell holds 50,000 characters

/* ---------- Sheet ---------- */
let BOOK_ = null;
function book_() {
  if (BOOK_) return BOOK_;
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('sheetId');
  let ss = null;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; } }
  if (!ss) {
    ss = SpreadsheetApp.create(SHEET_NAME);
    props.setProperty('sheetId', ss.getId());
    ss.getSheets()[0].setName('Reports').appendRow(['Time', 'Place', 'From', 'Month', 'Days', 'People', 'Total per person', 'Travel', 'Stay', 'Food', 'Tip', 'Hidden']);
    ss.insertSheet('Feedback').appendRow(['Time', 'Type', 'Message', 'Contact', 'Page']);
  }
  BOOK_ = ss;
  return ss;
}

function tab_(name, header) {
  const ss = book_();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, sh.getMaxRows(), Math.max(header.length, sh.getMaxColumns())).setNumberFormat('@'); // keep everything as plain text
    sh.appendRow(header);
    sh.setFrozenRows(1);
  }
  return sh;
}
const ACC_ = () => tab_('Accounts', ['User', 'Email key (scrambled, not the email)', 'Created', 'Last sign-in', 'Last sync', 'Data 1 (encrypted)', 'Data 2', 'Data 3', 'Data 4', 'Data 5', 'Data 6', 'Data 7', 'Data 8']);
const SES_ = () => tab_('Sessions', ['Session key (scrambled)', 'User', 'Created', 'Expires']);

function findRow_(sh, col, value) {
  const last = sh.getLastRow();
  if (last < 2) return 0;
  const hit = sh.getRange(2, col, last - 1, 1).createTextFinder(String(value)).matchEntireCell(true).matchCase(true).findNext();
  return hit ? hit.getRow() : 0;
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function clean_(s, max) {
  return String(s || '').replace(/[\u0000-\u001f]/g, ' ').replace(/^[=+\-@]/, "'").trim().slice(0, max);
}

/* ---------- small crypto helpers (Apps Script has HMAC-SHA256 and SHA-256 built in) ---------- */
const sb_ = b => (b > 127 ? b - 256 : b);                       // Java bytes are signed
const bytes_ = s => Utilities.newBlob(String(s)).getBytes();
const cat_ = function () { const r = []; for (let a = 0; a < arguments.length; a++) { const x = arguments[a]; for (let i = 0; i < x.length; i++) r.push(x[i]); } return r; };
const hmac_ = (msg, key) => Utilities.computeHmacSha256Signature(typeof msg === 'string' ? bytes_(msg) : msg, key);
const hex_ = b => { let s = ''; for (let i = 0; i < b.length; i++) s += ((b[i] + 256) % 256).toString(16).padStart(2, '0'); return s; };
function rand_(n) { // Utilities.getUuid() uses Java's secure random generator
  let r = [];
  while (r.length < n) r = cat_(r, Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid() + Utilities.getUuid() + Date.now(), Utilities.Charset.UTF_8));
  return r.slice(0, n);
}
function same_(a, b) { // compare without leaking timing
  a = String(a); b = String(b);
  let d = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return d === 0;
}
const SECRETS_ = {};
function secret_(name) {
  if (SECRETS_[name]) return SECRETS_[name];
  const p = PropertiesService.getScriptProperties();
  let v = p.getProperty(name);
  if (!v) {
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      v = p.getProperty(name);
      if (!v) { v = Utilities.base64Encode(rand_(32)); p.setProperty(name, v); }
    } finally { lock.releaseLock(); }
  }
  return (SECRETS_[name] = Utilities.base64Decode(v));
}
const pepper_ = () => secret_('pepper');
function keys_() {
  const m = secret_('dataKey');
  return { enc: hmac_('enc', m), mac: hmac_('mac', m) };
}
function stream_(data, key, nonce) { // HMAC-SHA256 in counter mode
  const out = new Array(data.length);
  let block = null;
  for (let i = 0; i < data.length; i++) {
    if (i % 32 === 0) { const c = i / 32; block = hmac_(cat_(nonce, [sb_((c >>> 24) & 255), sb_((c >>> 16) & 255), sb_((c >>> 8) & 255), sb_(c & 255)]), key); }
    out[i] = sb_((data[i] ^ block[i % 32]) & 255);
  }
  return out;
}
function encrypt_(obj) {
  const gz = Utilities.gzip(Utilities.newBlob(JSON.stringify(obj), 'application/json')).getBytes();
  const k = keys_(), nonce = rand_(16), ct = stream_(gz, k.enc, nonce);
  const tag = hmac_(cat_(nonce, ct), k.mac).slice(0, 16);
  return 'v1.' + Utilities.base64EncodeWebSafe(cat_(nonce, ct, tag));
}
function decrypt_(str) {
  if (!str || str.slice(0, 3) !== 'v1.') return null;
  const all = Utilities.base64DecodeWebSafe(str.slice(3));
  if (all.length < 33) return null;
  const nonce = all.slice(0, 16), ct = all.slice(16, all.length - 16), tag = all.slice(all.length - 16);
  const k = keys_();
  if (!same_(hex_(tag), hex_(hmac_(cat_(nonce, ct), k.mac).slice(0, 16)))) return null; // tampered
  const gz = stream_(ct, k.enc, nonce);
  return JSON.parse(Utilities.ungzip(Utilities.newBlob(gz, 'application/x-gzip')).getDataAsString());
}
function readData_(sh, row) {
  const parts = sh.getRange(row, 6, 1, CHUNKS).getValues()[0].map(v => String(v || '')).filter(Boolean).map(v => v.slice(1));
  if (!parts.length) return { name: '', keys: {} };
  try { return decrypt_(parts.join('')); } catch (e) { return null; }   // null: unreadable, never overwrite it
}
function chunks_(enc) {
  const r = [];
  for (let i = 0; i < CHUNKS; i++) { const part = enc.slice(i * CHUNK, (i + 1) * CHUNK); r.push(part ? '~' + part : ''); }
  return r;
}

/* ---------- accounts ---------- */
function normEmail_(e) {
  e = String(e || '').trim().toLowerCase();
  return e.length <= 254 && /^[a-z0-9._%+\-]+@[a-z0-9\-]+(\.[a-z0-9\-]+)*\.[a-z]{2,}$/.test(e) ? e : '';
}
const emailKey_ = email => 'e' + hex_(hmac_('email:' + email, pepper_()));
const codeHash_ = (key, code) => hex_(hmac_('code:' + key + ':' + code, pepper_()));
const sessKey_ = token => 't' + hex_(hmac_('session:' + token, pepper_()));
function cleanName_(n) {
  return String(n || '').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);
}
function newCode_() {
  const r = rand_(6);
  let v = 0;
  for (let i = 0; i < 6; i++) v = v * 256 + ((r[i] + 256) % 256);
  return String(v % 1000000).padStart(6, '0');
}

function authStart_(d) {
  if (d.website) return { ok: true };                       // honeypot
  const email = normEmail_(d.email);
  if (!email) return { ok: false, error: 'email' };
  const key = emailKey_(email), c = CacheService.getScriptCache();
  if (c.get('ow:' + key)) return { ok: false, error: 'wait' };
  const hour = Number(c.get('oh:' + key) || 0);
  if (hour >= CODES_PER_HOUR) return { ok: false, error: 'limit' };
  const dayKey = 'od:' + Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyyMMdd');
  const day = Number(c.get(dayKey) || 0);
  if (day >= CODES_PER_DAY_SITE || MailApp.getRemainingDailyQuota() < 3) return { ok: false, error: 'busy' };
  const code = newCode_();
  c.put('otp:' + key, JSON.stringify({ h: codeHash_(key, code), n: 0, x: Date.now() + CODE_MINUTES * 60000 }), CODE_MINUTES * 60);
  c.put('ow:' + key, '1', 55);
  c.put('oh:' + key, String(hour + 1), 3600);
  c.put(dayKey, String(day + 1), 21600);
  const text = 'Your Kidhar Chale? sign-in code is ' + code + '\n\nIt works for ' + CODE_MINUTES + ' minutes. Type it on the website to sign in.\n\nDid not ask for this? Ignore this email. Nobody can sign in without the code.';
  const html = '<div style="font-family:Arial,sans-serif;max-width:440px;margin:0 auto;padding:24px;background:#FAF7F0;border:1px solid #d9cfbd;border-radius:8px;color:#1d1a16">' +
    '<p style="margin:0 0 4px;font-size:20px;font-weight:800">Kidhar Chale?</p>' +
    '<p style="margin:0 0 18px;color:#5a5248">Your sign-in code</p>' +
    '<p style="margin:0 0 18px;font:700 34px/1 \'Courier New\',monospace;letter-spacing:8px;color:#B5431C">' + code + '</p>' +
    '<p style="margin:0 0 10px">It works for ' + CODE_MINUTES + ' minutes. Type it on the website to sign in.</p>' +
    '<p style="margin:0;color:#5a5248;font-size:13px">Did not ask for this? Ignore this email. Nobody can sign in without the code. We never ask for this code on a call or chat.</p></div>';
  MailApp.sendEmail({ to: email, subject: code + ' is your Kidhar Chale? sign-in code', body: text, htmlBody: html, name: 'Kidhar Chale?' });
  return { ok: true };
}

function authVerify_(d) {
  const email = normEmail_(d.email), code = String(d.code || '').replace(/\D/g, '');
  if (!email || code.length !== 6) return { ok: false, error: 'code' };
  const key = emailKey_(email), c = CacheService.getScriptCache();
  const raw = c.get('otp:' + key);
  if (!raw) return { ok: false, error: 'expired' };
  const o = JSON.parse(raw);
  if (Date.now() > o.x) { c.remove('otp:' + key); return { ok: false, error: 'expired' }; }
  if (!same_(o.h, codeHash_(key, code))) {
    o.n++;
    if (o.n >= CODE_TRIES) { c.remove('otp:' + key); return { ok: false, error: 'tries' }; }
    c.put('otp:' + key, JSON.stringify(o), Math.max(1, Math.floor((o.x - Date.now()) / 1000)));
    return { ok: false, error: 'wrong', left: CODE_TRIES - o.n };
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const acc = ACC_(), row = findRow_(acc, 2, key);
    let id, name, isNew = false;
    if (!row) {
      const nm = cleanName_(d.name);
      if (!nm) return { ok: true, needName: true };          // the code stays valid for the next step
      id = 'u' + hex_(rand_(9));
      const now = Date.now();
      acc.appendRow([id, key, now, now, now].concat(chunks_(encrypt_({ name: nm, keys: {} }))));
      name = nm; isNew = true;
    } else {
      id = String(acc.getRange(row, 1).getValue());
      acc.getRange(row, 4).setValue(Date.now());
      const data = readData_(acc, row);
      if (!data) return { ok: false, error: 'server' };
      name = data.name || '';
    }
    c.remove('otp:' + key);
    return { ok: true, token: newSession_(id), name: name, isNew: isNew };
  } finally { lock.releaseLock(); }
}

function newSession_(id) {
  const token = Utilities.base64EncodeWebSafe(rand_(32)).replace(/=+$/, '');
  const ses = SES_(), now = Date.now();
  ses.appendRow([sessKey_(token), id, now, now + SESSION_DAYS * 86400000]);
  if (Math.random() < 0.1) purgeSessions_(ses);
  return token;
}
function purgeSessions_(ses) {
  const last = ses.getLastRow();
  if (last < 2) return;
  const v = ses.getRange(2, 1, last - 1, 4).getValues(), now = Date.now();
  for (let i = v.length - 1; i >= 0; i--) if (Number(v[i][3]) < now) ses.deleteRow(i + 2);
}
function session_(token) {
  token = String(token || '');
  if (token.length < 30 || token.length > 60) return null;
  const ses = SES_(), row = findRow_(ses, 1, sessKey_(token));
  if (!row) return null;
  const r = ses.getRange(row, 1, 1, 4).getValues()[0];
  if (Number(r[3]) < Date.now()) { ses.deleteRow(row); return null; }
  return { id: String(r[1]), row: row };
}
function dropSessions_(id) {
  const ses = SES_(), last = ses.getLastRow();
  if (last < 2) return;
  const v = ses.getRange(2, 2, last - 1, 1).getValues();
  for (let i = v.length - 1; i >= 0; i--) if (String(v[i][0]) === id) ses.deleteRow(i + 2);
}

/* sync: the site sends what changed (each value with the time it was changed), the newest
   version of each item wins, and the site gets back what changed on other devices. */
function sync_(d) {
  const s = session_(d.token);
  if (!s) return { ok: false, error: 'signin' };
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const acc = ACC_(), row = findRow_(acc, 1, s.id);
    if (!row) return { ok: false, error: 'signin' };
    const data = readData_(acc, row);
    if (!data) return { ok: false, error: 'server' };
    data.keys = data.keys || {};
    const now = Date.now(), mine = {};
    let changed = false;
    const inc = d.keys && typeof d.keys === 'object' ? d.keys : {};
    Object.keys(inc).slice(0, 300).forEach(k => {
      if (!/^bg_[A-Za-z0-9_]{1,40}$/.test(k)) return;
      const x = inc[k];
      if (!x || typeof x !== 'object') return;
      const t = Math.max(0, Math.min(now + 86400000, Number(x.t) || 0));
      const v = x.v === null ? null : String(x.v);
      if (v !== null && v.length > 200000) return;
      const cur = data.keys[k];
      if (cur && !(t > cur.t)) return;                     // server copy is newer or the same age
      mine[k] = 1;
      if (cur && cur.v === v) { cur.t = t; changed = true; return; }
      data.keys[k] = { v: v, t: t, s: now };
      changed = true;
    });
    if (d.name !== undefined) {
      const nm = cleanName_(d.name);
      if (nm && nm !== data.name) { data.name = nm; changed = true; }
    }
    if (changed) {
      const size = JSON.stringify(data).length;
      if (size > MAX_DATA) return { ok: false, error: 'full' };
      const enc = encrypt_(data);
      if (enc.length > CHUNK * CHUNKS) return { ok: false, error: 'full' };
      acc.getRange(row, 5, 1, 1 + CHUNKS).setValues([[now].concat(chunks_(enc))]);
    }
    const since = Number(d.since) || 0, back = {};
    Object.keys(data.keys).forEach(k => { const x = data.keys[k]; if (x.s > since && !mine[k]) back[k] = { v: x.v, t: x.t }; });
    return { ok: true, name: data.name || '', keys: back, now: now };
  } finally { lock.releaseLock(); }
}

function signOut_(d) {
  const s = session_(d.token);
  if (!s) return { ok: true };
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (d.all) dropSessions_(s.id); else SES_().deleteRow(s.row);
    return { ok: true };
  } finally { lock.releaseLock(); }
}

function deleteAccount_(d) {
  const s = session_(d.token);
  if (!s) return { ok: false, error: 'signin' };
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const acc = ACC_(), row = findRow_(acc, 1, s.id);
    if (row) acc.deleteRow(row);
    dropSessions_(s.id);
    return { ok: true };
  } finally { lock.releaseLock(); }
}

/* ---------- live group trips: friends with the 6-letter code share expenses ---------- */
const ROOM_MAX = 60000, ROOM_DAYS = 180;
const ROOMS_ = () => tab_('Rooms', ['Trip code', 'Last change', 'Data (encrypted)', 'Data 2', 'Data 3']);
const roomId_ = id => (/^[A-HJ-NP-Z2-9]{6}$/.test(String(id || '')) ? String(id) : '');
function roomClean_(r, id) {
  if (!r || typeof r !== 'object') return null;
  const str = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').slice(0, n);
  const members = [...new Set((Array.isArray(r.members) ? r.members : []).map(m => str(m, 30).trim()).filter(Boolean))].slice(0, 30);
  const del = (Array.isArray(r.del) ? r.del : []).map(x => str(x, 40)).slice(-3000);
  const dels = new Set(del);
  const exps = (Array.isArray(r.exps) ? r.exps : []).filter(e => e && e.id && Number(e.amt) > 0 && Number(e.amt) < 10000000)
    .map(e => ({ id: str(e.id, 40), amt: Math.round(Number(e.amt) * 100) / 100, by: str(e.by, 30), what: str(e.what, 80), at: Number(e.at) || 0 }))
    .filter(e => !dels.has(e.id)).slice(-2000);
  return { id: id, name: str(r.name, 60) || 'Our trip', members: members, plan: str(r.plan, 6000), planAt: Number(r.planAt) || 0, del: del, exps: exps };
}
function roomMerge_(a, b) { // the same rules as the website: keep every expense, honour deletions, newest shared plan wins
  const del = [...new Set([...(a.del || []), ...(b.del || [])])], dels = new Set(del), map = {};
  [...(a.exps || []), ...(b.exps || [])].forEach(e => { map[e.id] = e; });
  const newer = (b.planAt || 0) > (a.planAt || 0);
  return { id: a.id, name: a.name || b.name, members: [...new Set([...(a.members || []), ...(b.members || [])])].slice(0, 30),
    plan: newer ? b.plan : a.plan, planAt: Math.max(a.planAt || 0, b.planAt || 0), del: del.slice(-3000),
    exps: Object.values(map).filter(e => !dels.has(e.id)).sort((x, y) => x.at - y.at).slice(-2000) };
}
function roomRead_(id) {
  const c = CacheService.getScriptCache(), hit = c.get('room:' + id);
  if (hit) return JSON.parse(hit);
  const sh = ROOMS_(), row = findRow_(sh, 1, id);
  if (!row) return null;
  const v = sh.getRange(row, 2, 1, 4).getValues()[0];
  let room = null;
  try { room = decrypt_(v.slice(1).map(x => String(x || '')).filter(Boolean).map(x => x.slice(1)).join('')); } catch (e) { room = null; }
  if (!room) return null;
  const rec = { at: Number(v[0]) || 0, room: room };
  try { c.put('room:' + id, JSON.stringify(rec), 21600); } catch (e) {}
  return rec;
}
function roomGet_(d) {
  const id = roomId_(d.id);
  if (!id) return { ok: false, error: 'code' };
  const rec = roomRead_(id);
  if (!rec) return { ok: true, room: null };
  if (Number(d.at) === rec.at) return { ok: true, same: true, at: rec.at };
  return { ok: true, room: rec.room, at: rec.at };
}
function roomPut_(d) {
  const id = roomId_(d.id);
  if (!id) return { ok: false, error: 'code' };
  const inc = roomClean_(d.room, id);
  if (!inc || inc.members.length < 1) return { ok: false, error: 'room' };
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const cur = roomRead_(id), merged = cur ? roomMerge_(cur.room, inc) : inc;
    if (JSON.stringify(merged).length > ROOM_MAX) return { ok: false, error: 'full' };
    if (cur && JSON.stringify(merged) === JSON.stringify(cur.room)) return { ok: true, room: cur.room, at: cur.at };
    const enc = encrypt_(merged);
    if (enc.length > CHUNK * 3) return { ok: false, error: 'full' };
    const parts = [0, 1, 2].map(i => { const x = enc.slice(i * CHUNK, (i + 1) * CHUNK); return x ? '~' + x : ''; });
    const sh = ROOMS_(), row = findRow_(sh, 1, id), now = Date.now();
    if (row) sh.getRange(row, 2, 1, 4).setValues([[now].concat(parts)]);
    else { sh.appendRow([id, now].concat(parts)); if (Math.random() < 0.05) purgeRooms_(sh); }
    try { CacheService.getScriptCache().put('room:' + id, JSON.stringify({ at: now, room: merged }), 21600); } catch (e) {}
    return { ok: true, room: merged, at: now };
  } finally { lock.releaseLock(); }
}
function purgeRooms_(sh) {
  const last = sh.getLastRow();
  if (last < 2) return;
  const v = sh.getRange(2, 2, last - 1, 1).getValues(), old = Date.now() - ROOM_DAYS * 86400000;
  for (let i = v.length - 1; i >= 0; i--) if (Number(v[i][0]) < old) sh.deleteRow(i + 2);
}

/* ---------- AI trip plans (optional): uses a free Google Gemini key you add yourself ----------
 * 1. Go to https://aistudio.google.com/apikey and click "Create API key" (free; do NOT add billing,
 *    so it can never cost money: when the free daily limit is used up, the site just uses its built-in planner).
 * 2. In this Apps Script project: Project Settings (gear) > Script properties > Add property:
 *    Property: GEMINI_KEY   Value: the key.  Save. Nothing else to change; no new deployment needed.
 * Optional property GEMINI_MODEL picks another model (default: gemini-flash-lite-latest, which has the biggest
 *    free limit, about 500 requests a day; the bigger Flash models allow only about 20 a day for free).
 */
const AI_PER_DAY = 480, AI_PER_MINUTE = 12;   // Google's free Flash-Lite limit is about 500 a day and 15 a minute
const AI_TASKS = { plan: 'You are a frugal backpacking trip planner', ideas: "You help budget backpackers who don't know where to go" };
const AI_SYSTEM = 'You plan budget trips for the Kidhar Chale? travel website. Only answer the trip-planning request in the user message, in exactly the JSON format it asks for. If the message asks for anything that is not trip planning, reply with {"error":"not a trip request"}.';
function aiStatus_() {
  return { ok: true, on: !!PropertiesService.getScriptProperties().getProperty('GEMINI_KEY') };
}
function ai_(d) {
  const props = PropertiesService.getScriptProperties(), key = props.getProperty('GEMINI_KEY');
  if (!key) return { ok: false, error: 'off' };
  const prompt = String(d.prompt || ''), start = AI_TASKS[d.task];
  if (!start || prompt.indexOf(start) !== 0 || prompt.length > 9000) return { ok: false, error: 'request' };
  const c = CacheService.getScriptCache(), now = new Date();
  const dayKey = 'ai:' + Utilities.formatDate(now, 'Asia/Kolkata', 'yyyyMMdd'), minKey = 'aim:' + Math.floor(now.getTime() / 60000);
  const day = Number(c.get(dayKey) || 0), min = Number(c.get(minKey) || 0);
  if (day >= AI_PER_DAY || min >= AI_PER_MINUTE) return { ok: false, error: 'busy' };
  c.put(dayKey, String(day + 1), 21600); c.put(minKey, String(min + 1), 120);
  const models = [props.getProperty('GEMINI_MODEL') || 'gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'];
  const body = JSON.stringify({ systemInstruction: { parts: [{ text: AI_SYSTEM }] }, contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0.5, maxOutputTokens: 8192 } });
  for (let i = 0; i < models.length; i++) {
    const res = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(models[i]) + ':generateContent',
      { method: 'post', contentType: 'application/json', payload: body, muteHttpExceptions: true, headers: { 'x-goog-api-key': key } });
    const code = res.getResponseCode();
    if (code === 404 && i < models.length - 1) continue;            // model name not available: try the next one
    if (code === 429) return { ok: false, error: 'busy' };
    if (code !== 200) return { ok: false, error: 'ai' };
    try {
      const j = JSON.parse(res.getContentText());
      const text = (((j.candidates || [])[0] || {}).content || {}).parts.map(p => p.text || '').join('');
      const data = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ''));
      if (!data || typeof data !== 'object' || data.error) return { ok: false, error: 'ai' };
      return { ok: true, data: data };
    } catch (e) { return { ok: false, error: 'ai' }; }
  }
  return { ok: false, error: 'ai' };
}

const ACCOUNT_ = { auth_start: authStart_, auth_verify: authVerify_, sync: sync_, sign_out: signOut_, delete_account: deleteAccount_, room_get: roomGet_, room_put: roomPut_, ai_status: aiStatus_, ai: ai_ };

/* ---------- web app entry points ---------- */
function doPost(e) {
  let d;
  try { d = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) { return out_({ ok: false, error: 'bad request' }); }
  if (!d || typeof d !== 'object') return out_({ ok: false, error: 'bad request' });
  try {
    if (ACCOUNT_[d.kind]) {
      const c = CacheService.getScriptCache(), n = Number(c.get('acount') || 0);   // flood guard for accounts
      if (n >= 30000) return out_({ ok: false, error: 'busy' });
      c.put('acount', String(n + 1), 3600);
      return out_(ACCOUNT_[d.kind](d));
    }
    if (d.website) return out_({ ok: true });                  // honeypot
    if (!(d.ms >= 3000)) return out_({ ok: false, error: 'too fast' });
    const cache = CacheService.getScriptCache();
    const n = Number(cache.get('count') || 0);
    if (n >= MAX_PER_HOUR) return out_({ ok: false, error: 'busy' });
    cache.put('count', String(n + 1), 3600);
    const ss = book_();
    if (d.kind === 'feedback') {
      const msg = clean_(d.msg, 1500);
      if (msg.length < 8) return out_({ ok: false, error: 'short' });
      const row = [new Date(), clean_(d.type, 60), msg, clean_(d.contact, 120), clean_(d.page, 200)];
      ss.getSheetByName('Feedback').appendRow(row);
      try {
        MailApp.sendEmail(Session.getEffectiveUser().getEmail(), 'Kidhar Chale feedback: ' + row[1], msg + '\n\nContact: ' + (row[3] || 'none') + '\nPage: ' + row[4]);
      } catch (err) {}
      return out_({ ok: true });
    }
    if (d.kind === 'report') {
      const days = Math.round(Number(d.days)), total = Math.round(Number(d.total));
      if (!(days >= 1 && days <= 60) || !(total >= 100 && total <= 500000) || total / days > 50000) return out_({ ok: false, error: 'numbers' });
      const num = v => Math.max(0, Math.min(500000, Math.round(Number(v) || 0)));
      ss.getSheetByName('Reports').appendRow([new Date(), clean_(d.place, 80), clean_(d.from, 60), num(d.month), days, Math.max(1, Math.min(30, num(d.people))), total, num(d.travel), num(d.stay), num(d.food), clean_(d.tip, 300), '']);
      cache.remove('stats');
      return out_({ ok: true });
    }
    return out_({ ok: false, error: 'kind' });
  } catch (err) {
    return out_({ ok: false, error: 'server' });
  }
}

function doGet(e) {
  if (!e || !e.parameter || e.parameter.action !== 'stats') return out_({ ok: true });
  const cache = CacheService.getScriptCache();
  const hit = cache.get('stats');
  if (hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);
  const rows = book_().getSheetByName('Reports').getDataRange().getValues().slice(1);
  const by = {};
  rows.forEach(r => {
    if (r[11]) return;                                       // put anything in "Hidden" to leave a report out
    const place = String(r[1]).trim(), days = Number(r[4]), total = Number(r[6]);
    if (!place || !days || !total) return;
    (by[place] = by[place] || []).push({ days, perDay: total / days });
  });
  const res = {};
  Object.keys(by).forEach(p => {
    let list = by[p];
    if (list.length < MIN_REPORTS_TO_SHOW) return;
    const sorted = list.map(x => x.perDay).sort((a, b) => a - b);
    const med = sorted[Math.floor(sorted.length / 2)];
    list = list.filter(x => x.perDay <= med * 3 && x.perDay >= med / 3);   // drop wild outliers
    if (list.length < MIN_REPORTS_TO_SHOW) return;
    const avg = a => a.reduce((s, x) => s + x, 0) / a.length;
    res[p] = { n: list.length, perDay: Math.round(avg(list.map(x => x.perDay)) / 10) * 10, days: Math.round(avg(list.map(x => x.days)) * 10) / 10 };
  });
  const json = JSON.stringify(res);
  cache.put('stats', json, 600);
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

/* Optional: run this once from the editor (select "testSetup" and click Run) to check it works. */
function testSetup() {
  const enc = encrypt_({ hello: 'world' });
  Logger.log('Encryption round trip: ' + JSON.stringify(decrypt_(enc)));
  Logger.log('Emails you can still send today: ' + MailApp.getRemainingDailyQuota());
  ACC_(); SES_();
  Logger.log('Sheet: ' + book_().getUrl());
}
