import pexpect

password = "Rr9hG@tC9SZT"

child = pexpect.spawn('ssh -p 25416 -o StrictHostKeyChecking=no root@45.43.152.18', encoding='utf-8')
child.expect('[pP]assword:')
child.sendline(password)
child.expect('# ')
child.sendline('pm2 logs panodasehir --lines 100 --nostream')
child.expect('# ')
print(child.before)
child.sendline('exit')
