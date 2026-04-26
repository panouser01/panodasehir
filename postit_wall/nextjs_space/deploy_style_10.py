import pexpect
import sys

print("Uploading...")
scp = pexpect.spawn('scp -P 25416 -o StrictHostKeyChecking=no update-style-10.tar.gz root@45.43.152.18:/var/www/panodasehir/', encoding='utf-8')
scp.logfile = sys.stdout
scp.expect('ssword:', timeout=10)
scp.sendline('Rr9hG@tC9SZT')
scp.expect(pexpect.EOF, timeout=120)

print("\nExtracting & building...")
child = pexpect.spawn('ssh -p 25416 -o StrictHostKeyChecking=no root@45.43.152.18', encoding='utf-8')
child.logfile = sys.stdout

try:
    child.expect('ssword:', timeout=10)
    child.sendline('Rr9hG@tC9SZT')
    child.expect('#', timeout=10)
    one_liner = "cd /var/www/panodasehir && tar -xzvf update-style-10.tar.gz && npm run build && pm2 restart all"
    child.sendline(one_liner)
    child.expect('#', timeout=600)
    child.sendline('exit')
except Exception as e:
    print(f"Error: {e}")
