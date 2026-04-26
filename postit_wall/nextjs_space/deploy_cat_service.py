import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

print("Uploading to server...")
scp = pexpect.spawn(f"scp -P {port} -o StrictHostKeyChecking=no 'lib/services/category.service.ts' {target}:/var/www/panodasehir/lib/services/category.service.ts", encoding='utf-8')
scp.logfile = sys.stdout
scp.expect('ssword:', timeout=15)
scp.sendline(password)
scp.expect(pexpect.EOF, timeout=120)

print("Clearing cache and restarting...")
ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('# ', timeout=30)
# Clear the cache and restart
ssh.sendline('cd /var/www/panodasehir && rm -rf .next/cache && npm run build && pm2 restart all')
ssh.expect('PM2.*online', timeout=300)
ssh.sendline('exit')
