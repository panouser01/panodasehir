const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const cats = await prisma.category.findMany({ select: { name: true, isStyleModeActive: true, isEditorModeActive: true, styleModeSettings: true, id: true } });
  console.log("Style Mode Active Cats:");
  console.log(cats.filter(c => c.isStyleModeActive));
  console.log("Editor Mode Active Cats:");
  console.log(cats.filter(c => c.isEditorModeActive));
}
main().catch(console.error).finally(() => prisma.$disconnect());
