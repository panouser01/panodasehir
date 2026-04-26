import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

print("Uploading my-postits page...")
scp = pexpect.spawn(f"scp -P {port} -o StrictHostKeyChecking=no 'app/my-postits/page.tsx' {target}:/var/www/panodasehir/app/my-postits/page.tsx", encoding='utf-8')
scp.expect('ssword:', timeout=15)
scp.sendline(password)
scp.expect(pexpect.EOF, timeout=120)

print("Uploading route files...")
scp2 = pexpect.spawn(f"scp -P {port} -o StrictHostKeyChecking=no 'app/api/my-postits/[id]/route.ts' {target}:'/var/www/panodasehir/app/api/my-postits/\\\\[id\\\\]/route.ts'", encoding='utf-8')
scp2.expect('ssword:', timeout=15)
scp2.sendline(password)
scp2.expect(pexpect.EOF, timeout=120)

scp3 = pexpect.spawn(f"scp -P {port} -o StrictHostKeyChecking=no 'app/api/my-postits/[id]/toggle-publish/route.ts' {target}:'/var/www/panodasehir/app/api/my-postits/\\\\[id\\\\]/toggle-publish/route.ts'", encoding='utf-8')
scp3.expect('ssword:', timeout=15)
scp3.sendline(password)
scp3.expect(pexpect.EOF, timeout=120)

print("Building and restarting...")
ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('# ', timeout=30)
ssh.sendline('cd /var/www/panodasehir && npm run build && pm2 restart all')
ssh.expect('PM2.*online', timeout=300)
ssh.sendline('exit')
