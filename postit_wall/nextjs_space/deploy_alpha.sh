#!/bin/bash
sshpass -p 'Rr9hG@tC9SZT' scp prisma/schema.prisma root@45.43.152.18:/var/www/panodasehir/prisma/schema.prisma
sshpass -p 'Rr9hG@tC9SZT' scp app/api/categories/route.ts root@45.43.152.18:/var/www/panodasehir/app/api/categories/route.ts
sshpass -p 'Rr9hG@tC9SZT' scp app/api/categories/[id]/route.ts root@45.43.152.18:/var/www/panodasehir/app/api/categories/\[id\]/route.ts
sshpass -p 'Rr9hG@tC9SZT' scp app/api/settings/route.ts root@45.43.152.18:/var/www/panodasehir/app/api/settings/route.ts
sshpass -p 'Rr9hG@tC9SZT' scp app/page.tsx root@45.43.152.18:/var/www/panodasehir/app/page.tsx
sshpass -p 'Rr9hG@tC9SZT' scp components/postit/ott-slider.tsx root@45.43.152.18:/var/www/panodasehir/components/postit/ott-slider.tsx

sshpass -p 'Rr9hG@tC9SZT' ssh root@45.43.152.18 'cd /var/www/panodasehir && npx prisma db push && npm run build && pm2 restart all'
echo 'Deployment successful!'
