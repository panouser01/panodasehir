import pexpect
import sys

child = pexpect.spawn('ssh -p 25416 -o StrictHostKeyChecking=no root@45.43.152.18', encoding='utf-8')
child.logfile = sys.stdout

def run(cmd, timeout=30):
    print(f"Executing: {cmd}")
    child.sendline(cmd)
    child.expect('#', timeout=timeout)

try:
    child.expect('ssword:', timeout=10)
    child.sendline('Rr9hG@tC9SZT')
    child.expect('#', timeout=10)
    
    # Send a massive one-liner to avoid timeout breaks waiting for prompts mid-build
    one_liner = "cd /var/www/panodasehir && tar -xzvf update-final-features.tar.gz && npx prisma db push && npm run build && pm2 restart all"
    print(f"Executing full build script...")
    child.sendline(one_liner)
    # Give it 600 seconds to build
    child.expect('#', timeout=600)
    print("Done building and restarting.")
    child.sendline('exit')
except Exception as e:
    print(f"Error occurred: {e}")

