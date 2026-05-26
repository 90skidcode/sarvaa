import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting catalog cleanup...");

  // 1. Delete OrderItems (referencing Products)
  // WARNING: This will leave Orders without items.
  const deletedOrderItems = await prisma.orderItem.deleteMany({});
  console.log(`Deleted ${deletedOrderItems.count} OrderItems`);

  // 2. Delete CartItems (referencing Products)
  const deletedCartItems = await prisma.cartItem.deleteMany({});
  console.log(`Deleted ${deletedCartItems.count} CartItems`);

  // 3. Delete Products (referencing Categories)
  const deletedProducts = await prisma.product.deleteMany({});
  console.log(`Deleted ${deletedProducts.count} Products`);

  // 4. Delete Categories
  const deletedCategories = await prisma.category.deleteMany({});
  console.log(`Deleted ${deletedCategories.count} Categories`);

  console.log("Catalog cleared successfully.");
}

main()
  .catch((e) => {
    console.error("Error clearing catalog:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
