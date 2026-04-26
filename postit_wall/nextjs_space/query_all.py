import sys
import pexpect

cmd1 = "ssh -p 25416 -o StrictHostKeyChecking=no root@45.43.152.18 \"mysql -u root -p'Rr9hG@tC9SZT' panodasehir -e 'SELECT id, title, images FROM Article WHERE JSON_LENGTH(images) > 0 ORDER BY createdAt DESC LIMIT 5;'\""
child1 = pexpect.spawn(cmd1, encoding='utf-8')
child1.logfile_read = sys.stdout
child1.expect('ssword:', timeout=10)
child1.sendline('Rr9hG@tC9SZT')
child1.expect(pexpect.EOF, timeout=120)
