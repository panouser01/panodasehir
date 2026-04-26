const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function escapeCsvParam(param) {
    if (param === null || param === undefined) return '';
    if (param instanceof Date) return param.toISOString();
    if (typeof param === 'object') return '"' + JSON.stringify(param).replace(/"/g, '""') + '"';
    const str = String(param);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

async function exportToCSV() {
    const outputDir = path.join(__dirname, 'DbCSV');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const models = Object.keys(prisma).filter(key =>
        !key.startsWith('_') && !key.startsWith('$') && typeof prisma[key] === 'object' && prisma[key].findMany
    );

    for (const modelName of models) {
        try {
            console.log(`Exporting ${modelName}...`);
            const records = await prisma[modelName].findMany();

            if (records.length === 0) {
                fs.writeFileSync(path.join(outputDir, `${modelName}.csv`), '');
                console.log(`No records for ${modelName}. Empty CSV created.`);
                continue;
            }

            // Collect all possible headers in case some records have extra fields (though Prisma types are usually uniform)
            const headersSet = new Set();
            for (const record of records) {
                Object.keys(record).forEach(k => headersSet.add(k));
            }
            const headers = Array.from(headersSet);

            let csvContent = headers.map(h => escapeCsvParam(h)).join(',') + '\n';

            for (const record of records) {
                const row = headers.map(header => escapeCsvParam(record[header]));
                csvContent += row.join(',') + '\n';
            }

            fs.writeFileSync(path.join(outputDir, `${modelName}.csv`), csvContent);
            console.log(`Exported ${records.length} records for ${modelName}`);
        } catch (e) {
            console.error(`Error exporting ${modelName}:`, e.message);
        }
    }
}

exportToCSV().then(async () => {
    console.log('Tüm tablolar başarıyla CSV formatına dönüştürüldü.');
    await prisma.$disconnect();
    process.exit(0);
}).catch(async (err) => {
    console.error("Yedekleme sırasında bir hata oluştu:", err);
    await prisma.$disconnect();
    process.exit(1);
});
