import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting category migration...");

  // 1. Delete all existing products (since they are linked to categories)
  // Note: This is an irreversible destructive action as requested by the user.
  console.log("Cleaning up existing data...");
  await prisma.orderItem.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  console.log("Existing data cleared.");

  // 2. Define new categories
  const newCategories = [
    {
      name: "Cake",
      slug: "cake",
      description: "Freshly baked cakes for all occasions",
      image:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80",
    },
    {
      name: "Chips",
      slug: "chips",
      description: "Crunchy and flavored potato and banana chips",
      image:
        "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&q=80",
    },
    {
      name: "Sweets & confectionaries",
      slug: "sweets-confectionaries",
      description: "Authentic traditional sweets and delicasies",
      image:
        "https://images.unsplash.com/photo-1606858265218-4e4b7927c668?w=500&q=80",
    },
    {
      name: "Spicy snacks",
      slug: "spicy-snacks",
      description: "Traditional Tamil spicy savories and snacks",
      image:
        "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&q=80",
    },
    {
      name: "Cookies",
      slug: "cookies",
      description: "Crispy handcrafted cookies and biscuits",
      image:
        "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&q=80",
    },
    {
      name: "Mixture",
      slug: "mixture",
      description: "Assorted traditional spicy mixtures",
      image:
        "https://images.unsplash.com/photo-1613919113166-296878b1bab7?w=500&q=80",
    },
    {
      name: "Chat",
      slug: "chat",
      description: "Delicious street-style chat and items",
      image:
        "https://images.unsplash.com/photo-1505253149613-112d21d9f6a9?w=500&q=80",
    },
  ];

  console.log("Creating new categories...");
  for (const cat of newCategories) {
    await prisma.category.create({
      data: cat,
    });
  }

  console.log("Migration completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during migration:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
