import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"

print("Uploading seeder...")
scp = pexpect.spawn(f"scp -P 25416 -o StrictHostKeyChecking=no ./seed_merchants.cjs {target}:/var/www/panodasehir/seed_merchants.cjs", encoding='utf-8')
scp.logfile = sys.stdout
scp.expect('ssword:', timeout=15)
scp.sendline(password)
scp.expect(pexpect.EOF, timeout=120)

print("Running seeder...")
ssh = pexpect.spawn(f"ssh -p 25416 -o StrictHostKeyChecking=no {target}", encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('# ', timeout=30)
ssh.sendline('cd /var/www/panodasehir && node seed_merchants.cjs')
ssh.expect('# ', timeout=60)
ssh.sendline('exit')
print("Done!")
