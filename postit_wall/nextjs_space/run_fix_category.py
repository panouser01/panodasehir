import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

# Create the node script locally
with open("fix_category.js", "w") as f:
    f.write("""
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const missingWallName = "Alaçatı Cumbalı Konak Hotel | Adults Only + 12";
  const parentWallName = "Alaçatı";
  
  const missingWall = await prisma.category.findFirst({
    where: { name: missingWallName }
  });
  
  if (!missingWall) {
    console.log("Missing wall not found in DB.");
    return;
  }
  
  console.log("Found missing wall:", missingWall.id, missingWall.name, "ParentId:", missingWall.parentId);
  
  const parentWall = await prisma.category.findFirst({
    where: { name: parentWallName }
  });
  
  if (!parentWall) {
    console.log("Parent wall 'Alaçatı' not found.");
    return;
  }
  
  console.log("Found parent wall:", parentWall.id, parentWall.name);
  
  const updated = await prisma.category.update({
    where: { id: missingWall.id },
    data: { parentId: parentWall.id }
  });
  
  console.log("Updated successfully:", updated.id, updated.parentId);
}

main().catch(console.error).finally(() => prisma.$disconnect());
""")

print("Uploading fix_category.js to server...")
scp = pexpect.spawn(f"scp -P {port} -o StrictHostKeyChecking=no 'fix_category.js' {target}:/var/www/panodasehir/fix_category.js", encoding='utf-8')
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
ssh.sendline('cd /var/www/panodasehir && export DATABASE_URL="mysql://panodasehir:Rr9hG@tC9SZT@127.0.0.1:3306/panodasehir" && node fix_category.js')
ssh.expect('# ', timeout=60)
ssh.sendline('exit')
ssh.expect(pexpect.EOF, timeout=10)

print("Exit status:", ssh.exitstatus)
