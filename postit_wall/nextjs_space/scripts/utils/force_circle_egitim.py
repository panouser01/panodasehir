import pexpect
password = "Rr9hG@tC9SZT"

child = pexpect.spawn('scp -P 25416 -o StrictHostKeyChecking=no tmp_db_shape2.js root@45.43.152.18:/var/www/panodasehir/', encoding='utf-8')
child.expect('[pP]assword:')
child.sendline(password)
child.expect(pexpect.EOF)

child = pexpect.spawn('ssh -p 25416 -o StrictHostKeyChecking=no root@45.43.152.18', encoding='utf-8')
child.expect('[pP]assword:')
child.sendline(password)
child.expect('# ')
child.sendline('cd /var/www/panodasehir && node tmp_db_shape2.js')
child.expect('# ', timeout=30)
print(child.before)
child.sendline('exit')
