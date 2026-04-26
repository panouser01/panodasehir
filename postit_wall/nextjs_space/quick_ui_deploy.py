import os
import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"

print("Uploading app/admin/page.tsx...")
scp = pexpect.spawn(f"scp -P 25416 -o StrictHostKeyChecking=no app/admin/page.tsx {target}:/var/www/panodasehir/app/admin/page.tsx")
scp.expect('ssword:', timeout=15)
scp.sendline(password)
scp.expect(pexpect.EOF, timeout=120)

print("Building remotely...")
ssh = pexpect.spawn(f"ssh -p 25416 -o StrictHostKeyChecking=no {target}", encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('# ', timeout=30)
ssh.sendline('cd /var/www/panodasehir && npm run build')
ssh.expect('# ', timeout=300)
ssh.sendline('pm2 restart all')
ssh.expect('# ', timeout=30)
ssh.sendline('exit')
print("Deploy finished!")
