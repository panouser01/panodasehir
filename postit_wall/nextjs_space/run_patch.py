import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"
file = "patch_postits.js"

print("Uploading script via SCP...")
scp = pexpect.spawn(f"scp -P {port} -o StrictHostKeyChecking=no {file} {target}:/var/www/panodasehir/{file}", encoding='utf-8')
scp.logfile_read = sys.stdout
scp.expect('ssword:', timeout=15)
scp.sendline(password)
scp.expect(pexpect.EOF, timeout=120)

print("\nConnecting to execute script...")
ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.logfile_read = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('# ', timeout=30)
ssh.sendline('cd /var/www/panodasehir && node patch_postits.js')
ssh.expect('Migration completed successfully', timeout=300)
ssh.expect('# ', timeout=60)
ssh.sendline('exit')
print("\nExecution complete.")
