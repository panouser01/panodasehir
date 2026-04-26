import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

with open("check_alacati.js", "w") as f:
    f.write("""
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const alacatiList = await prisma.category.findMany({
    where: { name: "Alaçatı" },
    include: { parent: true }
  });
  
  console.log("Found Alaçatı nodes:");
  alacatiList.forEach(a => {
    console.log(`- ID: ${a.id}, Parent: ${a.parent ? a.parent.name : 'root'}`);
  });

  const hotel = await prisma.category.findFirst({
    where: { name: { contains: "Cumbal" } },
    include: { parent: true }
  });
  if (hotel) {
     console.log(`Hotel currently under: ${hotel.parent ? hotel.parent.name : 'root'} (Parent ID: ${hotel.parentId})`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
""")

scp = pexpect.spawn(f"scp -P {port} -o StrictHostKeyChecking=no 'check_alacati.js' {target}:/var/www/panodasehir/check_alacati.js", encoding='utf-8')
scp.expect('ssword:', timeout=15)
scp.sendline(password)
scp.expect(pexpect.EOF, timeout=120)

ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('# ', timeout=30)
ssh.sendline('cd /var/www/panodasehir && export DATABASE_URL="mysql://kaclira:KacliraKaclira1234**@127.0.0.1:3306/panodasehir" && node check_alacati.js')
ssh.expect('# ', timeout=30)
ssh.sendline('exit')
