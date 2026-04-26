import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

files = [
    ('app/admin/page.tsx', '/var/www/panodasehir/app/admin/page.tsx'),
    ('app/api/postits/route.ts', '/var/www/panodasehir/app/api/postits/route.ts'),
    ('app/api/postits/order/route.ts', '/var/www/panodasehir/app/api/postits/order/route.ts'),
    ('prisma/schema.prisma', '/var/www/panodasehir/prisma/schema.prisma')
]

for local, remote in files:
    print(f"Uploading {local}...")
    scp = pexpect.spawn(f'scp -P {port} -o StrictHostKeyChecking=no "{local}" "{target}:{remote}"', encoding='utf-8')
    scp.logfile = sys.stdout
    scp.expect('ssword:', timeout=15)
    scp.sendline(password)
    scp.expect(pexpect.EOF, timeout=120)

print("Running db push, build and restarting server...")
ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('# ', timeout=30)
ssh.sendline('cd /var/www/panodasehir && npx prisma db push')
ssh.expect('# ', timeout=120)
ssh.sendline('cd /var/www/panodasehir && npm run build')
ssh.expect('# ', timeout=400)
ssh.sendline('pm2 restart all')
ssh.expect('online', timeout=40)
ssh.sendline('exit')
ssh.expect(pexpect.EOF, timeout=10)

print("Exit code:", ssh.exitstatus)
