import sys
import pexpect

# First create the tar file locally
import os
os.system("tar -czf update_navbar.tar.gz components/layout/navbar.tsx")

# Upload the file
cmd1 = "scp -P 25416 -o StrictHostKeyChecking=no update_navbar.tar.gz root@45.43.152.18:/var/www/panodasehir/"
child1 = pexpect.spawn(cmd1, encoding='utf-8')
child1.logfile_read = sys.stdout
child1.expect('ssword:', timeout=10)
child1.sendline('Rr9hG@tC9SZT')
child1.expect(pexpect.EOF, timeout=120)

# Extract, build and run
cmd2 = "ssh -p 25416 -o StrictHostKeyChecking=no root@45.43.152.18 'cd /var/www/panodasehir && tar -xzf update_navbar.tar.gz && npm run build && pm2 restart all'"
child2 = pexpect.spawn(cmd2, encoding='utf-8')
child2.logfile_read = sys.stdout
child2.expect('ssword:', timeout=10)
child2.sendline('Rr9hG@tC9SZT')
child2.expect(pexpect.EOF, timeout=300)
