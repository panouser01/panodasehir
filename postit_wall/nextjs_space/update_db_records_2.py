import pexpect
import sys

ip = '45.43.152.18'
port = '25416'
pwd = 'Rr9hG@tC9SZT'

print("Connecting via SSH...")
ssh_cmd = f"ssh -p {port} -o StrictHostKeyChecking=no root@{ip}"
child_ssh = pexpect.spawn(ssh_cmd, encoding='utf-8')
child_ssh.logfile_read = sys.stdout

try:
    child_ssh.expect('ssword:', timeout=10)
    child_ssh.sendline(pwd)
    child_ssh.expect('#', timeout=10)

    print("Updating database rows for expired and previously approved postits...")
    child_ssh.sendline("mysql -e 'UPDATE panodasehir.PostIt SET hasBeenPublished = 1 WHERE isApproved = 1 OR expiresAt < NOW() OR views > 0;'")
    child_ssh.expect('#', timeout=30)

    print("Done!")
    child_ssh.sendline("exit")
    child_ssh.expect(pexpect.EOF)

except Exception as e:
    print(f"SSH Error: {e}")
    sys.exit(1)
