import pexpect
import sys
import datetime

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

# Run mysqldump on server
print("Creating database dump on remote server...")
ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('# ', timeout=15)

# Find credentials from remote .env
ssh.sendline('cat /var/www/panodasehir/.env | grep DATABASE_URL=')
ssh.expect('# ', timeout=15)

# Assuming standard mysql connection: dump to panodasehir_db_backup.sql
dump_cmd = "mysqldump -h 127.0.0.1 -u kaclira -pKacliraKaclira1234** panodasehir > /var/www/panodasehir/db_backup.sql"
ssh.sendline(dump_cmd)
ssh.expect('# ', timeout=60)
ssh.sendline('exit')

# Create a local filename with timestamp
timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
local_filename = f"panodasehir_prod_db_{timestamp}.sql"

print(f"\nDownloading database dump to {local_filename}...")
# SCP it down
scp = pexpect.spawn(f"scp -P {port} -o StrictHostKeyChecking=no {target}:/var/www/panodasehir/db_backup.sql ./{local_filename}", encoding='utf-8')
scp.logfile = sys.stdout
scp.expect('ssword:', timeout=15)
scp.sendline(password)
scp.expect(pexpect.EOF, timeout=120)

print(f"\nBackup successfully downloaded as {local_filename}")

# Clean up remote file
print("Cleaning up remote file...")
ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target} "rm /var/www/panodasehir/db_backup.sql"', encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect(pexpect.EOF, timeout=120)

