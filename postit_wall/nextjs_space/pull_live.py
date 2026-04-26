import os
import pexpect
import sys

ip = '45.43.152.18'
port = '25416'
pwd = 'Rr9hG@tC9SZT'
remote_dir = '/var/www/panodasehir'
local_dir = '/home/izzetyasin/Desktop/Geliştirme/panodasehir/postit_wall/nextjs_space'
remote_tar = '/var/www/panodasehir/source_backup.tar.gz'

print("Connecting via SSH to create backup tar...")
ssh_cmd = f"ssh -p {port} -o StrictHostKeyChecking=no root@{ip}"
child_ssh = pexpect.spawn(ssh_cmd, encoding='utf-8')
child_ssh.logfile_read = sys.stdout

try:
    child_ssh.expect('ssword:', timeout=10)
    child_ssh.sendline(pwd)
    child_ssh.expect('#', timeout=10)

    print("Creating tar on server...")
    # Tar only source files, ignore node_modules and .next
    child_ssh.sendline(f"cd {remote_dir} && tar --exclude='node_modules' --exclude='.next' --exclude='.git' -czvf source_backup.tar.gz .")
    child_ssh.expect('#', timeout=300)
    
    print("Backup created on server.")
    child_ssh.sendline("exit")
    child_ssh.expect(pexpect.EOF)

except Exception as e:
    print(f"SSH Error: {e}")
    sys.exit(1)

print("\nDownloading backup via SCP...")
scp_cmd = f"scp -P {port} -o StrictHostKeyChecking=no root@{ip}:{remote_tar} {local_dir}/"
child_scp = pexpect.spawn(scp_cmd, encoding='utf-8')
child_scp.logfile_read = sys.stdout

try:
    child_scp.expect('ssword:', timeout=10)
    child_scp.sendline(pwd)
    child_scp.expect(pexpect.EOF, timeout=300)
except Exception as e:
    print(f"SCP Error: {e}")
    sys.exit(1)

print("\nExtracting locally...")
os.system(f"cd {local_dir} && tar -xzvf source_backup.tar.gz")

print("Done restoring project!")
