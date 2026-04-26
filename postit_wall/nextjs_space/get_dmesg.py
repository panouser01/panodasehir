import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('#', timeout=30)
ssh.sendline('dmesg -T | tail -n 20')
ssh.expect('#', timeout=30)
print(ssh.before)
ssh.sendline('exit')
