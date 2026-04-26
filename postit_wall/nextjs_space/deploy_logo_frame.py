import os
import subprocess

TARGET = "root@45.43.152.18:/var/www/panodasehir/postit_wall/nextjs_space"
FILES = [
    "prisma/schema.prisma",
    "app/admin/page.tsx",
    "app/page.tsx",
    "app/api/categories/route.ts",
    "app/api/categories/[id]/route.ts"
]

for file in FILES:
    print(f"Deploying {file}...")
    subprocess.run(["rsync", "-avz", "-e", "ssh -p 25416", file, f"{TARGET}/{file}"])

print("Pushing Prisma schema and restarting PM2...")
subprocess.run(["ssh", "-p", "25416", "root@45.43.152.18", "cd /var/www/panodasehir/postit_wall/nextjs_space && npx prisma db push && pm2 restart nextjs"])
print("Deployment completed.")
