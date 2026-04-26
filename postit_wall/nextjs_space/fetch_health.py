import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('# ', timeout=15)

ssh.sendline('cat /proc/loadavg')
ssh.expect('# ', timeout=30)
print("Load Average:\n" + ssh.before)

ssh.sendline('free -m')
ssh.expect('# ', timeout=30)
print("Memory:\n" + ssh.before)

ssh.sendline('pm2 monit') # Can't do interactive pm2 monit, so pm2 ls
ssh.expect('# ', timeout=30)
ssh.sendline('pm2 ls')
ssh.expect('# ', timeout=30)
print("PM2:\n" + ssh.before)

ssh.sendline('exit')
