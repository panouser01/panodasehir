import pexpect
import sys

# Get the cwd of the Next.js process!
cmd = """ssh -p 25416 -o StrictHostKeyChecking=no root@45.43.152.18 'pwdx $(pgrep -f "next-server" | head -n 1)'"""
child = pexpect.spawn(cmd, encoding='utf-8')
child.logfile_read = sys.stdout

try:
    child.expect('ssword:', timeout=10)
    child.sendline('Rr9hG@tC9SZT')
    child.expect(pexpect.EOF, timeout=30)
except Exception as e:
    pass
