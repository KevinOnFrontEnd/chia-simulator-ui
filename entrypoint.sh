#!/bin/bash
set -e

echo "[+] Creating simulator DB"
chia dev sim create <<< "g"

sleep 2
echo 'chainging chia_root to /root/.chia/simulator/main'
export CHIA_ROOT=/root/.chia/simulator/main

echo "[+] Starting simulator..."

chia dev sim start &

chia start wallet &


# Step 5: Start Next.js
sleep 2
echo "[+] Starting Next.js..."
npm install &&
npm run dev
