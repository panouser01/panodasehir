import sys
import pexpect

cmd1 = "ssh -p 25416 -o StrictHostKeyChecking=no root@45.43.152.18 'find /var/www/panodasehir -name \"4bb24f34*\"'"
child1 = pexpect.spawn(cmd1, encoding='utf-8')
child1.logfile_read = sys.stdout
child1.expect('ssword:', timeout=10)
child1.sendline('Rr9hG@tC9SZT')
child1.expect(pexpect.EOF, timeout=120)
