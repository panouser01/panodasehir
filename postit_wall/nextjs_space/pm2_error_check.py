import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('#', timeout=30)
ssh.sendline('pm2 logs panodasehir --nostream --lines 200 > /tmp/pm2out.txt && cat /tmp/pm2out.txt | grep -E -i "error|warn|exception|sharp|fail|404|500" | tail -n 40')
ssh.expect('#', timeout=30)
output = ssh.before
ssh.sendline('exit')
print(output)
