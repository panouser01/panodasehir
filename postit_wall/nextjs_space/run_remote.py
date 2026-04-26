import pexpect
import sys
import time

child = pexpect.spawn('ssh -p 25416 -o StrictHostKeyChecking=no root@45.43.152.18', encoding='utf-8')
child.logfile_read = sys.stdout

def run(cmd, timeout=30):
    child.sendline(cmd)
    child.expect('#', timeout=timeout)

try:
    child.expect('ssword:', timeout=10)
    child.sendline('Rr9hG@tC9SZT')
    child.expect('#', timeout=10)
    
    run('cd /var/www/panodasehir')
    print("Extracting tar...")
    run('tar -xzvf update-final-features.tar.gz', timeout=30)
    print("Running prisma dx push...")
    run('npx prisma db push', timeout=60)
    print("Building nextjs project...")
    run('npm run build', timeout=300)
    print("Restarting pm2...")
    run('pm2 restart panodasehir || pm2 restart all')
    
    child.sendline('exit')
    child.expect(pexpect.EOF)
except Exception as e:
    print(f"Error occurred: {e}")

