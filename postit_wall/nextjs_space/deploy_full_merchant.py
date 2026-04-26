import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"
remote_dir = "/var/www/panodasehir"

print("Creating directories...")
ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('# ', timeout=30)
ssh.sendline(f'mkdir -p {remote_dir}/app/merchant/register')
ssh.expect('# ', timeout=30)
ssh.sendline(f'mkdir -p {remote_dir}/app/api/auth/merchant-register')
ssh.expect('# ', timeout=30)
ssh.sendline(f'mkdir -p {remote_dir}/app/api/admin/merchant-applications')
ssh.expect('# ', timeout=30)
ssh.sendline('exit')
ssh.expect(pexpect.EOF, timeout=10)

files = [
    'prisma/schema.prisma',
    'app/merchant/register/page.tsx',
    'app/api/auth/merchant-register/route.ts',
    'app/api/auth/verify-email/route.ts',
    'app/admin/page.tsx',
    'app/api/admin/merchant-applications/route.ts'
]

for local in files:
    remote = f'{remote_dir}/{local}'
    print(f"Uploading {local} to {remote}...")
    scp = pexpect.spawn(f'scp -P {port} -o StrictHostKeyChecking=no "{local}" "{target}:{remote}"', encoding='utf-8')
    scp.logfile = sys.stdout
    scp.expect('ssword:', timeout=15)
    scp.sendline(password)
    scp.expect(pexpect.EOF, timeout=120)

print("Pushing DB, Building and restarting server...")
ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('# ', timeout=30)
ssh.sendline(f'cd {remote_dir} && npx prisma db push --skip-generate && npx prisma generate')
ssh.expect('# ', timeout=120)
ssh.sendline(f'cd {remote_dir} && npm run build')
ssh.expect('# ', timeout=600)
ssh.sendline('pm2 restart all')
ssh.expect('online', timeout=180)
ssh.sendline('exit')
ssh.expect(pexpect.EOF, timeout=10)

print("Exit code:", ssh.exitstatus)
