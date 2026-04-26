import sys
import pexpect

cmd = "ssh -p 25416 -o StrictHostKeyChecking=no root@45.43.152.18 'cat << \"EOF\" > /var/www/panodasehir/tmp_db_shape.js\nconst { PrismaClient } = require(\"@prisma/client\");\nconst prisma = new PrismaClient();\nprisma.article.findMany({ take: 3, orderBy: { createdAt: \"desc\" }, select: { id: true, images: true, documents: true } }).then(console.log).finally(() => prisma.$disconnect());\nEOF\ncd /var/www/panodasehir && node tmp_db_shape.js'"
child = pexpect.spawn(cmd, encoding='utf-8')
child.logfile_read = sys.stdout

try:
    child.expect('ssword:', timeout=10)
    child.sendline('Rr9hG@tC9SZT')
    child.expect(pexpect.EOF, timeout=120)
except Exception as e:
    pass
