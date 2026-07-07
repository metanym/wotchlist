#!/bin/bash
set -euo pipefail

cd /var/www/wotchlist
git pull
npm install

if git diff --name-only HEAD@{1} HEAD | grep -q '^prisma/schema.prisma'; then
  npx prisma db push
  npx prisma generate
fi

NODE_OPTIONS="--max-old-space-size=4096" npm run build
pm2 restart wotchlist
echo "✓ Wotchlist deployed successfully."
