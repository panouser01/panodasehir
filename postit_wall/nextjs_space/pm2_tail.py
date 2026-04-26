import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('#', timeout=30)
ssh.sendline('tail -n 200 /root/.pm2/logs/panodasehir-out.log | grep -E "Error|error|404|500|Exception"')
ssh.expect('#', timeout=30)
print("PM2:", ssh.before)

ssh.sendline('tail -n 50 /var/log/nginx/error.log')
ssh.expect('#', timeout=30)
print("\nNGINX:", ssh.before)
ssh.sendline('exit')
