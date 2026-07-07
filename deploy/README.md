# Deploying Wotchlist

Wotchlist runs on the same VPS as TWG HUB but is fully isolated: its own
folder, database, PM2 process, and Nginx block. No shared config or
GitHub Actions workflow.

## One-time server setup

```bash
cd /var/www
git clone https://github.com/metanym/wotchlist.git wotchlist
cd wotchlist

nano .env   # populate from .env.example

psql -U postgres -c "CREATE DATABASE wotchlist_db;"

npm install
npx prisma db push
npx prisma generate

NODE_OPTIONS="--max-old-space-size=4096" npm run build

pm2 start npm --name "wotchlist" -- start -- -p 3005
pm2 save
```

Enable Nginx + TLS:

```bash
ln -s /path/to/repo/deploy/nginx.conf /etc/nginx/sites-enabled/wotchlist
nginx -t
systemctl reload nginx
certbot --nginx -d wotchlist.com -d www.wotchlist.com
```

## Routine deployment

From the project root on the VPS:

```bash
./deploy.sh
```

This pulls, installs, re-runs `prisma db push`/`generate` only when
`prisma/schema.prisma` changed in the pulled commits, rebuilds, and
restarts the `wotchlist` PM2 process.
