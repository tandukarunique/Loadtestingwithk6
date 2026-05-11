#!/usr/bin/env bash
set -euo pipefail

browser_path="${K6_BROWSER_EXECUTABLE_PATH:-${CHROME_EXECUTABLE_PATH:-/usr/bin/google-chrome}}"

exec k6 run -e "K6_BROWSER_EXECUTABLE_PATH=${browser_path}" "$@" multiplemsg.js
