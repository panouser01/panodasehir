import pexpect
import sys

ip = '45.43.152.18'
port = '25416'
pwd = 'Rr9hG@tC9SZT'

remote_script = """
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function run() {
  const articles = await prisma.article.findMany({
    where: { images: { not: 'Object' } }, // Just get some articles with images
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, title: true, images: true, documents: true }
  })
  console.log(JSON.stringify(articles, null, 2))
}
run().then(()=>prisma.$disconnect())
"""

print("Connecting via SSH to check live db...")
cmd = f"ssh -p {port} -o StrictHostKeyChecking=no root@{ip}"
child = pexpect.spawn(cmd, encoding='utf-8')
child.logfile_read = sys.stdout

try:
    child.expect('ssword:', timeout=10)
    child.sendline(pwd)
    child.expect('#', timeout=10)

    child.sendline('cat << "EOF" > /var/www/panodasehir/check_img.js\n' + remote_script + '\nEOF')
    child.expect('#', timeout=10)
    
    child.sendline('cd /var/www/panodasehir && node check_img.js')
    child.expect('#', timeout=30)
    
    child.sendline('exit')
    child.expect(pexpect.EOF)

except Exception as e:
    print(e)
