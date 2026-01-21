import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@sarvaasweets.com" },
    update: {},
    create: {
      email: "admin@sarvaasweets.com",
      name: "Karthik Raja",
      password: adminPassword,
      role: "admin",
      phone: "+91-9876543210",
      address: "123, T. Nagar Main Road, Chennai 600017",
    },
  });
  console.log("Created admin user:", admin.email);

  // Create customer user
  const customerPassword = await hash("customer123", 10);
  const customer = await prisma.user.upsert({
    where: { email: "priya.sharma@example.com" },
    update: {},
    create: {
      email: "lakshmi.priya@example.com",
      name: "Lakshmi Priya",
      password: customerPassword,
      role: "customer",
      phone: "+91-9123456789",
      address: "45, Anna Salai, Madurai 625001",
    },
  });
  console.log("Created customer user:", customer.email);

  // Create categories
  const traditionalCategory = await prisma.category.upsert({
    where: { slug: "traditional-tn" },
    update: {},
    create: {
      name: "Traditional TN Sweets",
      slug: "traditional-tn",
      description: "Authentic Tamil Nadu sweets made with traditional recipes",
      image:
        "https://images.unsplash.com/photo-1606858265218-4e4b7927c668?w=500&q=80",
    },
  });

  const templeCategory = await prisma.category.upsert({
    where: { slug: "temple-prasadam" },
    update: {},
    create: {
      name: "Temple Prasadam Sweets",
      slug: "temple-prasadam",
      description: "Divine sweets offered in famous Tamil temples",
      image:
        "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&q=80",
    },
  });

  const chettinadCategory = await prisma.category.upsert({
    where: { slug: "chettinad-specials" },
    update: {},
    create: {
      name: "Chettinad Specials",
      slug: "chettinad-specials",
      description: "Rich Chettinad sweets with pure ghee and jaggery",
      image:
        "https://images.unsplash.com/photo-1571696905784-f0a4e4e9b39a?w=500&q=80",
    },
  });

  const festivalCategory = await prisma.category.upsert({
    where: { slug: "festival-specials" },
    update: {},
    create: {
      name: "Festival Specials",
      slug: "festival-specials",
      description: "Special sweets for Pongal, Diwali, and celebrations",
      image:
        "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500&q=80",
    },
  });

  const giftBoxCategory = await prisma.category.upsert({
    where: { slug: "gift-boxes" },
    update: {},
    create: {
      name: "Gift Boxes",
      slug: "gift-boxes",
      description: "Curated Tamil sweet boxes perfect for gifting",
      image:
        "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80",
    },
  });

  console.log("Created categories");

  // Create products
  const products = [
    {
      name: "Mysore Pak Premium",
      slug: "mysore-pak-premium",
      description:
        "Ghee-rich Mysore Pak with pure ghee and gram flour. Melts in your mouth.",
      price: 649,
      weights: JSON.stringify([
        { weight: "250g", price: 349 },
        { weight: "500g", price: 649 },
        { weight: "1kg", price: 1199 },
      ]),
      image:
        "https://images.unsplash.com/photo-1606858265218-4e4b7927c668?w=500&q=80",
      stock: 30,
      featured: true,
      categoryId: traditionalCategory.id,
    },
    {
      name: "Tirunelveli Halwa",
      slug: "tirunelveli-halwa",
      description:
        "Authentic wheat halwa from Tirunelveli with pure ghee and dry fruits.",
      price: 799,
      weights: JSON.stringify([
        { weight: "250g", price: 449 },
        { weight: "500g", price: 799 },
        { weight: "1kg", price: 1499 },
      ]),
      image:
        "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&q=80",
      stock: 25,
      featured: true,
      categoryId: templeCategory.id,
    },
    {
      name: "Adhirasam",
      slug: "adhirasam",
      description:
        "Traditional deep-fried jaggery sweet, perfect for festivals and celebrations.",
      price: 449,
      weights: JSON.stringify([
        { weight: "250g", price: 249 },
        { weight: "500g", price: 449 },
        { weight: "1kg", price: 799 },
      ]),
      image:
        "https://images.unsplash.com/photo-1571696905784-f0a4e4e9b39a?w=500&q=80",
      stock: 35,
      featured: true,
      categoryId: festivalCategory.id,
    },
    {
      name: "Palgova",
      slug: "palgova",
      description:
        "Soft milk peda from Srivilliputhur, made with pure milk and sugar.",
      price: 599,
      weights: JSON.stringify([
        { weight: "250g", price: 349 },
        { weight: "500g", price: 599 },
        { weight: "1kg", price: 1099 },
      ]),
      image:
        "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500&q=80",
      stock: 28,
      featured: true,
      categoryId: templeCategory.id,
    },
    {
      name: "Kovilpatti Kadalai Mittai",
      slug: "kovilpatti-kadalai-mittai",
      description: "Famous peanut candy from Kovilpatti with jaggery coating.",
      price: 349,
      weights: JSON.stringify([
        { weight: "250g", price: 199 },
        { weight: "500g", price: 349 },
        { weight: "1kg", price: 649 },
      ]),
      image:
        "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500&q=80",
      stock: 40,
      featured: true,
      categoryId: chettinadCategory.id,
    },
    {
      name: "Jangiri (Jilebi)",
      slug: "jangiri-jilebi",
      description: "Crispy, sweet Tamil-style jangiri soaked in sugar syrup.",
      price: 499,
      weights: JSON.stringify([
        { weight: "250g", price: 279 },
        { weight: "500g", price: 499 },
        { weight: "1kg", price: 899 },
      ]),
      image:
        "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=500&q=80",
      stock: 30,
      featured: true,
      categoryId: traditionalCategory.id,
    },
    {
      name: "Badusha",
      slug: "badusha",
      description:
        "Flaky layered sweet soaked in sugar syrup, a festival favorite.",
      price: 549,
      weights: JSON.stringify([
        { weight: "250g", price: 299 },
        { weight: "500g", price: 549 },
        { weight: "1kg", price: 999 },
      ]),
      image:
        "https://images.unsplash.com/photo-1606858265279-aa9271e08fd4?w=500&q=80",
      stock: 32,
      featured: false,
      categoryId: festivalCategory.id,
    },
    {
      name: "Milk Mysore Pak",
      slug: "milk-mysore-pak",
      description: "Lighter version of Mysore Pak made with milk and ghee.",
      price: 599,
      weights: JSON.stringify([
        { weight: "250g", price: 329 },
        { weight: "500g", price: 599 },
        { weight: "1kg", price: 1099 },
      ]),
      image:
        "https://images.unsplash.com/photo-1631452181324-9c7c748529c9?w=500&q=80",
      stock: 25,
      featured: false,
      categoryId: traditionalCategory.id,
    },
    {
      name: "Chettinad Dry Fruit Mix",
      slug: "chettinad-dry-fruit-mix",
      description:
        "Premium sweet mix with cashews, almonds, and dates in jaggery.",
      price: 899,
      weights: JSON.stringify([
        { weight: "250g", price: 499 },
        { weight: "500g", price: 899 },
        { weight: "1kg", price: 1699 },
      ]),
      image:
        "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500&q=80",
      stock: 20,
      featured: false,
      categoryId: chettinadCategory.id,
    },
    {
      name: "Festival Sweet Box",
      slug: "festival-sweet-box",
      description:
        "Curated Tamil sweet box: Mysore Pak, Adhirasam, Badusha (12 pieces).",
      price: 899,
      image:
        "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80",
      stock: 18,
      featured: false,
      categoryId: giftBoxCategory.id,
    },
    {
      name: "Ellu Urundai (Sesame Balls)",
      slug: "ellu-urundai",
      description:
        "Healthy sesame and jaggery balls, traditional Pongal sweet.",
      price: 399,
      weights: JSON.stringify([
        { weight: "250g", price: 219 },
        { weight: "500g", price: 399 },
        { weight: "1kg", price: 749 },
      ]),
      image:
        "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500&q=80",
      stock: 35,
      featured: false,
      categoryId: festivalCategory.id,
    },
    {
      name: "Premium Temple Gift Box",
      slug: "premium-temple-gift-box",
      description:
        "Luxury assortment featuring Tirunelveli Halwa, Palgova, and Mysore Pak.",
      price: 1499,
      image:
        "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80",
      stock: 12,
      featured: false,
      categoryId: giftBoxCategory.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  console.log("Created products");
  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
