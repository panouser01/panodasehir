import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('#', timeout=30)
ssh.sendline('pm2 logs panodasehir --lines 50')
ssh.expect('#', timeout=30)
ssh.sendline('tail -n 50 /var/log/nginx/access.log | grep -E "GET .*(jpg|jpeg|png|webp|avif)"')
ssh.expect('#', timeout=30)
ssh.sendline('tail -n 50 /var/log/nginx/error.log')
ssh.expect('#', timeout=30)
ssh.sendline('exit')
