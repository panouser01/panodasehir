import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

files_to_upload = [
    "components/postit/ott-slider.tsx",
    "components/postit/postit-masonry-grid.tsx"
]

for file_path in files_to_upload:
    print(f"Uploading {file_path}...")
    scp = pexpect.spawn(f'scp -P {port} -o StrictHostKeyChecking=no {file_path} {target}:/var/www/panodasehir/{file_path}', encoding='utf-8')
    scp.logfile = sys.stdout
    scp.expect('ssword:', timeout=15)
    scp.sendline(password)
    scp.expect(pexpect.EOF, timeout=120)
    print(f"Uploaded {file_path} with exit code:", scp.exitstatus)
