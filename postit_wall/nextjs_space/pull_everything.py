import pexpect
import sys
import os
import datetime

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

local_backup_dir = "/home/izzetyasin/Desktop/Geliştirme/panodasehiryedek"
os.system(f"mkdir -p {local_backup_dir}")

timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
db_filename = f"panodasehir_prod_db_{timestamp}.sql"
src_filename = f"panodasehir_source_{timestamp}.tar.gz"

print("Connecting to live server...")
ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('# ', timeout=30)

print("Taking MySQL dump...")
dump_cmd = "mysqldump -h 127.0.0.1 -u kaclira -pKacliraKaclira1234** panodasehir > /var/www/panodasehir/db_backup.sql"
ssh.sendline(dump_cmd)
ssh.expect('# ', timeout=60)

print("Compressing source files...")
tar_cmd = "cd /var/www/panodasehir && tar --exclude='node_modules' --exclude='.next' --exclude='.git' -czvf source_backup.tar.gz ."
ssh.sendline(tar_cmd)
# Tar might take a while
ssh.expect('# ', timeout=600)

ssh.sendline('exit')

print(f"\nDownloading database dump to {local_backup_dir}/{db_filename}...")
scp_db = pexpect.spawn(f"scp -P {port} -o StrictHostKeyChecking=no {target}:/var/www/panodasehir/db_backup.sql {local_backup_dir}/{db_filename}", encoding='utf-8')
scp_db.logfile = sys.stdout
scp_db.expect('ssword:', timeout=15)
scp_db.sendline(password)
scp_db.expect(pexpect.EOF, timeout=120)

print(f"\nDownloading source archive to {local_backup_dir}/{src_filename}...")
scp_src = pexpect.spawn(f"scp -P {port} -o StrictHostKeyChecking=no {target}:/var/www/panodasehir/source_backup.tar.gz {local_backup_dir}/{src_filename}", encoding='utf-8')
scp_src.logfile = sys.stdout
scp_src.expect('ssword:', timeout=15)
scp_src.sendline(password)
scp_src.expect(pexpect.EOF, timeout=600)

print("\nExtracting source files...")
os.system(f"cd {local_backup_dir} && tar -xzvf {src_filename}")

print("\nCleaning up remote files...")
ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target} "rm /var/www/panodasehir/db_backup.sql /var/www/panodasehir/source_backup.tar.gz"', encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect(pexpect.EOF, timeout=120)

print(f"\nAll done! Backup is ready at {local_backup_dir}")
