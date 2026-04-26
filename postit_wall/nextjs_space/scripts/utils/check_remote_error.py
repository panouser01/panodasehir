import pexpect
import sys

password = "Rr9hG@tC9SZT"
ip = "45.43.152.18"
port = "25416"

print("Checking remote PM2 logs...")
child = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no root@{ip} "pm2 logs panodasehir --lines 50"', encoding='utf-8', timeout=60)
idx = child.expect(['(?i)password:', pexpect.EOF, pexpect.TIMEOUT])
if idx == 0:
    child.sendline(password)
    child.expect(pexpect.EOF)
    print("OUTPUT:")
    print(child.before)
else:
    print("Unexpected SSH output")
