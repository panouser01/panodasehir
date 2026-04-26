import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"
remote_dir = "/var/www/panodasehir"

print(f"Uploading app/api/categories recursively...")
scp = pexpect.spawn(f'scp -r -P {port} -o StrictHostKeyChecking=no "app/api/categories" "{target}:{remote_dir}/app/api/"', encoding='utf-8')
scp.logfile = sys.stdout
scp.expect('ssword:', timeout=15)
scp.sendline(password)
scp.expect(pexpect.EOF, timeout=120)

print("Building and restarting server...")
ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('# ', timeout=30)
ssh.sendline(f'cd {remote_dir} && npm run build')
ssh.expect('# ', timeout=300)
ssh.sendline('pm2 restart all')
ssh.expect('# ', timeout=30)
ssh.sendline('exit')
ssh.expect(pexpect.EOF, timeout=10)
