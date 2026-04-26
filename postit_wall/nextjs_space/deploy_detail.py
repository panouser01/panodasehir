import pexpect
import sys

ip = '45.43.152.18'
port = '25416'
pwd = 'Rr9hG@tC9SZT'
tar_name = 'update_detail_feature.tar.gz'
remote_dir = '/var/www/panodasehir'

print("Uploading tar via SCP...")
scp_cmd = f"scp -P {port} -o StrictHostKeyChecking=no {tar_name} root@{ip}:{remote_dir}/"
child_scp = pexpect.spawn(scp_cmd, encoding='utf-8')
child_scp.logfile_read = sys.stdout
try:
    child_scp.expect('ssword:', timeout=10)
    child_scp.sendline(pwd)
    child_scp.expect(pexpect.EOF, timeout=60)
except Exception as e:
    print(f"SCP Error: {e}")
    sys.exit(1)

print("\nConnecting via SSH to build...")
ssh_cmd = f"ssh -p {port} -o StrictHostKeyChecking=no root@{ip}"
child_ssh = pexpect.spawn(ssh_cmd, encoding='utf-8')
child_ssh.logfile_read = sys.stdout

try:
    child_ssh.expect('ssword:', timeout=10)
    child_ssh.sendline(pwd)
    child_ssh.expect('#', timeout=10)

    print("Extracting and building...")
    child_ssh.sendline(f"cd {remote_dir} && tar -xzvf {tar_name}")
    child_ssh.expect('#', timeout=30)
    
    print("Database pushing...")
    child_ssh.sendline("npx prisma generate && npx prisma db push")
    child_ssh.expect('#', timeout=120)

    print("NPM building... (This might take a few minutes)")
    child_ssh.sendline("npm run build")
    child_ssh.expect('#', timeout=600)

    print("Restarting processes...")
    child_ssh.sendline("pm2 restart panodasehir || pm2 restart all")
    child_ssh.expect('#', timeout=60)

    print("Deployment completed successfully!")
    child_ssh.sendline("exit")
    child_ssh.expect(pexpect.EOF)

except Exception as e:
    print(f"SSH Error: {e}")
    sys.exit(1)
