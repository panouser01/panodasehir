import pexpect
import sys

print("Uzaktan build komutu basliyor...")
cmd = "ssh -p 25416 -o StrictHostKeyChecking=no root@45.43.152.18 'cd /var/www/panodasehir && npm run build && pm2 restart all'"
ssh = pexpect.spawn(cmd, encoding='utf-8', timeout=300)
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline('Rr9hG@tC9SZT')
ssh.expect(pexpect.EOF, timeout=300)
print("\nIslem tamamlandi!")
