import pexpect
import sys

host = '45.43.152.18'
port = '25416'
password = 'Rr9hG@tC9SZT'

ssh_child = pexpect.spawn(f'ssh -p {port} -o StrictHostKeyChecking=no root@{host}', encoding='utf-8')
ssh_child.logfile = sys.stdout

try:
    ssh_child.expect('ssword:', timeout=10)
    ssh_child.sendline(password)
    ssh_child.expect('#', timeout=10)
    
    ssh_child.sendline('cd /var/www/panodasehir')
    ssh_child.expect('#', timeout=10)
    
    script = """cat << 'EOF2' > query_db.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const categories = await prisma.category.findMany({
    where: {
      name: {
        contains: 'Balçova'
      }
    }
  })
  console.log(categories)
}
main()
EOF2"""
    ssh_child.sendline(script)
    ssh_child.expect('#', timeout=10)
    
    ssh_child.sendline('node query_db.js')
    ssh_child.expect('#', timeout=20)
    
    ssh_child.sendline('exit')
    ssh_child.expect(pexpect.EOF, timeout=10)
except Exception as e:
    print(f"Error: {e}")
