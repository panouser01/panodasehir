const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Migration started...");
    let count = 0;
    
    // Bütün postitleri çek
    const postits = await prisma.postIt.findMany();
    console.log(`Found ${postits.length} Post-its.`);

    for (const postit of postits) {
        if (!postit.content) continue;

        const words = postit.content.trim().split(/\s+/);
        let newContent = postit.content;
        let newDetail = postit.content; // Eğer detail alanı hiç yoksa ya da mevcutsa üstüne yazalım

        // TipTap editor genelde p etiketleriyle formatlanmasını bekler. Fakat basic plain text de alabilir.
        // Plain text olarak content'i detaya yazıyoruz. İsteğe göre ileride html sarılabilir.
        
        if (words.length > 10) {
            newContent = words.slice(0, 10).join(' ') + '...';
        }

        try {
            await prisma.postIt.update({
                where: { id: postit.id },
                data: {
                    detail: newDetail,
                    content: newContent
                }
            });
            count++;
            if (count % 100 === 0) {
                console.log(`Processed ${count} records...`);
            }
        } catch (err) {
            console.error(`Error updating postit ${postit.id}:`, err.message);
        }
    }
    
    console.log(`Migration completed successfully. Updated ${count} records.`);
    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
