import paramiko
from scp import SCPClient
import sys

def create_ssh_client(server, port, user, password):
    client = paramiko.SSHClient()
    client.load_system_host_keys()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(server, port, user, password)
    return client

host = '45.43.152.18'
port = 22
user = 'root'
password = 'Rr9hG@tC9SZT'
remote_dir = '/var/www/panodasehir'

print("Connecting to SSH...")
ssh = create_ssh_client(host, port, user, password)
scp = SCPClient(ssh.get_transport())

print("Uploading files...")

scp.put('app/admin/page.tsx', remote_dir + '/app/admin/page.tsx')
scp.put('app/page.tsx', remote_dir + '/app/page.tsx')
scp.put('app/api/settings/route.ts', remote_dir + '/app/api/settings/route.ts')

print("Running bash build command...")
stdin, stdout, stderr = ssh.exec_command(f"cd {remote_dir} && npm run build && pm2 restart all")
for line in iter(stdout.readline, ""):
    print(line, end="")
for line in iter(stderr.readline, ""):
    print(line, end="", file=sys.stderr)

scp.close()
ssh.close()
print("Deployment completed successfully!")
