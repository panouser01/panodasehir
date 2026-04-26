import pexpect
import sys

cmd = "ssh -p 25416 -o StrictHostKeyChecking=no root@45.43.152.18 'find /var/www/panodasehir -name ddcad30b-d095-4993-9df7-79a95968f264-bulki.webp'"
child = pexpect.spawn(cmd, encoding='utf-8')
child.logfile_read = sys.stdout

try:
    child.expect('ssword:', timeout=10)
    child.sendline('Rr9hG@tC9SZT')
    child.expect(pexpect.EOF, timeout=120)
except Exception as e:
    pass
