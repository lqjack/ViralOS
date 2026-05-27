#!/usr/bin/env bash
if [[ "$(uname -s)" != "Linux" ]]; then
  echo "[error] This script must run on Linux (Ubuntu). From macOS use: npm run deploy:ubuntu:sync"
  exit 1
fi
