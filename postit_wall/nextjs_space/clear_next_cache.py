import pexpect

password = "Rr9hG@tC9SZT"

child = pexpect.spawn('ssh -p 25416 -o StrictHostKeyChecking=no root@45.43.152.18', encoding='utf-8')
child.expect('[pP]assword:')
child.sendline(password)
child.expect('# ')
child.sendline('cd /var/www/panodasehir && rm -rf .next && npm run build')
child.expect('Compiled successfully', timeout=300)
child.expect('# ', timeout=300)
child.sendline('pm2 restart panodasehir')
child.expect('# ', timeout=30)
print(child.before)
child.sendline('exit')
