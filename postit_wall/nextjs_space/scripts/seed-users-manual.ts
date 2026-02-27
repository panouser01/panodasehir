
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const users = [
    {
        email: 'john@doe.com',
        id: 'cmloyj21x0001sx0xetbevyy2',
        name: 'Test Kullanıcı',
        password: '$2a$10$FIscdRHxBT2.39x/xgGcU.1b.njvRMMIoQICQNPreKd6VQy/P3Wva',
        role: 'SUPER_ADMIN',
        updatedAt: '2026-02-16T09:13:43.461Z', // Replacing comma with dot and adding Z for UTC or just assuming local
    },
    {
        email: 'admin@panodasehir.com',
        id: 'cmloyj21r0000sx0xyhzs1pji',
        name: 'Süper Admin',
        password: '$2a$10$vK7i/6C5RqDZ0L4YOxExc.ig10eKXuaC2mMJF4u1f5SdRLslSVFgWy',
        role: 'SUPER_ADMIN',
        updatedAt: '2026-02-16T11:46:49.362Z',
    },
    {
        email: 'teknoloji@panodasehir.com',
        id: 'cmloyj23t0002sx0xnemncge4m',
        name: 'Teknoloji Yöneticisi',
        password: '$2a$10$Yz0faawyT.dqHOnv2bQlIeh2AAzS3kXUXbMlqB5eK6HruqLNHrgyi',
        role: 'WALL_MANAGER',
        updatedAt: '2026-02-16T11:46:49.366Z',
    },
    {
        email: 'sanat@panodasehir.com',
        id: 'cmloyj25q0003sx0xrwbljnxv',
        name: 'Sanat Yöneticisi',
        password: '$2a$10$d1nVVo6F7qvHHdD90.PZxeRHETNFOReqW/toEPXyePhKt4lISEZwm',
        role: 'WALL_MANAGER',
        updatedAt: '2026-02-16T11:46:49.368Z',
    },
    {
        email: 'orcun.cengiz@sepetink.com',
        id: 'cmlp9vy460002o108nqfpsjma',
        name: 'Orçun Cengiz',
        password: '$2a$10$uF.MDwRFpFl7wU9RSPY8euhZ3ucTMBINhBQYfo4h4MiF.8Zvk3qhs',
        role: 'USER',
        updatedAt: '2026-02-16T14:31:40.662Z',
    },
    {
        email: 'test@panodasehir.com',
        id: 'cmlppzgfm0000v7hzywp0lfhp',
        name: 'test',
        password: '$2a$10$0u51UdM7icrohCF3DfreiOK9CORSmURPJmM.bzNn4IvqzIZujyhQW',
        role: 'USER',
        updatedAt: '2026-02-16T22:02:18.227Z',
    },
    {
        email: 'testuserh0t5k22c@example.com',
        id: 'cmlpq6lqn0000v76q3bymkgew',
        name: 'Süper Admin',
        password: '$2a$10$cUq45vqWoxnRqoBWxvhH7aOvFx/CKAB3RltaCBIUzXTi7rxAwQeLcu',
        role: 'USER',
        updatedAt: '2026-02-16T22:07:51.695Z',
    },
    {
        email: 'testuser20101zui@example.com',
        id: 'cmlpqqg7c0000v7ulygx70laz',
        name: 'Süper Admin',
        password: '$2a$10$F.96GbSOFH0YdzcXzFe6/uYDXk4moQy2lF0oxbA4ebS/ALiJJIKzC',
        role: 'USER',
        updatedAt: '2026-02-16T22:15:31.080Z',
    },
];

async function main() {
    console.log('Veritabanına kullanıcılar aktarılıyor...');

    for (const user of users) {
        const { updatedAt, ...userData } = user;
        const updatedAtDate = new Date(updatedAt.replace(',', '.')); // Handle comma if present in string passed

        await prisma.user.upsert({
            where: { email: user.email },
            update: {
                ...userData,
                updatedAt: updatedAtDate,
            },
            create: {
                ...userData,
                updatedAt: updatedAtDate,
                createdAt: new Date(), // Set created at to now as we don't have it
            },
        });
        console.log(`Kullanıcı eklendi/güncellendi: ${user.email}`);
    }

    console.log('İşlem tamamlandı.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
