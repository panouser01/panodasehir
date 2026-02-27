
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const csvFilePath = path.join(process.cwd(), 'users.csv');
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');

    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
    });

    console.log(`Found ${records.length} users to import.`);

    for (const record of records) {
        try {
            const {
                id,
                email,
                emailVerified,
                password,
                name,
                image,
                role,
                companyName,
                phone,
                taxId,
                createdAt,
                updatedAt
            } = record;

            // Helper to convert empty string to null or undefined
            const clean = (val: string) => (val && val.trim() !== '' ? val : null);

            // Convert Role string to Enum
            let userRole = 'USER';
            if (role === 'SUPER_ADMIN') userRole = 'SUPER_ADMIN';
            else if (role === 'WALL_MANAGER') userRole = 'WALL_MANAGER';

            await prisma.user.upsert({
                where: { id: id },
                update: {
                    email: email,
                    emailVerified: clean(emailVerified) ? new Date(emailVerified) : null,
                    password: clean(password),
                    name: clean(name),
                    image: clean(image),
                    role: userRole,
                    companyName: clean(companyName),
                    phone: clean(phone),
                    taxId: clean(taxId),
                    // Avoid overwriting createdAt if not necessary, but CSV has it
                    // updatedAt is automatically handled by Prisma usually, but here we enforce it
                    updatedAt: clean(updatedAt) ? new Date(updatedAt) : new Date(),
                },
                create: {
                    id: id,
                    email: email,
                    emailVerified: clean(emailVerified) ? new Date(emailVerified) : null,
                    password: clean(password),
                    name: clean(name),
                    image: clean(image),
                    role: userRole,
                    companyName: clean(companyName),
                    phone: clean(phone),
                    taxId: clean(taxId),
                    createdAt: clean(createdAt) ? new Date(createdAt) : new Date(),
                    updatedAt: clean(updatedAt) ? new Date(updatedAt) : new Date(),
                }
            });
            console.log(`Upserted user: ${email} (${id})`);

        } catch (error) {
            console.error(`Failed to import user ${record.email}:`, error);
        }
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
