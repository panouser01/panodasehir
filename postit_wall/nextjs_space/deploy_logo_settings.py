import pexpect
import sys
import time

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"
remote_dir = "/var/www/panodasehir"

files = [
    ('prisma/schema.prisma', f'{remote_dir}/prisma/schema.prisma'),
    ('app/admin/page.tsx', f'{remote_dir}/app/admin/page.tsx'),
    ('app/page.tsx', f'{remote_dir}/app/page.tsx'),
    ('app/api/categories/route.ts', f'{remote_dir}/app/api/categories/route.ts'),
    ('app/api/categories/[id]/route.ts', f'{remote_dir}/app/api/categories/[id]/route.ts')
]

for local, remote in files:
    print(f"Uploading {local} to {remote}...")
    scp = pexpect.spawn(f'scp -P {port} -o StrictHostKeyChecking=no "{local}" "{target}:{remote}"', encoding='utf-8')
    scp.logfile = sys.stdout
    scp.expect('ssword:', timeout=15)
    scp.sendline(password)
    scp.expect(pexpect.EOF, timeout=120)

print("Pushing Prisma schema, Building, and restarting server...")
ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('# ', timeout=30)
ssh.sendline(f'cd {remote_dir} && npx prisma db push && npm run build')
ssh.expect('# ', timeout=600)
ssh.sendline('pm2 restart all')
ssh.expect('online', timeout=180)
ssh.sendline('exit')
ssh.expect(pexpect.EOF, timeout=10)

print("Exit code:", ssh.exitstatus)
