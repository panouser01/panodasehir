import pexpect
password = "Rr9hG@tC9SZT"

child = pexpect.spawn('ssh -p 25416 -o StrictHostKeyChecking=no root@85.159.66.93', encoding='utf-8')
try:
    i = child.expect(['[pP]assword:', pexpect.EOF, pexpect.TIMEOUT], timeout=15)
    if i == 0:
        child.sendline(password)
        child.expect('# ', timeout=15)
        child.sendline('cat /etc/os-release')
        child.expect('# ')
        print("Connected! Output:", child.before)
        child.sendline('exit')
    else:
        print("Failed to connect or timeout:", child.before)
except Exception as e:
    print("Error:", e)
