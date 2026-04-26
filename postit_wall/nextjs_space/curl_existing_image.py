import sys
import pexpect

cmd = "curl -s -I https://panodasehir.com/uploads/71d67a45-cbaf-4c61-ac2e-90bf2b5d2502-1000166859.webp"
child = pexpect.spawn(cmd, encoding='utf-8')
child.logfile_read = sys.stdout
child.expect(pexpect.EOF)
