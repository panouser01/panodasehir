import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

print("Uploading fix...")
scp = pexpect.spawn(f'scp -P {port} -o StrictHostKeyChecking=no app/page.tsx {target}:/var/www/panodasehir/app/page.tsx', encoding='utf-8')
scp.logfile = sys.stdout
scp.expect(['ssword:', pexpect.EOF], timeout=15)
scp.sendline(password)
scp.expect(pexpect.EOF, timeout=120)

print("Restarting server...")
ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=10)
ssh.sendline(password)
ssh.expect('#', timeout=10)
ssh.sendline("cd /var/www/panodasehir && npm run build && pm2 restart all")
ssh.expect('#', timeout=600)
ssh.sendline('exit')
ssh.expect(pexpect.EOF)
