import sys
import pexpect

script = """
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const article = await prisma.article.findUnique({ where: { id: 'cmnuwn5p20001m1d7thj0eh9v' } });
  console.log("Type of images:", typeof article.images);
  console.log("Is array?", Array.isArray(article.images));
  console.log("Content:", JSON.stringify(article.images));
  const first = article.images[0];
  console.log("First element:", first);
  console.log("Type of first element:", typeof first);
}

main().finally(() => prisma.$disconnect());
"""

cmd1 = "ssh -p 25416 -o StrictHostKeyChecking=no root@45.43.152.18 \"cat > /var/www/panodasehir/test_images.js <<'EOF'\n" + script + "\nEOF\ncd /var/www/panodasehir && node test_images.js\""
child1 = pexpect.spawn(cmd1, encoding='utf-8')
child1.logfile_read = sys.stdout
child1.expect('ssword:', timeout=10)
child1.sendline('Rr9hG@tC9SZT')
child1.expect(pexpect.EOF, timeout=120)
