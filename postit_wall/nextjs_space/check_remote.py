import pexpect
import sys

host = '45.43.152.18'
port = '25416'
password = 'Rr9hG@tC9SZT'

ssh_child = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no root@{host}', encoding='utf-8')
ssh_child.logfile = sys.stdout

try:
    ssh_child.expect('ssword:', timeout=10)
    ssh_child.sendline(password)
    ssh_child.expect('#', timeout=10)
    
    ssh_child.sendline('cat /var/www/panodasehir/app/page.tsx | grep "md:ml-12 ml-4"')
    ssh_child.expect('#', timeout=10)
    
    ssh_child.sendline('exit')
    ssh_child.expect(pexpect.EOF, timeout=10)
except Exception as e:
    print(f"Error: {e}")
