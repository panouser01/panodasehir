import pexpect
import sys

ip = '45.43.152.18'
port = '25416'
pwd = 'Rr9hG@tC9SZT'
local_dir = '/home/izzetyasin/Desktop/Geliştirme/panodasehir/postit_wall/nextjs_space/'
remote_dir = '/var/www/panodasehir/'

print("Rsync dry-run comparing remote to local...")
# Use recursive, verbose, dry-run, checksum, delete
cmd = f"rsync -rvnc --delete --exclude='node_modules' --exclude='.next' --exclude='.git' --exclude='*.tar.gz' --exclude='tmp' --exclude='.env' --exclude='deploy*.py' --exclude='update*.py' --exclude='pull*.py' --exclude='test*.py' --exclude='*.log' -e 'ssh -p {port} -o StrictHostKeyChecking=no' root@{ip}:{remote_dir} {local_dir}"

child = pexpect.spawn(cmd, encoding='utf-8')
child.logfile_read = sys.stdout

try:
    child.expect('ssword:', timeout=10)
    child.sendline(pwd)
    child.expect(pexpect.EOF, timeout=120)
except Exception as e:
    print("Error:", e)
