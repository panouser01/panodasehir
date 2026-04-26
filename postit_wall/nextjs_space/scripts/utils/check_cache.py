import pexpect
password = "Rr9hG@tC9SZT"

child = pexpect.spawn('ssh -p 25416 -o StrictHostKeyChecking=no root@45.43.152.18 "grep -r \'Resim eklendi\' /var/www/panodasehir/.next"', encoding='utf-8')
try:
    child.expect('[pP]assword:', timeout=10)
    child.sendline(password)
    child.expect(pexpect.EOF, timeout=120)
    print(child.before)
except Exception as e:
    print("Failed")
