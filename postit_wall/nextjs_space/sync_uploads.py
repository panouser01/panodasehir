import os
import pexpect
import sys

ip = '45.43.152.18'
port = '25416'
pwd = 'Rr9hG@tC9SZT'
local_dir = '/home/izzetyasin/Desktop/Geliştirme/panodasehir/postit_wall/nextjs_space/public/uploads/'
remote_dir = '/var/www/panodasehir/public/uploads/'

print("Syncing local uploads to live server...")
cmd = f"rsync -avz -e 'ssh -p {port} -o StrictHostKeyChecking=no' {local_dir} root@{ip}:{remote_dir}"

child = pexpect.spawn(cmd, encoding='utf-8')
child.logfile_read = sys.stdout

try:
    child.expect('ssword:', timeout=10)
    child.sendline(pwd)
    child.expect(pexpect.EOF, timeout=120)
except Exception as e:
    print("Error:", e)
