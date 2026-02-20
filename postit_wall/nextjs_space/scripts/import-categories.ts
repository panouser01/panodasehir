
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const csvFilePath = path.join(process.cwd(), '../../category.csv');
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

    // Pass 1: Upsert categories without relations (parentId, wallManagerId)
    console.log('Pass 1: Creating/Updating categories base data...');
    for (const record of records) {
        try {
            const {
                id, name, description, createdAt, updatedAt,
                categoryBgColor, categoryColor, categoryFont,
                heroBackgroundImage, heroGradientFrom, heroGradientTo, heroGradientVia,
                heroSubtitle, heroSubtitleColor, heroSubtitleFont, heroSubtitleSize,
                heroTitleColor, heroTitleFont, heroTitleSize
            } = record;

            await prisma.category.upsert({
                where: { id },
                update: {
                    name,
                    description: description || null,
                    categoryBgColor: categoryBgColor || null,
                    categoryColor: categoryColor || null,
                    categoryFont: categoryFont || null,
                    heroBackgroundImage: heroBackgroundImage || null,
                    heroGradientFrom: heroGradientFrom || null,
                    heroGradientTo: heroGradientTo || null,
                    heroGradientVia: heroGradientVia || null,
                    heroSubtitle: heroSubtitle || null,
                    heroSubtitleColor: heroSubtitleColor || null,
                    heroSubtitleFont: heroSubtitleFont || null,
                    heroSubtitleSize: heroSubtitleSize || null,
                    heroTitleColor: heroTitleColor || null,
                    heroTitleFont: heroTitleFont || null,
                    heroTitleSize: heroTitleSize || null,
                    updatedAt: new Date(updatedAt), // Preserve timestamp
                    parentId: null, // Reset for now to avoid FK issues
                },
                create: {
                    id,
                    name,
                    description: description || null,
                    categoryBgColor: categoryBgColor || null,
                    categoryColor: categoryColor || null,
                    categoryFont: categoryFont || null,
                    heroBackgroundImage: heroBackgroundImage || null,
                    heroGradientFrom: heroGradientFrom || null,
                    heroGradientTo: heroGradientTo || null,
                    heroGradientVia: heroGradientVia || null,
                    heroSubtitle: heroSubtitle || null,
                    heroSubtitleColor: heroSubtitleColor || null,
                    heroSubtitleFont: heroSubtitleFont || null,
                    heroSubtitleSize: heroSubtitleSize || null,
                    heroTitleColor: heroTitleColor || null,
                    heroTitleFont: heroTitleFont || null,
                    heroTitleSize: heroTitleSize || null,
                    createdAt: new Date(createdAt), // Preserve timestamp
                    updatedAt: new Date(updatedAt),
                }
            });
        } catch (error) {
            console.error(`Error in Pass 1 for category ${record.name} (${record.id}):`, error);
        }
    }

    // Pass 2: Connect relations (parentId, wallManagerId)
    console.log('Pass 2: Connecting relations...');
    for (const record of records) {
        try {
            const { id, parentId, wallManagerId } = record;

            const updateData: any = {};

            if (parentId) {
                // Verify parent exists
                const parent = await prisma.category.findUnique({ where: { id: parentId } });
                if (parent) {
                    updateData.parentId = parentId;
                } else {
                    console.warn(`Parent category ${parentId} not found for ${record.name}`);
                }
            }

            if (wallManagerId) {
                // Verify user exists, otherwise skip/log
                const manager = await prisma.user.findUnique({ where: { id: wallManagerId } });
                if (manager) {
                    updateData.wallManagerId = wallManagerId;
                } else {
                    console.warn(`Wall Manager ${wallManagerId} not found for ${record.name}`);
                }
            }

            if (Object.keys(updateData).length > 0) {
                await prisma.category.update({
                    where: { id },
                    data: updateData
                });
            }

        } catch (error) {
            console.error(`Error in Pass 2 for category ${record.name} (${record.id}):`, error);
        }
    }

    console.log('Import completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
