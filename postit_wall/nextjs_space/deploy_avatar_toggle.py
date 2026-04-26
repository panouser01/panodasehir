import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

print("Uploading prisma schema...")
scp = pexpect.spawn(f"scp -P {port} -o StrictHostKeyChecking=no 'prisma/schema.prisma' {target}:/var/www/panodasehir/prisma/schema.prisma", encoding='utf-8')
scp.expect('ssword:', timeout=15)
scp.sendline(password)
scp.expect(pexpect.EOF, timeout=120)

print("Uploading profile page...")
scp2 = pexpect.spawn(f"scp -P {port} -o StrictHostKeyChecking=no 'app/profile/page.tsx' {target}:/var/www/panodasehir/app/profile/page.tsx", encoding='utf-8')
scp2.expect('ssword:', timeout=15)
scp2.sendline(password)
scp2.expect(pexpect.EOF, timeout=120)

print("Uploading route files...")
scp3 = pexpect.spawn(f"scp -P {port} -o StrictHostKeyChecking=no 'app/api/profile/route.ts' {target}:/var/www/panodasehir/app/api/profile/route.ts", encoding='utf-8')
scp3.expect('ssword:', timeout=15)
scp3.sendline(password)
scp3.expect(pexpect.EOF, timeout=120)

scp4 = pexpect.spawn(f"scp -P {port} -o StrictHostKeyChecking=no 'app/api/postits/route.ts' {target}:/var/www/panodasehir/app/api/postits/route.ts", encoding='utf-8')
scp4.expect('ssword:', timeout=15)
scp4.sendline(password)
scp4.expect(pexpect.EOF, timeout=120)

print("Building and restarting...")
ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('# ', timeout=30)
ssh.sendline('cd /var/www/panodasehir && npx prisma db push && npm run build && pm2 restart all')
ssh.expect('PM2.*online', timeout=300)
ssh.sendline('exit')
