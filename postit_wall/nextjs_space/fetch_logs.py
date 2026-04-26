import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('# ', timeout=15)
ssh.sendline('echo "--- TOP 20 ---" && top -b -n 1 | head -n 20')
ssh.expect('# ', timeout=30)
ssh.sendline('echo "--- FREE MEMORY ---" && free -m')
ssh.expect('# ', timeout=30)
ssh.sendline('echo "--- PM2 STATUS ---" && pm2 status')
ssh.expect('# ', timeout=30)
ssh.sendline('echo "--- NODE JS LOGS (Last 50) ---" && pm2 logs panodasehir --lines 50 --nostream')
ssh.expect('# ', timeout=30)
ssh.sendline('exit')
