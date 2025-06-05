#!/bin/bash
set -e

# Step 1 : initialize genesis block
echo "[+] Creating simulator DB" 
chia dev sim create <<< "g"

# step 2 : changing root to simulator
sleep 2
echo 'chainging chia_root to /root/.chia/simulator/main'
export CHIA_ROOT=/root/.chia/simulator/main

# Step 3 : Start chia sim
echo "[+] Starting simulator..."
chia dev sim start &
chia start wallet &

# Step 4 : restore ui packages, build & run ui server
sleep 2
echo "[+] Starting Next.js..."
npm install &&
npm run dev