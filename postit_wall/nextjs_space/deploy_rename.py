import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"
remote_dir = "/var/www/panodasehir"

print("Uploading rename_cat.js...")
scp = pexpect.spawn(f'scp -P {port} -o StrictHostKeyChecking=no "rename_cat.js" "{target}:{remote_dir}/rename_cat.js"', encoding='utf-8')
scp.logfile = sys.stdout
scp.expect('ssword:', timeout=15)
scp.sendline(password)
scp.expect(pexpect.EOF, timeout=120)

print("Running script on server...")
ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('# ', timeout=30)
ssh.sendline(f'cd {remote_dir} && node rename_cat.js')
ssh.expect('# ', timeout=60)
ssh.sendline(f'rm -f rename_cat.js')
ssh.expect('# ', timeout=10)
ssh.sendline('exit')
ssh.expect(pexpect.EOF, timeout=10)
