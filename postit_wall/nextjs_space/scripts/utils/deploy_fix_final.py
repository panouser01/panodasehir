import pexpect
import sys

password = "Rr9hG@tC9SZT"
ip = "45.43.152.18"
port = "25416"

files = [
    ("app/page.tsx", "/var/www/panodasehir/app/page.tsx"),
    ("components/postit/link-preview.tsx", "/var/www/panodasehir/components/postit/link-preview.tsx")
]

print("Uploading files...")
for local_file, remote_file in files:
    print(f"Uploading {local_file} to {remote_file}")
    child = pexpect.spawn(f'scp -P {port} -o StrictHostKeyChecking=no {local_file} root@{ip}:"{remote_file}"', encoding='utf-8', timeout=600)
    idx = child.expect(['(?i)password:', pexpect.EOF, pexpect.TIMEOUT])
    if idx == 0:
        child.sendline(password)
        child.expect(pexpect.EOF)
    elif idx == 2:
        print("Timeout in SCP")
        sys.exit(1)
    print(f"Uploading {local_file} Done output: {child.before}")

print("Connecting to SSH to build...")
ssh = pexpect.spawn(f"ssh -p {port} -o StrictHostKeyChecking=no root@{ip}", encoding='utf-8')
ssh.expect(['(?i)password:', '# '])
if ssh.after != '# ':
    ssh.sendline(password)
    ssh.expect('# ')

ssh.sendline("cd /var/www/panodasehir")
ssh.expect('# ')

print("Running npm run build...")
ssh.sendline("npm run build")
ssh.expect('# ', timeout=300)
print("Build Done")

print("Restarting PM2...")
ssh.sendline("pm2 restart panodasehir")
ssh.expect('# ', timeout=30)
print("Deployed.")
ssh.sendline("exit")
sys.exit(0)
