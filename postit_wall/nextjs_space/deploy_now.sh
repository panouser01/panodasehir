#!/bin/bash
sshpass -p 'Rr9hG@tC9SZT' scp app/admin/page.tsx root@45.43.152.18:/var/www/panodasehir/app/admin/page.tsx
sshpass -p 'Rr9hG@tC9SZT' scp components/postit/postit-card.tsx root@45.43.152.18:/var/www/panodasehir/components/postit/postit-card.tsx
sshpass -p 'Rr9hG@tC9SZT' scp components/postit/ott-slider.tsx root@45.43.152.18:/var/www/panodasehir/components/postit/ott-slider.tsx
sshpass -p 'Rr9hG@tC9SZT' ssh root@45.43.152.18 'cd /var/www/panodasehir && npm run build && pm2 restart all'
echo 'Deployment successful!'
