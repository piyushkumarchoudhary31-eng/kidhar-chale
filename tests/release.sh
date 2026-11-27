#!/bin/bash
# Build the site and run every check. Usage: bash release.sh
set -e
S=/tmp/claude-0/-home-claude/1d6d6033-5f43-54b1-b899-79f6ed6e4a1f/scratchpad
cd $S && python3 build-sa.py >/dev/null && cp /home/claude/standalone/index.html /home/claude/kidhar-chale/index.html && python3 sec/csp.py
pkill -f "node server.js" || true; sleep 0.5; (cd $S/acct && nohup node server.js > server.log 2>&1 &) ; sleep 1
echo "--- backend"; cd $S/acct && node unit.js | tail -1 && node unit-rooms.js && node unit-ai.js && node unit-mail.js && node unit-gems.js
echo "--- trip extras, gems, visa, money, booking flow"; python3 e2e-trip.py | grep -v '^ics' ; pkill -f "node server.js"; sleep 0.5; (nohup node server.js > server.log 2>&1 &); sleep 1; python3 e2e-gems.py; cd $S/qa && python3 visa-fx.py && python3 book.py | grep -v '^   ' ; cd $S/acct
echo "--- AI plans"; python3 e2e-ai.py
echo "--- accounts (2 devices)"; python3 e2e.py | grep -i "error\|sheet has\|signed out\|B trips after sign"
echo "--- group trips"; python3 e2e-rooms.py | grep -i "error\|after"
echo "--- attack tests"; python3 xss-room.py; cd $S/sec && python3 xss.py | grep -c "\[\]" 
echo "--- full check, features on"; cd $S/qa && python3 full.py --on | tail -4
echo "--- full check, live settings"; python3 full.py | tail -4
