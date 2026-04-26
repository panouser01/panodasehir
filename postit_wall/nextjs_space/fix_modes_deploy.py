import pexpect
import sys

host = '45.43.152.18'
port = '25416'
password = 'Rr9hG@tC9SZT'

files_to_upload = [
    ('app/admin/page.tsx', '/var/www/panodasehir/app/admin/page.tsx')
]

for local_file, remote_file in files_to_upload:
    print(f"Uploading {local_file}...")
    child = pexpect.spawn(f'scp -P {port} -o StrictHostKeyChecking=no {local_file} root@{host}:{remote_file}', encoding='utf-8')
    child.logfile = sys.stdout
    try:
        child.expect('ssword:', timeout=10)
        child.sendline(password)
        child.expect(pexpect.EOF, timeout=60)
        print(f"Upload complete for {local_file}!")
    except Exception as e:
        print(f"Error during upload of {local_file}: {e}")
        sys.exit(1)

print("Building on remote server...")
ssh_child = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no root@{host}', encoding='utf-8')
ssh_child.logfile = sys.stdout

try:
    ssh_child.expect('ssword:', timeout=10)
    ssh_child.sendline(password)
    ssh_child.expect('#', timeout=10)
    
    ssh_child.sendline('cd /var/www/panodasehir')
    ssh_child.expect('#', timeout=10)
    
    ssh_child.sendline('npm run build')
    ssh_child.expect('#', timeout=600)
    
    ssh_child.sendline('pm2 restart all')
    ssh_child.expect('#', timeout=30)
    
    ssh_child.sendline('exit')
    ssh_child.expect(pexpect.EOF, timeout=10)
    print("Deployment successful!")
except Exception as e:
    print(f"Error during remote commands: {e}")
    sys.exit(1)
