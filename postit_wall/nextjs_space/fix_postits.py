import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

with open("fix_postits_live.js", "w") as f:
    f.write("""
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const catId = 'cmnzr0oyb0009m1jyp6ko8qn3';
  
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 1); // 1 year from now

  const result = await prisma.postIt.updateMany({
    where: { categoryId: catId },
    data: { 
      isPublished: true, 
      isApproved: true,
      expiresAt: futureDate 
    }
  });

  console.log(`Updated ${result.count} postits to be published, approved, and expire in 1 year.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
""")

scp = pexpect.spawn(f"scp -P {port} -o StrictHostKeyChecking=no 'fix_postits_live.js' {target}:/var/www/panodasehir/fix_postits_live.js", encoding='utf-8')
scp.logfile = sys.stdout
scp.expect('ssword:', timeout=15)
scp.sendline(password)
scp.expect(pexpect.EOF, timeout=120)

ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('# ', timeout=30)
ssh.sendline('cd /var/www/panodasehir && export DATABASE_URL="mysql://kaclira:KacliraKaclira1234**@127.0.0.1:3306/panodasehir" && node fix_postits_live.js')
ssh.expect('# ', timeout=30)
ssh.sendline('exit')
