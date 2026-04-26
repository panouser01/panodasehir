import pexpect
import sys

print("Uploading file to server...")
scp = pexpect.spawn('scp -P 25416 -o StrictHostKeyChecking=no update-style-4.tar.gz root@45.43.152.18:/var/www/panodasehir/', encoding='utf-8')
scp.logfile = sys.stdout
scp.expect('ssword:', timeout=10)
scp.sendline('Rr9hG@tC9SZT')
scp.expect(pexpect.EOF, timeout=120)
print("\nUpload complete.")

print("\nConnecting to server to extract and build...")
child = pexpect.spawn('ssh -p 25416 -o StrictHostKeyChecking=no root@45.43.152.18', encoding='utf-8')
child.logfile = sys.stdout

try:
    child.expect('ssword:', timeout=10)
    child.sendline('Rr9hG@tC9SZT')
    child.expect('#', timeout=10)
    
    one_liner = "cd /var/www/panodasehir && tar -xzvf update-style-4.tar.gz && npx prisma db push --accept-data-loss && npx prisma generate && npm run build && pm2 restart all"
    print(f"Executing full build script...")
    child.sendline(one_liner)
    child.expect('#', timeout=600)
    print("\nDone building and restarting.")
    child.sendline('exit')
except Exception as e:
    print(f"Error occurred: {e}")
