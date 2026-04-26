import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

files = [
    "components/layout/navbar.tsx",
    "app/page.tsx"
]

for file in files:
    print(f"Uploading {file}...")
    scp = pexpect.spawn(f'scp -P {port} -o StrictHostKeyChecking=no {file} {target}:/var/www/panodasehir/{file}', encoding='utf-8')
    scp.logfile = sys.stdout
    scp.expect('ssword:', timeout=15)
    scp.sendline(password)
    scp.expect(pexpect.EOF, timeout=120)

print("Exit code:", scp.exitstatus)
