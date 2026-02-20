
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const csvFilePath = path.join(process.cwd(), 'categories.csv');
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');

    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
    });

    console.log(`Found ${records.length} categories to import.`);

    // Pass 1: Upsert categories without parentId to ensure they exist
    console.log('--- Pass 1: Upserting categories (ignoring parentId) ---');
    for (const record of records) {
        try {
            const clean = (val: string) => (val && val.trim() !== '' ? val : null);

            await prisma.category.upsert({
                where: { id: record.id },
                update: {
                    name: record.name,
                    description: clean(record.description),
                    // Appearance
                    categoryBgColor: clean(record.categoryBgColor),
                    categoryColor: clean(record.categoryColor),
                    categoryFont: clean(record.categoryFont),
                    heroBackgroundImage: clean(record.heroBackgroundImage),
                    heroGradientFrom: clean(record.heroGradientFrom),
                    heroGradientTo: clean(record.heroGradientTo),
                    heroGradientVia: clean(record.heroGradientVia),
                    heroSubtitle: clean(record.heroSubtitle),
                    heroSubtitleColor: clean(record.heroSubtitleColor),
                    heroSubtitleFont: clean(record.heroSubtitleFont),
                    heroSubtitleSize: clean(record.heroSubtitleSize),
                    heroTitleColor: clean(record.heroTitleColor),
                    heroTitleFont: clean(record.heroTitleFont),
                    heroTitleSize: clean(record.heroTitleSize),

                    // Relations - Only WallManager for now, skipping parentId
                    wallManagerId: clean(record.wallManagerId),

                    updatedAt: clean(record.updatedAt) ? new Date(record.updatedAt) : new Date(),
                },
                create: {
                    id: record.id,
                    name: record.name,
                    description: clean(record.description),

                    categoryBgColor: clean(record.categoryBgColor),
                    categoryColor: clean(record.categoryColor),
                    categoryFont: clean(record.categoryFont),
                    heroBackgroundImage: clean(record.heroBackgroundImage),
                    heroGradientFrom: clean(record.heroGradientFrom),
                    heroGradientTo: clean(record.heroGradientTo),
                    heroGradientVia: clean(record.heroGradientVia),
                    heroSubtitle: clean(record.heroSubtitle),
                    heroSubtitleColor: clean(record.heroSubtitleColor),
                    heroSubtitleFont: clean(record.heroSubtitleFont),
                    heroSubtitleSize: clean(record.heroSubtitleSize),
                    heroTitleColor: clean(record.heroTitleColor),
                    heroTitleFont: clean(record.heroTitleFont),
                    heroTitleSize: clean(record.heroTitleSize),

                    wallManagerId: clean(record.wallManagerId),

                    createdAt: clean(record.createdAt) ? new Date(record.createdAt) : new Date(),
                    updatedAt: clean(record.updatedAt) ? new Date(record.updatedAt) : new Date(),
                }
            });
            // console.log(`Upserted category: ${record.name} (${record.id})`);
        } catch (error) {
            console.error(`Failed to upsert category ${record.name} in Pass 1:`, error);
        }
    }

    // Pass 2: Connect parents
    console.log('--- Pass 2: Connecting parent categories ---');
    for (const record of records) {
        const parentId = record.parentId && record.parentId.trim() !== '' ? record.parentId : null;

        if (parentId) {
            try {
                await prisma.category.update({
                    where: { id: record.id },
                    data: {
                        parentId: parentId
                    }
                });
                console.log(`Connected ${record.name} to parent ${parentId}`);
            } catch (error) {
                console.error(`Failed to connect parent for ${record.name} in Pass 2:`, error);
            }
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
