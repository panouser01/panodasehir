import pexpect
import sys

password = "Rr9hG@tC9SZT"
ip = "45.43.152.18"
port = "25416"

print("Uploading fix_ads.js...")
child = pexpect.spawn(f'scp -P {port} -o StrictHostKeyChecking=no fix_ads.js root@{ip}:"/var/www/panodasehir/"', encoding='utf-8', timeout=60)
idx = child.expect(['(?i)password:', pexpect.EOF, pexpect.TIMEOUT])
if idx == 0:
    child.sendline(password)
    child.expect(pexpect.EOF)

print("Connecting to run fix_ads.js...")
ssh = pexpect.spawn(f"ssh -p {port} -o StrictHostKeyChecking=no root@{ip}", encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect(['(?i)password:', '# '])
if ssh.after != '# ':
    ssh.sendline(password)
    ssh.expect('# ')

ssh.sendline("cd /var/www/panodasehir")
ssh.expect('# ')
ssh.sendline("node fix_ads.js")
ssh.expect('# ', timeout=30)
print("Done fixing ads.")
ssh.sendline("exit")
sys.exit(0)
