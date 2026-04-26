import pexpect
import sys
import time

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

# Create remote dir first
print("Creating remote directory...")
ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('# ', timeout=30)
ssh.sendline('mkdir -p /var/www/panodasehir/app/api/categories/copy')
ssh.expect('# ', timeout=10)
ssh.sendline('exit')
ssh.expect(pexpect.EOF, timeout=10)

files = [
    ('app/admin/page.tsx', '/var/www/panodasehir/app/admin/page.tsx'),
    ('app/api/categories/copy/route.ts', '/var/www/panodasehir/app/api/categories/copy/route.ts')
]

for local, remote in files:
    print(f"Uploading {local}...")
    scp = pexpect.spawn(f'scp -P {port} -o StrictHostKeyChecking=no "{local}" "{target}:{remote}"', encoding='utf-8')
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
ssh.sendline('cd /var/www/panodasehir && npm run build')
ssh.expect('# ', timeout=300)
ssh.sendline('pm2 restart all')
ssh.expect('online', timeout=40)
ssh.sendline('exit')
ssh.expect(pexpect.EOF, timeout=10)

print("Exit code:", ssh.exitstatus)
