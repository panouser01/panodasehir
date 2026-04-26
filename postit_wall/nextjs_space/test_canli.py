import pexpect
import sys

password = "Rr9hG@tC9SZT"
ip = "45.43.152.18"
port = "25416"

child = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no root@{ip}', encoding='utf-8', timeout=10)
try:
    i = child.expect(['(?i)password:', '# ', pexpect.EOF, pexpect.TIMEOUT])
    if i == 0:
        child.sendline(password)
        child.expect('# ', timeout=15)
        print("Connected to 45!")
    elif i == 1:
        print("Connected to 45 without password!")
    else:
        print("Failed to 45, trying 85...")
        raise Exception("Next IP")
except Exception as e:
    ip = "85.159.66.93"
    child = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no root@{ip}', encoding='utf-8', timeout=10)
    i = child.expect(['(?i)password:', '# '])
    if i == 0:
        child.sendline(password)
        child.expect('# ', timeout=15)
        print("Connected to 85!")

print(f"Using IP {ip}")
# Get Database credentials to be safe, otherwise just try root mysqldump
child.sendline("cat /var/www/panodasehir/.env | grep DATABASE_URL")
child.expect('# ')
dburl = child.before
print("Database Info:", dburl)

# Dump DB
child.sendline("cd /var/www")
child.expect('# ')
# Some systems allow mysqldump without credentials if run as root
child.sendline("mysqldump panodasehir > panodasehir_canli_db.sql || echo 'DB_FAILED'")
child.expect('# ', timeout=60)
print("Dump Database Output:", child.before)

# Pack code (tar)
child.sendline("tar -czf panodasehir_canli_kodlar.tar.gz --exclude node_modules --exclude .next panodasehir/")
child.expect('# ', timeout=300)
print("Tar Code Output:", child.before)

child.sendline("exit")
