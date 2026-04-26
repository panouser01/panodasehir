import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

with open("check_postits.js", "w") as f:
    f.write("""
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const catId = 'cmnzr0oyb0009m1jyp6ko8qn3';
  const postits = await prisma.postIt.findMany({
    where: { categoryId: catId }
  });
  
  console.log(`Found ${postits.length} postits directly under the wall.`);
  postits.forEach(p => {
     console.log(`- ID: ${p.id}, status/app/pub: ${p.status}/${p.isApproved}/${p.isPublished}, expires: ${p.expiresAt}`);
  });

  // What if postits were assigned somewhere else by mistake?
  // Let's search by content keywords:
  const orphans = await prisma.postIt.findMany({
    where: {
      OR: [
        { content: { contains: "Cumbalı" } },
        { content: { contains: "Adults Only" } }
      ]
    },
    include: { category: true }
  });

  console.log(`Found ${orphans.length} postits containing 'Cumbalı' or 'Adults'.`);
  orphans.forEach(p => {
     console.log(`- Orphan ID: ${p.id}, content: ${p.content.substring(0,30)}..., categoryId: ${p.categoryId}, CatName: ${p.category ? p.category.name : 'Unknown'}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
""")

scp = pexpect.spawn(f"scp -P {port} -o StrictHostKeyChecking=no 'check_postits.js' {target}:/var/www/panodasehir/check_postits.js", encoding='utf-8')
scp.logfile = sys.stdout
scp.expect('ssword:', timeout=15)
scp.sendline(password)
scp.expect(pexpect.EOF, timeout=120)

ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('# ', timeout=30)
ssh.sendline('cd /var/www/panodasehir && export DATABASE_URL="mysql://kaclira:KacliraKaclira1234**@127.0.0.1:3306/panodasehir" && node check_postits.js')
ssh.expect('# ', timeout=30)
ssh.sendline('exit')
