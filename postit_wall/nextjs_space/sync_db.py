import pexpect
import sys
import subprocess
import os

ip = '45.43.152.18'
port = '25416'
pwd = 'Rr9hG@tC9SZT'
db_user = 'kaclira'
db_pass = 'KacliraKaclira1234**'
db_name = 'panodasehir'
dump_file = 'panodasehir_dump.sql'
remote_dump_path = f'/root/{dump_file}'

print("1. Bağlanılıyor ve sunucudaki veritabanı yedeği alınıyor...")
ssh_cmd = f"ssh -p {port} -o StrictHostKeyChecking=no root@{ip}"
child_ssh = pexpect.spawn(ssh_cmd, encoding='utf-8')
child_ssh.logfile_read = sys.stdout

try:
    child_ssh.expect('ssword:', timeout=10)
    child_ssh.sendline(pwd)
    child_ssh.expect('#', timeout=10)

    print("mysqldump çalıştırılıyor...")
    child_ssh.sendline(f"mysqldump -h 127.0.0.1 -u {db_user} -p'{db_pass}' {db_name} > {remote_dump_path}")
    child_ssh.expect('#', timeout=120)

    print("Veritabanı dökümü oluşturuldu.")
    child_ssh.sendline("exit")
    child_ssh.expect(pexpect.EOF)

except Exception as e:
    print(f"SSH Hatası: {e}")
    sys.exit(1)

print("\n2. Sunucudaki veritabanı dökümü lokale indiriliyor...")
scp_cmd = f"scp -P {port} -o StrictHostKeyChecking=no root@{ip}:{remote_dump_path} ./{dump_file}"
child_scp = pexpect.spawn(scp_cmd, encoding='utf-8')
child_scp.logfile_read = sys.stdout
try:
    child_scp.expect('ssword:', timeout=10)
    child_scp.sendline(pwd)
    child_scp.expect(pexpect.EOF, timeout=120)
    print("İndirme tamamlandı.")
except Exception as e:
    print(f"SCP Hatası: {e}")
    sys.exit(1)

print("\n3. Lokal veritabanı güncelleniyor...")
local_import_cmd = f"mysql -u {db_user} -p'{db_pass}' {db_name} < ./{dump_file}"
try:
    result = subprocess.run(local_import_cmd, shell=True, check=True, capture_output=True, text=True)
    print("Lokal veritabanı başarıyla senkronize edildi!")
except subprocess.CalledProcessError as e:
    print(f"Lokal İçe Aktarma Hatası: {e.stderr}")
    sys.exit(1)

print("\nTemizlik yapılıyor...")
if os.path.exists(dump_file):
    os.remove(dump_file)
print("İşlem tamamlandı! 🎉")
