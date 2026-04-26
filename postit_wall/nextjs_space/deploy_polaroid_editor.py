import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

files = [
    ('lib/utils.ts', '/var/www/panodasehir/lib/utils.ts'),
    ('components/postit/postit-card.tsx', '/var/www/panodasehir/components/postit/postit-card.tsx'),
    ('components/postit/ott-slider.tsx', '/var/www/panodasehir/components/postit/ott-slider.tsx'),
    ('components/forms/postit-form.tsx', '/var/www/panodasehir/components/forms/postit-form.tsx'),
    ('app/my-postits/page.tsx', '/var/www/panodasehir/app/my-postits/page.tsx'),
    ('app/api/postits/route.ts', '/var/www/panodasehir/app/api/postits/route.ts'),
    ('app/api/my-postits/[id]/route.ts', '/var/www/panodasehir/app/api/my-postits/[id]/route.ts'),
    ('components/postit/postit-masonry-grid.tsx', '/var/www/panodasehir/components/postit/postit-masonry-grid.tsx'),
    ('components/postit/ott-top-menu.tsx', '/var/www/panodasehir/components/postit/ott-top-menu.tsx'),
    ('app/page.tsx', '/var/www/panodasehir/app/page.tsx'),
    ('components/forms/mobile-postit-fab.tsx', '/var/www/panodasehir/components/forms/mobile-postit-fab.tsx')
]

for local, remote in files:
    print(f"Uploading {local} to {remote}...")
    scp = pexpect.spawn(f"scp -P {port} -o StrictHostKeyChecking=no '{local}' {target}:{remote}", encoding='utf-8')
    scp.logfile = sys.stdout
    scp.expect('ssword:', timeout=15)
    scp.sendline(password)
    scp.expect(pexpect.EOF, timeout=120)

print("Building and restarting server...")
ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('#', timeout=30)
ssh.sendline('cd /var/www/panodasehir && rm -rf .next/cache && npm run build && pm2 restart all')
ssh.expect('PM2.*online', timeout=300)
ssh.sendline('exit')
ssh.expect(pexpect.EOF, timeout=10)

print("Done.")
