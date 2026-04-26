import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

with open("check_live.js", "w") as f:
    f.write("""
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany();
  for (const c of categories) {
    if (c.name.toLowerCase().includes('cumbal')) {
       console.log('STATUS:', c.id, c.name, 'Parent:', c.parentId, 'isActive:', c.isActive);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
""")

print("Uploading to server...")
scp = pexpect.spawn(f"scp -P {port} -o StrictHostKeyChecking=no 'check_live.js' {target}:/var/www/panodasehir/check_live.js", encoding='utf-8')
scp.logfile = sys.stdout
scp.expect('ssword:', timeout=15)
scp.sendline(password)
scp.expect(pexpect.EOF, timeout=120)

print("Running script on server...")
ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('# ', timeout=30)
ssh.sendline('cd /var/www/panodasehir && export DATABASE_URL="mysql://kaclira:KacliraKaclira1234**@127.0.0.1:3306/panodasehir" && node check_live.js')
ssh.expect('# ', timeout=30)
ssh.sendline('exit')
