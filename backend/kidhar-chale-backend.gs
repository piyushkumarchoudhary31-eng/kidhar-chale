/**
 * Kidhar Chale? backend: feedback and real-cost reports, stored in a Google Sheet.
 *
 * Setup (about 5 minutes, free):
 * 1. Go to https://script.google.com and click "New project".
 * 2. Delete what is there, paste this whole file, and click Save.
 * 3. Click Deploy > New deployment > Select type: Web app.
 *    Description: Kidhar Chale. Execute as: Me. Who has access: Anyone.
 * 4. Click Deploy and allow the permissions Google asks for (it needs your Sheets and to send you email).
 * 5. Copy the "Web app URL" (it ends in /exec) and send it to Claude.
 *
 * The first message creates a Google Sheet called "Kidhar Chale data" in your Drive.
 * New feedback is also emailed to you. Reports show on the site only as averages,
 * and only once a place has at least 3 reports.
 */

const SHEET_NAME = 'Kidhar Chale data';
const MAX_PER_HOUR = 120;           // simple flood guard across the whole site
const MIN_REPORTS_TO_SHOW = 3;

function book_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('sheetId');
  let ss = id ? SpreadsheetApp.openById(id) : null;
  if (!ss) {
    ss = SpreadsheetApp.create(SHEET_NAME);
    props.setProperty('sheetId', ss.getId());
    ss.getSheets()[0].setName('Reports').appendRow(['Time', 'Place', 'From', 'Month', 'Days', 'People', 'Total per person', 'Travel', 'Stay', 'Food', 'Tip', 'Hidden']);
    ss.insertSheet('Feedback').appendRow(['Time', 'Type', 'Message', 'Contact', 'Page']);
  }
  return ss;
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function clean_(s, max) {
  return String(s || '').replace(/[\u0000-\u001f]/g, ' ').replace(/^[=+\-@]/, "'").trim().slice(0, max);
}

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
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
    return out_({ ok: false, error: 'bad request' });
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
