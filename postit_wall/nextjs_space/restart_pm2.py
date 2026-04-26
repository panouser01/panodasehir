import pexpect
import sys

ip = '45.43.152.18'
port = '25416'
pwd = 'Rr9hG@tC9SZT'
remote_dir = '/var/www/panodasehir'

print("\nConnecting via SSH to restart pm2...")
ssh_cmd = f"ssh -p {port} -o StrictHostKeyChecking=no root@{ip}"
child_ssh = pexpect.spawn(ssh_cmd, encoding='utf-8')
child_ssh.logfile_read = sys.stdout

try:
    child_ssh.expect('ssword:', timeout=10)
    child_ssh.sendline(pwd)
    child_ssh.expect(':', timeout=10)

    print("Restarting processes...")
    child_ssh.sendline("cd /var/www/panodasehir && pm2 restart panodasehir")
    child_ssh.expect(':', timeout=60)

    print("Deployment completed successfully!")
    child_ssh.sendline("exit")

except Exception as e:
    print(f"SSH Error: {e}")
    sys.exit(1)
