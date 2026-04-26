import pexpect
import sys

password = "Rr9hG@tC9SZT"
target = "root@45.43.152.18"
port = "25416"

ssh = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no {target}', encoding='utf-8')
ssh.logfile = sys.stdout
ssh.expect('ssword:', timeout=15)
ssh.sendline(password)
ssh.expect('# ', timeout=30)
ssh.sendline("cd /var/www/panodasehir && cat << 'INNER_EOF' > hide_avatars.js\nconst { PrismaClient } = require('@prisma/client')\nconst prisma = new PrismaClient()\n\nasync function main() {\n  const result = await prisma.user.updateMany({\n    data: {\n      showAvatarInPostit: false\n    }\n  })\n  console.log('Updated ' + result.count + ' users.')\n}\n\nmain().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); })\nINNER_EOF")
ssh.expect('# ', timeout=30)
ssh.sendline("node hide_avatars.js")
ssh.expect('# ', timeout=30)
ssh.sendline('exit')
