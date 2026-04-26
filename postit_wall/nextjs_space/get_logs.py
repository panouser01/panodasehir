import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('# ', timeout=30)
ssh.sendline('cat ~/.pm2/logs/panodasehir-out.log | grep -A 10 "PATCH POSTIT ZOD ERROR" | tail -n 50')
ssh.expect('# ', timeout=30)
ssh.sendline('exit')
ssh.expect(pexpect.EOF, timeout=10)
