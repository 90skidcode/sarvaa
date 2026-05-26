import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create admin user
  const adminPassword = await hash("admin123", 10);
  await prisma.user.upsert({
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

  // 2. Create categories
  const categoriesData = [
    {
      name: "Cake",
      slug: "cake",
      description: "Freshly baked cakes for all occasions",
      image:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80",
      displayOrder: 1,
    },
    {
      name: "Sweets & confectionaries",
      slug: "sweets-confectionaries",
      description: "Authentic traditional sweets and delicacies",
      image:
        "https://images.unsplash.com/photo-1606858265218-4e4b7927c668?w=500&q=80",
      displayOrder: 2,
    },
    {
      name: "Chips",
      slug: "chips",
      description: "Crunchy and flavored potato and banana chips",
      image:
        "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&q=80",
      displayOrder: 3,
    },
    {
      name: "Spicy snacks",
      slug: "spicy-snacks",
      description: "Traditional Tamil spicy savories and snacks",
      image:
        "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&q=80",
      displayOrder: 4,
    },
    {
      name: "Mixture",
      slug: "mixture",
      description: "Assorted traditional spicy mixtures",
      image:
        "https://images.unsplash.com/photo-1613919113166-296878b1bab7?w=500&q=80",
      displayOrder: 5,
    },
    {
      name: "Chat",
      slug: "chat",
      description: "Delicious street-style chat and items",
      image:
        "https://images.unsplash.com/photo-1505253149613-112d21d9f6a9?w=500&q=80",
      displayOrder: 6,
    },
    {
      name: "Cookies",
      slug: "cookies",
      description: "Crispy handcrafted cookies and biscuits",
      image:
        "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&q=80",
      displayOrder: 7,
    },
  ];

  const categoriesMap: Record<string, string> = {};

  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat as any,
      create: cat as any,
    });
    categoriesMap[cat.slug] = category.id;
  }

  // 3. Create products
  const productsData = [
    // --- CAKE (6) ---
    {
      name: "Eggless Black Forest Cake",
      slug: "eggless-black-forest-cake",
      description: "Classic chocolate sponge with whipped cream and cherries.",
      price: 599,
      image:
        "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=500&q=80",
      categoryId: categoriesMap["cake"],
      featured: true,
      weights: JSON.stringify([
        { weight: "500g", price: 599 },
        { weight: "1kg", price: 1099 },
      ]),
    },
    {
      name: "Butterscotch Premium Cake",
      slug: "butterscotch-premium-cake",
      description: "Rich butterscotch flavor with crunchy pralines.",
      price: 549,
      image:
        "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=500&q=80",
      categoryId: categoriesMap["cake"],
      weights: JSON.stringify([
        { weight: "500g", price: 549 },
        { weight: "1kg", price: 999 },
      ]),
    },
    {
      name: "Fresh Pineapple Cake",
      slug: "fresh-pineapple-cake",
      description: "Tropical pineapple chunks with smooth cream.",
      price: 499,
      image:
        "https://images.unsplash.com/photo-1611293388250-580b06c59df1?w=500&q=80",
      categoryId: categoriesMap["cake"],
      weights: JSON.stringify([
        { weight: "500g", price: 499 },
        { weight: "1kg", price: 899 },
      ]),
    },
    {
      name: "Chocolate Truffle Cake",
      slug: "chocolate-truffle-cake",
      description: "Deep, chocolatey, and sinful truffle layers.",
      price: 649,
      image:
        "https://images.unsplash.com/photo-1606313564059-44672f222712?w=500&q=80",
      categoryId: categoriesMap["cake"],
      featured: true,
      weights: JSON.stringify([
        { weight: "500g", price: 649 },
        { weight: "1kg", price: 1199 },
      ]),
    },
    {
      name: "Red Velvet Celebration Cake",
      slug: "red-velvet-celebration-cake",
      description: "Elegant red sponge with silky cream cheese frosting.",
      price: 699,
      image:
        "https://images.unsplash.com/photo-1616030997102-28567ed8946c?w=500&q=80",
      categoryId: categoriesMap["cake"],
      weights: JSON.stringify([
        { weight: "500g", price: 699 },
        { weight: "1kg", price: 1299 },
      ]),
    },
    {
      name: "Classic Vanilla Bean Cake",
      slug: "classic-vanilla-bean-cake",
      description: "Symphony of pure vanilla beans and soft sponge.",
      price: 449,
      image:
        "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&q=80",
      categoryId: categoriesMap["cake"],
      weights: JSON.stringify([
        { weight: "500g", price: 449 },
        { weight: "1kg", price: 799 },
      ]),
    },

    // --- CHIPS (4) ---
    {
      name: "Kerala Banana Chips (Nendran)",
      slug: "kerala-banana-chips",
      description: "Authentic nendran banana chips fried in pure coconut oil.",
      price: 149,
      image:
        "https://images.unsplash.com/photo-1613919113166-296878b1bab7?w=500&q=80",
      categoryId: categoriesMap["chips"],
      weights: JSON.stringify([
        { weight: "250g", price: 149 },
        { weight: "500g", price: 279 },
      ]),
    },
    {
      name: "Spicy Masala Potato Chips",
      slug: "spicy-masala-potato-chips",
      description: "Thinly sliced potatoes with a fiery spice blend.",
      price: 69,
      image:
        "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&q=80",
      categoryId: categoriesMap["chips"],
      weights: JSON.stringify([
        { weight: "100g", price: 69 },
        { weight: "250g", price: 159 },
      ]),
    },
    {
      name: "Classic Salted Potato Chips",
      slug: "classic-salted-potato-chips",
      description: "Crispy and light potato chips with sea salt.",
      price: 59,
      image:
        "https://images.unsplash.com/photo-1621447509323-570a2717f931?w=500&q=80",
      categoryId: categoriesMap["chips"],
      weights: JSON.stringify([
        { weight: "100g", price: 59 },
        { weight: "250g", price: 139 },
      ]),
    },
    {
      name: "Tapioca (Maravalli) Chips",
      slug: "tapioca-maravalli-chips",
      description: "Traditional Tamil Nadu tapioca chips, crunchy and hard.",
      price: 129,
      image:
        "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&q=80",
      categoryId: categoriesMap["chips"],
      weights: JSON.stringify([
        { weight: "250g", price: 129 },
        { weight: "500g", price: 239 },
      ]),
    },

    // --- SWEETS (12) ---
    {
      name: "Mysore Pak Premium",
      slug: "mysore-pak-premium",
      description: "Melt-in-mouth ghee-rich traditional sweet from Mysore.",
      price: 199,
      image:
        "https://images.unsplash.com/photo-1606858265218-4e4b7927c668?w=500&q=80",
      categoryId: categoriesMap["sweets-confectionaries"],
      featured: true,
      weights: JSON.stringify([
        { weight: "250g", price: 199 },
        { weight: "500g", price: 389 },
        { weight: "1kg", price: 749 },
      ]),
    },
    {
      name: "Tirunelveli Halwa",
      slug: "tirunelveli-halwa",
      description: "Authentic wheat halwa made with Thamirabarani water.",
      price: 179,
      image:
        "https://images.unsplash.com/photo-1589113103503-496a9d91443b?w=500&q=80",
      categoryId: categoriesMap["sweets-confectionaries"],
      featured: true,
      weights: JSON.stringify([
        { weight: "250g", price: 179 },
        { weight: "500g", price: 349 },
        { weight: "1kg", price: 679 },
      ]),
    },
    {
      name: "Traditional Adhirasam",
      slug: "traditional-adhirasam",
      description: "Deep-fried jaggery and rice flour delicacy.",
      price: 129,
      image:
        "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&q=80",
      categoryId: categoriesMap["sweets-confectionaries"],
      weights: JSON.stringify([
        { weight: "250g", price: 129 },
        { weight: "500g", price: 249 },
        { weight: "1kg", price: 479 },
      ]),
    },
    {
      name: "Srivilliputhur Palgova",
      slug: "srivilliputhur-palgova",
      description: "Concentrated milk sweet from the temple city.",
      price: 189,
      image:
        "https://images.unsplash.com/photo-1606858265218-4e4b7927c668?w=500&q=80",
      categoryId: categoriesMap["sweets-confectionaries"],
      weights: JSON.stringify([
        { weight: "250g", price: 189 },
        { weight: "500g", price: 369 },
        { weight: "1kg", price: 719 },
      ]),
    },
    {
      name: "Kovilpatti Kadalai Mittai",
      slug: "kovilpatti-kadalai-mittai",
      description: "Nutritious peanut candy bar with jaggery.",
      price: 99,
      image:
        "https://images.unsplash.com/photo-1613919113166-296878b1bab7?w=500&q=80",
      categoryId: categoriesMap["sweets-confectionaries"],
      weights: JSON.stringify([
        { weight: "250g", price: 99 },
        { weight: "500g", price: 189 },
        { weight: "1kg", price: 359 },
      ]),
    },
    {
      name: "Tamil Style Jangiri",
      slug: "tamil-style-jangiri",
      description: "Traditional flower-shaped urad dal sweet.",
      price: 149,
      image:
        "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=500&q=80",
      categoryId: categoriesMap["sweets-confectionaries"],
      weights: JSON.stringify([
        { weight: "250g", price: 149 },
        { weight: "500g", price: 289 },
        { weight: "1kg", price: 549 },
      ]),
    },
    {
      name: "Classic Badusha",
      slug: "classic-badusha",
      description: "Flaky and soft layered sugar-glazed sweet.",
      price: 139,
      image:
        "https://images.unsplash.com/photo-1606858265218-4e4b7927c668?w=500&q=80",
      categoryId: categoriesMap["sweets-confectionaries"],
      weights: JSON.stringify([
        { weight: "250g", price: 139 },
        { weight: "500g", price: 269 },
        { weight: "1kg", price: 519 },
      ]),
    },
    {
      name: "Milk Mysore Pak",
      slug: "milk-mysore-pak",
      description: "Lighter, milkier version of the classic Mysore Pak.",
      price: 169,
      image:
        "https://images.unsplash.com/photo-1606858265218-4e4b7927c668?w=500&q=80",
      categoryId: categoriesMap["sweets-confectionaries"],
      weights: JSON.stringify([
        { weight: "250g", price: 169 },
        { weight: "500g", price: 329 },
        { weight: "1kg", price: 629 },
      ]),
    },
    {
      name: "Chettinad Dry Fruit Mix",
      slug: "chettinad-dry-fruit-mix",
      description: "Premium selection of nuts and dried fruits.",
      price: 349,
      image:
        "https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=500&q=80",
      categoryId: categoriesMap["sweets-confectionaries"],
      weights: JSON.stringify([
        { weight: "250g", price: 349 },
        { weight: "500g", price: 679 },
        { weight: "1kg", price: 1299 },
      ]),
    },
    {
      name: "Festival Sweet Box",
      slug: "festival-sweet-box",
      description: "Curated assortment of our best traditional sweets.",
      price: 499,
      image:
        "https://images.unsplash.com/photo-1589113103503-496a9d91443b?w=500&q=80",
      categoryId: categoriesMap["sweets-confectionaries"],
      weights: JSON.stringify([
        { weight: "500g", price: 499 },
        { weight: "1kg", price: 949 },
      ]),
    },
    {
      name: "Ellu Urundai (Sesame Balls)",
      slug: "ellu-urundai",
      description: "Traditional sesame and jaggery energy balls.",
      price: 119,
      image:
        "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&q=80",
      categoryId: categoriesMap["sweets-confectionaries"],
      weights: JSON.stringify([
        { weight: "250g", price: 119 },
        { weight: "500g", price: 229 },
      ]),
    },
    {
      name: "Premium Temple Gift Box",
      slug: "premium-temple-gift-box",
      description: "Luxury gift box with authentic temple town treats.",
      price: 1499,
      image:
        "https://images.unsplash.com/photo-1589113103503-496a9d91443b?w=500&q=80",
      categoryId: categoriesMap["sweets-confectionaries"],
      weights: JSON.stringify([{ weight: "1kg", price: 1499 }]),
    },

    // --- SNACKS (4) ---
    {
      name: "Traditional Kai Murukku",
      slug: "traditional-kai-murukku",
      description: "Hand-twirled traditional spicy murukku.",
      price: 159,
      image:
        "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&q=80",
      categoryId: categoriesMap["spicy-snacks"],
      featured: true,
      weights: JSON.stringify([
        { weight: "250g", price: 159 },
        { weight: "500g", price: 299 },
      ]),
    },
    {
      name: "Spicy Thattai",
      slug: "spicy-thattai",
      description: "Crunchy rice and dal crackers with spices.",
      price: 139,
      image:
        "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&q=80",
      categoryId: categoriesMap["spicy-snacks"],
      weights: JSON.stringify([
        { weight: "250g", price: 139 },
        { weight: "500g", price: 259 },
      ]),
    },
    {
      name: "Pepper Kara Sev",
      slug: "pepper-kara-sev",
      description: "Crispy fried gram flour strands with black pepper.",
      price: 129,
      image:
        "https://images.unsplash.com/photo-1613919113166-296878b1bab7?w=500&q=80",
      categoryId: categoriesMap["spicy-snacks"],
      weights: JSON.stringify([
        { weight: "250g", price: 129 },
        { weight: "500g", price: 239 },
      ]),
    },
    {
      name: "Butter Murukku",
      slug: "butter-murukku",
      description: "Soft and crunchy murukku with fresh butter.",
      price: 119,
      image:
        "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&q=80",
      categoryId: categoriesMap["spicy-snacks"],
      weights: JSON.stringify([
        { weight: "250g", price: 119 },
        { weight: "500g", price: 219 },
      ]),
    },

    // --- COOKIES (4) ---
    {
      name: "Premium Butter Cookies",
      slug: "premium-butter-cookies",
      description: "Handcrafted cookies made with pure high-quality butter.",
      price: 199,
      image:
        "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&q=80",
      categoryId: categoriesMap["cookies"],
      weights: JSON.stringify([{ weight: "250g", price: 199 }]),
    },
    {
      name: "Traditional Salt Cookies",
      slug: "traditional-salt-cookies",
      description: "Classic sweet and salty snacks perfectly baked.",
      price: 149,
      image:
        "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&q=80",
      categoryId: categoriesMap["cookies"],
      weights: JSON.stringify([{ weight: "250g", price: 149 }]),
    },
    {
      name: "Cardamom (Elaichi) Biscuits",
      slug: "cardamom-biscuits",
      description: "Fragrant cookies with fresh ground cardamom.",
      price: 169,
      image:
        "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&q=80",
      categoryId: categoriesMap["cookies"],
      weights: JSON.stringify([{ weight: "250g", price: 169 }]),
    },
    {
      name: "Roasted Cashew Cookies",
      slug: "roasted-cashew-cookies",
      description: "Rich cookies loaded with toasted cashew pieces.",
      price: 229,
      image:
        "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&q=80",
      categoryId: categoriesMap["cookies"],
      featured: true,
      weights: JSON.stringify([{ weight: "250g", price: 229 }]),
    },

    // --- MIXTURE (6) ---
    {
      name: "Special South Indian Mixture",
      slug: "special-south-indian-mixture",
      description: "Iconic mixture with fried nuts and variety of savories.",
      price: 149,
      image:
        "https://images.unsplash.com/photo-1613919113166-296878b1bab7?w=500&q=80",
      categoryId: categoriesMap["mixture"],
      featured: true,
      weights: JSON.stringify([
        { weight: "250g", price: 149 },
        { weight: "500g", price: 279 },
      ]),
    },
    {
      name: "Spicy Madras Mixture",
      slug: "spicy-madras-mixture",
      description: "Authentic Chennai style spicy mixture.",
      price: 139,
      image:
        "https://images.unsplash.com/photo-1613919113166-296878b1bab7?w=500&q=80",
      categoryId: categoriesMap["mixture"],
      weights: JSON.stringify([
        { weight: "250g", price: 139 },
        { weight: "500g", price: 259 },
      ]),
    },
    {
      name: "Cornflakes Mixture",
      slug: "cornflakes-mixture",
      description: "Crunchy cornflakes mixed with nuts and spices.",
      price: 159,
      image:
        "https://images.unsplash.com/photo-1613919113166-296878b1bab7?w=500&q=80",
      categoryId: categoriesMap["mixture"],
      weights: JSON.stringify([
        { weight: "250g", price: 159 },
        { weight: "500g", price: 299 },
      ]),
    },
    {
      name: "Spicy Kara Boondi",
      slug: "spicy-kara-boondi",
      description: "Fried chickpea flour balls with curry leaves.",
      price: 119,
      image:
        "https://images.unsplash.com/photo-1613919113166-296878b1bab7?w=500&q=80",
      categoryId: categoriesMap["mixture"],
      weights: JSON.stringify([
        { weight: "250g", price: 119 },
        { weight: "500g", price: 219 },
      ]),
    },
    {
      name: "Common Omapodi (Sev)",
      slug: "common-omapodi-sev",
      description: "Fine, delicate fried gram flour strands.",
      price: 109,
      image:
        "https://images.unsplash.com/photo-1613919113166-296878b1bab7?w=500&q=80",
      categoryId: categoriesMap["mixture"],
      weights: JSON.stringify([
        { weight: "250g", price: 109 },
        { weight: "500g", price: 199 },
      ]),
    },
    {
      name: "Ribbon Pakoda",
      slug: "ribbon-pakoda",
      description: "Wide, flat crispy strands fried to perfection.",
      price: 129,
      image:
        "https://images.unsplash.com/photo-1613919113166-296878b1bab7?w=500&q=80",
      categoryId: categoriesMap["mixture"],
      weights: JSON.stringify([
        { weight: "250g", price: 129 },
        { weight: "500g", price: 239 },
      ]),
    },

    // --- CHAT (2) ---
    {
      name: "Pani Puri Kit",
      slug: "pani-puri-kit",
      description: "Complete kit for street-style Pani Puri at home.",
      price: 199,
      image:
        "https://images.unsplash.com/photo-1505253149613-112d21d9f6a9?w=500&q=80",
      categoryId: categoriesMap["chat"],
      weights: JSON.stringify([{ weight: "1 Unit", price: 199 }]),
    },
    {
      name: "Masala Puri",
      slug: "masala-puri",
      description: "Iconic crushed puri with warm spicy peas masala.",
      price: 149,
      image:
        "https://images.unsplash.com/photo-1505253149613-112d21d9f6a9?w=500&q=80",
      categoryId: categoriesMap["chat"],
      weights: JSON.stringify([{ weight: "1 Unit", price: 149 }]),
    },
  ];

  for (const product of productsData) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: {
        ...product,
        stock: 100, // Default stock for seeding
      },
    });
  }

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
