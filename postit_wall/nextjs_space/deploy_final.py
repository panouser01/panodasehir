import pexpect
import sys
import time

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

print("Starting deployment...")

# 1. SCP the tar file
print("Uploading tar file...")
scp_child = pexpect.spawn(f'scp -P {port} -o StrictHostKeyChecking=no update_magazine_style.tar.gz {target}:/var/www/panodasehir/', encoding='utf-8')
scp_child.logfile = sys.stdout

try:
    index = scp_child.expect(['ssword:', pexpect.EOF], timeout=15)
    if index == 0:
        scp_child.sendline(password)
        scp_child.expect(pexpect.EOF, timeout=120)
    print("Upload complete!")
except Exception as e:
    print(f"SCP Error: {e}")

# 2. SSH and run build commands
print("Connecting via SSH to build and restart...")
ssh_child = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh_child.logfile = sys.stdout

try:
    ssh_child.expect('ssword:', timeout=10)
    ssh_child.sendline(password)
    ssh_child.expect('#', timeout=10)
    
    cmd = "cd /var/www/panodasehir && tar -xzf update_magazine_style.tar.gz && rm -rf scratch scratch.tsx && npx prisma generate && npx prisma db push --accept-data-loss && npm run build && pm2 restart all"
    ssh_child.sendline(cmd)
    
    ssh_child.expect('#', timeout=600)  # Wait up to 10 mins for build
    print("Deployment and restart complete!")
    ssh_child.sendline('exit')
    ssh_child.expect(pexpect.EOF)
except Exception as e:
    print(f"SSH Error: {e}")

