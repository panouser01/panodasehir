const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    const customLayout = [{
      id: "test", 
      type: "category_posts", 
      categoryId: "", 
      ribbonColor: "#502bb1", 
      width: "full", 
      backgroundImage: "panodasehir001.png"
    }];
    await prisma.category.update({
      where: { id: "cmmhvhwof0001w8q547vndb0c" },
      data: { customLayout: customLayout }
    });
    console.log("Success update test");
  } catch (err) {
    console.error("Prisma error:", err);
  }
}
run().finally(() => process.exit());
