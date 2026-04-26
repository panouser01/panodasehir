import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"
remote_dir = "/var/www/panodasehir"

files = [
    ('components/postit/ott-slider.tsx', f'{remote_dir}/components/postit/ott-slider.tsx'),
    ('components/postit/postit-card.tsx', f'{remote_dir}/components/postit/postit-card.tsx'),
    ('components/postit/postit-masonry-grid.tsx', f'{remote_dir}/components/postit/postit-masonry-grid.tsx')
]

for local, remote in files:
    print(f"Uploading {local} to {remote}...")
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
ssh.sendline(f'cd {remote_dir} && npm run build')
ssh.expect('# ', timeout=600)
ssh.sendline('pm2 restart all')
ssh.expect('online', timeout=180)
ssh.sendline('exit')
ssh.expect(pexpect.EOF, timeout=10)

print("Exit code:", ssh.exitstatus)
