import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

with open("fix_live.js", "w") as f:
    f.write("""
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany();
  let found = null;
  for (const c of categories) {
    if (c.name.toLowerCase().includes('cumbal')) {
       console.log('FOUND MISSING WALL:', c.id, c.name, c.parentId);
       found = c;
    }
  }

  if (!found) {
    console.log("Still not found!");
    return;
  }

  const alacati = await prisma.category.findFirst({
    where: { name: "Alaçatı" }
  });

  if (alacati) {
    console.log('FOUND ALACATI PARENT:', alacati.id);
    await prisma.category.update({
      where: { id: found.id },
      data: { parentId: alacati.id, isActive: true }
    });
    console.log("Successfully moved!");
  } else {
    // If exact "Alaçatı" not found, let's search it
    for (const c of categories) {
      if (c.name.toLowerCase().includes('alaçatı') || c.name.toLowerCase().includes('alacati')) {
          console.log('Possible parent:', c.id, c.name);
          await prisma.category.update({
            where: { id: found.id },
            data: { parentId: c.id, isActive: true }
          });
          console.log("Successfully moved to possible parent!");
          break;
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
""")

print("Uploading to server...")
scp = pexpect.spawn(f"scp -P {port} -o StrictHostKeyChecking=no 'fix_live.js' {target}:/var/www/panodasehir/fix_live.js", encoding='utf-8')
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
# Use real LIVE database URL!
ssh.sendline('cd /var/www/panodasehir && export DATABASE_URL="mysql://kaclira:KacliraKaclira1234**@127.0.0.1:3306/panodasehir" && node fix_live.js')
ssh.expect('# ', timeout=45)
ssh.sendline('exit')
