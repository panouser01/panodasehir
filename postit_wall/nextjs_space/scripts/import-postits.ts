
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { PrismaClient, PostIt_color, PostIt_font, PostIt_pushpin } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const csvFilePath = path.join(process.cwd(), 'postits.csv');
    console.log(`Reading CSV from ${csvFilePath}`);

    if (!fs.existsSync(csvFilePath)) {
        console.error('CSV file not found!');
        process.exit(1);
    }

    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');

    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
    });

    console.log(`Found ${records.length} records. Starting import...`);

    const updatedCategoryIds = new Set<string>();

    for (const record of records) {
        try {
            const {
                id, categoryId, userId, content,
                color, font, pushpin, rotation,
                imageUrl, link,
                isApproved, isModerated,
                createdAt, updatedAt, expiresAt
            } = record;

            // Verify category and user exist
            const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
            if (!categoryExists) {
                console.warn(`Category ${categoryId} not found for postit ${id}. Skipping.`);
                continue;
            }

            const userExists = await prisma.user.findUnique({ where: { id: userId } });
            if (!userExists) {
                console.warn(`User ${userId} not found for postit ${id}. Skipping.`);
                continue;
            }

            const clean = (val: string) => (val && val.trim() !== '' ? val : null);

            await prisma.postIt.upsert({
                where: { id },
                update: {
                    content,
                    color: color as PostIt_color,
                    font: font as PostIt_font,
                    pushpin: pushpin as PostIt_pushpin || 'RED',
                    rotation: parseFloat(rotation),
                    imageUrl: clean(imageUrl),
                    link: clean(link),
                    isApproved: String(isApproved).toLowerCase() === 'true',
                    isModerated: String(isModerated).toLowerCase() === 'true',
                    expiresAt: new Date(expiresAt),
                    categoryId,
                    userId,
                    updatedAt: new Date(updatedAt)
                },
                create: {
                    id,
                    content,
                    color: color as PostIt_color,
                    font: font as PostIt_font,
                    pushpin: pushpin as PostIt_pushpin || 'RED',
                    rotation: parseFloat(rotation),
                    imageUrl: clean(imageUrl),
                    link: clean(link),
                    isApproved: String(isApproved).toLowerCase() === 'true',
                    isModerated: String(isModerated).toLowerCase() === 'true',
                    createdAt: new Date(createdAt),
                    expiresAt: new Date(expiresAt),
                    categoryId,
                    userId,
                    updatedAt: new Date(updatedAt)
                }
            });
            console.log(`Imported postit ${id}`);
            updatedCategoryIds.add(categoryId);

        } catch (error) {
            console.error(`Error importing postit ${record.id}:`, error);
        }
    }

    console.log('Import completed. Syncing category counts...');

    // Sync counts for all categories just to be safe
    const categories = await prisma.category.findMany();
    for (const category of categories) {
        const count = await prisma.postIt.count({
            where: {
                categoryId: category.id,
                isApproved: true,
                expiresAt: {
                    gt: new Date()
                }
            }
        });

        if (category.postCount !== count) {
            console.log(`Updating category ${category.name} (${category.id}): ${category.postCount} -> ${count}`);
            await prisma.category.update({
                where: { id: category.id },
                data: { postCount: count }
            });
        }
    }
    console.log('Category counts synced.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
