import os
import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"

print("Uploading app/admin/page.tsx...")
scp1 = pexpect.spawn(f"scp -P 25416 -o StrictHostKeyChecking=no app/admin/page.tsx {target}:/var/www/panodasehir/app/admin/page.tsx")
scp1.expect('ssword:', timeout=15)
scp1.sendline(password)
scp1.expect(pexpect.EOF, timeout=120)

print("Uploading app/api/admin/merchant-applications/[id]/route.ts...")
ssh1 = pexpect.spawn(f"ssh -p 25416 -o StrictHostKeyChecking=no {target}", encoding='utf-8')
ssh1.expect('ssword:')
ssh1.sendline(password)
ssh1.expect('# ')
ssh1.sendline('mkdir -p "/var/www/panodasehir/app/api/admin/merchant-applications/[id]"')
ssh1.expect('# ')
ssh1.sendline('exit')

scp2 = pexpect.spawn(f"scp -P 25416 -o StrictHostKeyChecking=no \"app/api/admin/merchant-applications/[id]/route.ts\" {target}:\"/var/www/panodasehir/app/api/admin/merchant-applications/[id]/route.ts\"")
scp2.expect('ssword:', timeout=15)
scp2.sendline(password)
scp2.expect(pexpect.EOF, timeout=120)

print("Building remotely...")
ssh2 = pexpect.spawn(f"ssh -p 25416 -o StrictHostKeyChecking=no {target}", encoding='utf-8')
ssh2.logfile = sys.stdout
ssh2.expect('ssword:', timeout=15)
ssh2.sendline(password)
ssh2.expect('# ', timeout=30)
ssh2.sendline('cd /var/www/panodasehir && npm run build')
ssh2.expect('# ', timeout=300)
ssh2.sendline('pm2 restart all')
ssh2.expect('# ', timeout=30)
ssh2.sendline('exit')
print("Deploy finished!")
