import pexpect
import sys

ip = '45.43.152.18'
port = '25416'
pwd = 'Rr9hG@tC9SZT'

cmd = f"ssh -p {port} -o StrictHostKeyChecking=no root@{ip} 'ls -la /var/www/panodasehir/public/uploads | grep webp'"

child = pexpect.spawn(cmd, encoding='utf-8')
child.logfile_read = sys.stdout

try:
    child.expect('ssword:', timeout=10)
    child.sendline(pwd)
    child.expect(pexpect.EOF, timeout=30)
except Exception as e:
    pass
