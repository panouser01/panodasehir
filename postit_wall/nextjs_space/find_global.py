import sys
import pexpect

cmd = "ssh -p 25416 -o StrictHostKeyChecking=no root@45.43.152.18 'find / -name \"*ddcad30b*\" 2>/dev/null'"
child = pexpect.spawn(cmd, encoding='utf-8')
child.logfile_read = sys.stdout

try:
    child.expect('ssword:', timeout=10)
    child.sendline('Rr9hG@tC9SZT')
    child.expect(pexpect.EOF, timeout=120)
except Exception as e:
    pass
