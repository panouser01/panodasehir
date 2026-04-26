import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

files = [
    ('components/editor/ArticleGrid.tsx', '/var/www/panodasehir/components/editor/ArticleGrid.tsx')
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
ssh.expect('# ', timeout=30)
ssh.sendline('cd /var/www/panodasehir && npm run build && pm2 restart all')
ssh.expect('PM2.*online', timeout=300)
ssh.sendline('exit')
ssh.expect(pexpect.EOF, timeout=10)

print("Exit status:", ssh.exitstatus)
