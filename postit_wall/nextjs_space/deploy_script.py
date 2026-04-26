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
remote_admin = remote_dir + '/app/admin/page.tsx'
remote_card = remote_dir + '/components/postit/postit-card.tsx'
remote_slider = remote_dir + '/components/postit/ott-slider.tsx'

scp.put('app/admin/page.tsx', remote_admin)
scp.put('components/postit/postit-card.tsx', remote_card)
scp.put('components/postit/ott-slider.tsx', remote_slider)

print("Running bash build command...")
stdin, stdout, stderr = ssh.exec_command(f"cd {remote_dir} && npm run build && pm2 restart all")
for line in iter(stdout.readline, ""):
    print(line, end="")
for line in iter(stderr.readline, ""):
    print(line, end="", file=sys.stderr)

scp.close()
ssh.close()
print("Deployment completed successfully!")
