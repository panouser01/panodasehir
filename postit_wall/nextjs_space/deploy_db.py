import pexpect
import sys

ip = '45.43.152.18'
port = '25416'
pwd = 'Rr9hG@tC9SZT'
remote_dir = '/var/www/panodasehir'
tar_name = 'update-admin-viewer.tar.gz'

print("Uploading tar via SCP...")
scp_cmd = f"scp -P {port} -o StrictHostKeyChecking=no {tar_name} root@{ip}:{remote_dir}/"
child_scp = pexpect.spawn(scp_cmd, encoding='utf-8')
child_scp.logfile_read = sys.stdout
try:
    child_scp.expect('ssword:', timeout=10)
    child_scp.sendline(pwd)
    child_scp.expect(pexpect.EOF, timeout=120)
except Exception as e:
    print(f"SCP Error: {e}")
    sys.exit(1)

print("\nConnecting via SSH to clear cache and build...")
ssh_cmd = f"ssh -p {port} -o StrictHostKeyChecking=no root@{ip}"
child_ssh = pexpect.spawn(ssh_cmd, encoding='utf-8')
child_ssh.logfile_read = sys.stdout

try:
    child_ssh.expect('ssword:', timeout=10)
    child_ssh.sendline(pwd)
    child_ssh.expect('#', timeout=10)

    print("Extracting...")
    child_ssh.sendline(f"cd {remote_dir} && tar -xzvf {tar_name}")
    child_ssh.expect('#', timeout=30)
    
    print("Prisma DB Push...")
    child_ssh.sendline(f"cd {remote_dir} && npx prisma db push")
    child_ssh.expect('#', timeout=2000)

    print("Generating Prisma...")
    child_ssh.sendline(f"cd {remote_dir} && npx prisma generate")
    child_ssh.expect('#', timeout=60)

    print("NPM building...")
    child_ssh.sendline(f"cd {remote_dir} && npm run build")
    child_ssh.expect('#', timeout=2000)

    print("Restarting processes...")
    child_ssh.sendline("pm2 restart panodasehir || pm2 restart all")
    child_ssh.expect('#', timeout=120)

    print("Deployment completed successfully!")
    child_ssh.sendline("exit")
    child_ssh.expect(pexpect.EOF)

except Exception as e:
    print(f"SSH Error: {e}")
    sys.exit(1)
