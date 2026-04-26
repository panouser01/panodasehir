import subprocess

cmd = "sshpass -p 'Rr9hG@tC9SZT' ssh -p 25416 -o StrictHostKeyChecking=no root@45.43.152.18 'tail -n 50 /var/log/nginx/error.log && echo \"===\" && pm2 logs panodasehir --nostream --lines 50'"
try:
    output = subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT)
    print(output.decode('utf-8'))
except subprocess.CalledProcessError as e:
    print(e.output.decode('utf-8'))
