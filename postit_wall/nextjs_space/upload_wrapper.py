import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

print("Uploading category-accordion-wrapper.tsx...")
scp = pexpect.spawn(f'scp -P {port} -o StrictHostKeyChecking=no components/postit/category-accordion-wrapper.tsx {target}:/var/www/panodasehir/components/postit/category-accordion-wrapper.tsx', encoding='utf-8')
scp.logfile = sys.stdout
scp.expect('ssword:', timeout=15)
scp.sendline(password)
scp.expect(pexpect.EOF, timeout=120)

print("Exit code:", scp.exitstatus)
