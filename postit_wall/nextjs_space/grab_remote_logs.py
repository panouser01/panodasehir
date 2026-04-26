import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

# SSH and run command
ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('#', timeout=30)
# Create the logs file on remote server
cmd = "tail -n 100 /var/log/nginx/error.log > /tmp/remote_logs.txt && pm2 logs panodasehir --nostream --lines 50 >> /tmp/remote_logs.txt"
ssh.sendline(cmd)
ssh.expect('#', timeout=30)
ssh.sendline('exit')

# SCP the file back
scp = pexpect.spawn(f"scp -P {port} -o StrictHostKeyChecking=no {target}:/tmp/remote_logs.txt ./remote_logs.txt", encoding='utf-8')
scp.expect('ssword:', timeout=15)
scp.sendline(password)
scp.expect(pexpect.EOF, timeout=30)

print("Logs downloaded to remote_logs.txt")
