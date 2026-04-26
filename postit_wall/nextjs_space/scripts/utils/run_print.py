import pexpect

password = "Rr9hG@tC9SZT"

# Transfer file
child = pexpect.spawn('scp -P 25416 -o StrictHostKeyChecking=no print_db.js root@45.43.152.18:/var/www/panodasehir/', encoding='utf-8')
child.expect('[pP]assword:')
child.sendline(password)
child.expect(pexpect.EOF)

# Run file
child = pexpect.spawn('ssh -p 25416 -o StrictHostKeyChecking=no root@45.43.152.18', encoding='utf-8')
child.expect('[pP]assword:')
child.sendline(password)
child.expect('# ')
child.sendline('cd /var/www/panodasehir && node print_db.js')
child.expect('# ', timeout=30)
print(child.before)
child.sendline('exit')
