#!/bin/bash
set -e

echo "[+] Creating simulator DB"
chia dev sim create <<< ""

# # Step 4: Start simulator in background
# echo "[+] Starting simulator..."
chia dev sim start &

chia start wallet &


# Step 5: Start Next.js
sleep 2
echo "[+] Starting Next.js..."
npm run dev
