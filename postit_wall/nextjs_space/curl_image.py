import sys
import pexpect

cmd = "curl -s -I https://panodasehir.com/uploads/ddcad30b-d095-4993-9df7-79a95968f264-bulki.webp"
child = pexpect.spawn(cmd, encoding='utf-8')
child.logfile_read = sys.stdout
child.expect(pexpect.EOF)
