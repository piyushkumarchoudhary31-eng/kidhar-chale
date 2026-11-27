#!/bin/bash
# Build the site and run every check. Usage: bash release.sh
set -e
S=/tmp/claude-0/-home-claude/1d6d6033-5f43-54b1-b899-79f6ed6e4a1f/scratchpad
cd $S && python3 build-sa.py >/dev/null && cp /home/claude/standalone/index.html /home/claude/kidhar-chale/index.html && python3 sec/csp.py
pgrep -f "node server.js" >/dev/null || (cd $S/acct && nohup node server.js > server.log 2>&1 &) ; sleep 1
echo "--- backend"; cd $S/acct && node unit.js | tail -1 && node unit-rooms.js
echo "--- accounts (2 devices)"; python3 e2e.py | grep -i "error\|sheet has\|signed out\|B trips after sign"
echo "--- group trips"; python3 e2e-rooms.py | grep -i "error\|after"
echo "--- attack tests"; python3 xss-room.py; cd $S/sec && python3 xss.py | grep -c "\[\]" 
echo "--- full check, features on"; cd $S/qa && python3 full.py --on | tail -4
echo "--- full check, live settings"; python3 full.py | tail -4
