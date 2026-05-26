const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function slug(name) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[()]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Format: { type: "Grams"|"Kilograms"|"Pieces", value: "250", price: 90 }
// WeightSelector displays as "${value} ${type}" and keys as "${type}:${value}"
function w(type, value, price) {
  return { type, value: String(value), price }
}

function weights(...variants) {
  return JSON.stringify(variants.filter(Boolean))
}

const g  = (v, p) => w('Grams',     v,   p)
const kg = (v, p) => w('Kilograms', v,   p)
const pc = (v, p) => w('Pieces',    v,   p)

async function main() {
  console.log('🌱 Seeding categories...')

  const catData = [
    { name: 'Traditional Sweets', slug: 'traditional-sweets', description: 'Classic traditional Indian sweets crafted with authentic recipes', displayOrder: 1 },
    { name: 'Laddu',              slug: 'laddu',              description: 'A beloved Indian sweet made in various flavors and styles', displayOrder: 2 },
    { name: 'Halwa',              slug: 'halwa',              description: 'Soft and rich halwa varieties made with the finest ingredients', displayOrder: 3 },
    { name: 'Badusha',            slug: 'badusha',            description: 'Crispy and flaky South Indian sweets dipped in sugar syrup', displayOrder: 4 },
    { name: 'Soan Papdi',         slug: 'soan-papdi',         description: 'Light, flaky and melt-in-mouth cotton candy texture sweets', displayOrder: 5 },
    { name: 'Burfi & Katli',      slug: 'burfi-katli',        description: 'Smooth, rich and delicious burfi and katli varieties', displayOrder: 6 },
    { name: 'Peda',               slug: 'peda',               description: 'Soft milk-based sweets with unique flavors and textures', displayOrder: 7 },
    { name: 'Fancy Sweets',       slug: 'fancy-sweets',       description: 'Beautifully crafted fancy sweets for special occasions', displayOrder: 8 },
    { name: 'Milk Sweets',        slug: 'milk-sweets',        description: 'Delicious sweets made from fresh milk and dairy products', displayOrder: 9 },
    { name: 'Jamun & Rasgulla',   slug: 'jamun-rasgulla',     description: 'Soft and syrupy classic Indian milk-based sweets', displayOrder: 10 },
    { name: 'Mysore Pak',         slug: 'mysore-pak',         description: 'The iconic South Indian sweet made with ghee, besan and sugar', displayOrder: 11 },
    { name: 'Kaju Sweets',        slug: 'kaju-sweets',        description: 'Premium sweets crafted with the finest cashews', displayOrder: 12 },
    { name: 'Boondi Sweets',      slug: 'boondi-sweets',      description: 'Sweet boondi made from crispy gram flour pearls soaked in syrup', displayOrder: 13 },
  ]

  const cats = {}
  for (const c of catData) {
    const created = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, isActive: true },
    })
    cats[c.slug] = created.id
    console.log(`  ✓ ${c.name}`)
  }

  console.log('\n🌱 Seeding products...')

  // Standard 4-weight helper: 250g, 500g, 750g, 1kg
  const W4 = (a, b, c, d) => weights(g(250,a), g(500,b), g(750,c), kg(1,d))
  // Box-only item
  const WBOX = (p) => weights(pc(1, p))
  // 250g only
  const W1 = (a) => weights(g(250, a))

  const products = [
    // ── Traditional Sweets ──────────────────────────────────────────────────
    {
      name: 'Mini Jalebi', cat: 'traditional-sweets', price: 90, featured: true,
      desc: 'Crispy spiral-shaped jalebi made in mini size, soaked in saffron-infused sugar syrup.',
      w: W4(90, 180, 270, 360),
    },
    {
      name: 'Chandrakala', cat: 'traditional-sweets', price: 100,
      desc: 'Traditional crescent-shaped deep-fried pastry filled with sweetened khoya and dry fruits.',
      w: W4(100, 200, 300, 400),
    },

    // ── Laddu ───────────────────────────────────────────────────────────────
    {
      name: 'Motichoor Laddu', cat: 'laddu', price: 90, featured: true,
      desc: 'Fine-grained boondi laddus made from delicate gram flour pearls and fragrant saffron.',
      w: W4(90, 180, 270, 360),
    },
    {
      name: 'Mini Laddu', cat: 'laddu', price: 90,
      desc: 'Bite-sized traditional laddus packed with the same rich flavour as the classic size.',
      w: W4(90, 180, 270, 360),
    },
    {
      name: 'Tirupati Laddu', cat: 'laddu', price: 100,
      desc: 'Inspired by the sacred Tirupati Balaji prasad laddu — rich with besan, ghee and cardamom.',
      w: W4(100, 200, 300, 400),
    },
    {
      name: 'Dry Fruit Laddu', cat: 'laddu', price: 100,
      desc: 'Wholesome laddus studded with premium cashews, almonds, pistachios and raisins.',
      w: W4(100, 200, 300, 400),
    },
    {
      name: 'Rava Laddu', cat: 'laddu', price: 100,
      desc: 'Classic semolina laddus roasted in ghee and flavoured with cardamom and coconut.',
      w: W4(100, 200, 300, 400),
    },
    {
      name: 'Peanut Laddu & Sesame Laddu', cat: 'laddu', price: 90,
      desc: 'A delightful combo of crunchy peanut and nutty sesame laddus bound with jaggery.',
      w: W4(90, 180, 270, 360),
    },
    {
      name: 'Regular Laddu', cat: 'laddu', price: 90,
      desc: 'Our everyday besan laddu made with roasted gram flour, ghee and cardamom sugar.',
      w: W4(90, 180, 270, 360),
    },

    // ── Halwa ───────────────────────────────────────────────────────────────
    {
      name: 'Bombay Halwa', cat: 'halwa', price: 90, featured: true,
      desc: 'Chewy and glossy corn starch halwa in vibrant colours — a Bombay street classic.',
      w: W4(90, 180, 270, 360),
    },
    {
      name: 'Wheat Halwa', cat: 'halwa', price: 100,
      desc: 'Rich and aromatic whole wheat halwa slow-cooked in ghee with cashews and cardamom.',
      w: W4(100, 200, 300, 400),
    },
    {
      name: 'Pumpkin Halwa', cat: 'halwa', price: 100,
      desc: 'Delicately sweet pumpkin halwa made with fresh ash gourd, milk and ghee.',
      w: W4(100, 200, 300, 400),
    },

    // ── Badusha ─────────────────────────────────────────────────────────────
    {
      name: 'Bombay Badusha', cat: 'badusha', price: 105,
      desc: 'A larger, flakier twist on the classic badusha — deep-fried and sugar-glazed.',
      w: W4(105, 210, 315, 420),
    },
    {
      name: 'Badusha', cat: 'badusha', price: 90,
      desc: 'South Indian deep-fried pastry with a crispy outer layer and soft, flaky interior soaked in sugar syrup.',
      w: W4(90, 180, 270, 360),
    },
    {
      name: 'Mini Badusha', cat: 'badusha', price: 90,
      desc: 'Bite-sized versions of the beloved badusha — perfect for gifting and snacking.',
      w: W4(90, 180, 270, 360),
    },
    {
      name: 'Mini Button Badusha (Box)', cat: 'badusha', price: 40,
      desc: 'Tiny button-shaped badushas packed in a ready-to-gift box.',
      w: WBOX(40),
    },

    // ── Soan Papdi ──────────────────────────────────────────────────────────
    {
      name: 'White Soan Papdi', cat: 'soan-papdi', price: 90,
      desc: 'Light, airy strands of besan and flour that melt in your mouth — classic white variety.',
      w: W4(90, 180, 270, 360),
    },
    {
      name: 'Bombay Soan Papdi', cat: 'soan-papdi', price: 90,
      desc: 'Bombay-style soan papdi with a richer flavour profile and delicate flaky texture.',
      w: W4(90, 180, 270, 360),
    },

    // ── Burfi & Katli ───────────────────────────────────────────────────────
    {
      name: 'Horlicks Burfi', cat: 'burfi-katli', price: 140,
      desc: 'Creamy milk burfi infused with the malty goodness of Horlicks — loved by kids and adults.',
      w: W4(140, 280, 420, 560),
    },
    {
      name: 'Boost Burfi', cat: 'burfi-katli', price: 140,
      desc: 'Rich chocolate-malt burfi made with Boost — a unique and indulgent treat.',
      w: W4(140, 280, 420, 560),
    },
    {
      name: 'Pineapple Katli', cat: 'burfi-katli', price: 140,
      desc: 'Smooth and tangy pineapple-flavoured katli with a delicate melt-in-mouth texture.',
      w: W4(140, 280, 420, 560),
    },
    {
      name: 'Mango Katli', cat: 'burfi-katli', price: 140, featured: true,
      desc: 'Premium mango katli made with real Alphonso mango pulp — a seasonal favourite.',
      w: W4(140, 280, 420, 560),
    },
    {
      name: 'Pista Burfi', cat: 'burfi-katli', price: 140,
      desc: 'Vibrant green pistachio burfi layered with khoya and studded with chopped pistachios.',
      w: W4(140, 280, 420, 560),
    },
    {
      name: 'Strawberry Burfi', cat: 'burfi-katli', price: 140,
      desc: 'Pretty pink strawberry-flavoured burfi — delightfully fruity and visually stunning.',
      w: W4(140, 280, 420, 560),
    },
    {
      name: 'Chocolate Ice Burfi', cat: 'burfi-katli', price: 140,
      desc: 'Chilled chocolate burfi with a smooth, fudgy texture — a modern twist on the classic.',
      w: W4(140, 280, 420, 560),
    },

    // ── Peda ────────────────────────────────────────────────────────────────
    {
      name: 'Achu Peda', cat: 'peda', price: 140,
      desc: 'Mould-pressed peda with intricate designs — made from reduced milk and saffron.',
      w: W4(140, 280, 420, 560),
    },
    {
      name: 'Green Peda', cat: 'peda', price: 140,
      desc: 'Vibrant green peda flavoured with cardamom and pistachios — perfect for festive gifting.',
      w: W4(140, 280, 420, 560),
    },
    {
      name: 'Makkan Peda', cat: 'peda', price: 140,
      desc: 'Soft, butter-enriched peda with a rich creamy taste and delicate cardamom aroma.',
      w: W4(140, 280, 420, 560),
    },

    // ── Fancy Sweets ────────────────────────────────────────────────────────
    {
      name: 'Strawberry Apple (Sweet)', cat: 'fancy-sweets', price: 140,
      desc: 'Fun apple-shaped sweet with strawberry flavour — an eye-catching festive treat.',
      w: W4(140, 280, 420, 560),
    },
    {
      name: 'Butterscotch (Sweet)', cat: 'fancy-sweets', price: 140,
      desc: 'Smooth butterscotch-flavoured sweet with a buttery caramel finish.',
      w: W4(140, 280, 420, 560),
    },
    {
      name: 'Chocolate Roll', cat: 'fancy-sweets', price: 140,
      desc: 'Decadent chocolate sweet rolls crafted for chocolate lovers — rich and indulgent.',
      w: W4(140, 280, 420, 560),
    },
    {
      name: 'Agra Paan', cat: 'fancy-sweets', price: 140,
      desc: 'Sweet paan-shaped delicacy inspired by Agra\'s famous meetha paan — aromatic and unique.',
      w: W4(140, 280, 420, 560),
    },

    // ── Milk Sweets ─────────────────────────────────────────────────────────
    {
      name: 'Special Milk Cake', cat: 'milk-sweets', price: 140,
      desc: 'Dense, caramelised milk cake with a grainy texture and rich dairy flavour — an Agra classic.',
      w: W4(140, 280, 420, 560),
    },
    {
      name: 'Kalakand', cat: 'milk-sweets', price: 140, featured: true,
      desc: 'Moist and crumbly milk-based sweet with a rich texture, garnished with pistachios.',
      w: W4(140, 280, 420, 560),
    },

    // ── Jamun & Rasgulla ────────────────────────────────────────────────────
    {
      name: 'Round Jamun', cat: 'jamun-rasgulla', price: 140,
      desc: 'Perfectly round, spongy gulab jamun soaked in rose-flavoured sugar syrup.',
      w: W4(140, 280, 420, 560),
    },
    {
      name: 'Dry Jamun', cat: 'jamun-rasgulla', price: 140,
      desc: 'Less-syrupy dry gulab jamun — ideal for those who prefer a lighter sweetness.',
      w: W4(140, 280, 420, 560),
    },
    {
      name: 'Mini Jamun Box', cat: 'jamun-rasgulla', price: 140,
      desc: 'A ready-to-gift box of bite-sized mini gulab jamuns — perfect for sharing.',
      w: W1(140),
    },
    {
      name: 'Mini Rasgulla Box', cat: 'jamun-rasgulla', price: 140,
      desc: 'Soft, spongy mini rasgullas packed in a gift-ready box — light and refreshing.',
      w: W1(140),
    },

    // ── Mysore Pak ──────────────────────────────────────────────────────────
    {
      name: 'Ghee Mysore Pak', cat: 'mysore-pak', price: 140, featured: true,
      desc: 'The original Mysore Pak — rich, porous and melt-in-mouth with generous pure ghee.',
      w: W4(140, 280, 420, 560),
    },
    {
      name: 'Milk Mysore Pak', cat: 'mysore-pak', price: 140,
      desc: 'Creamy milk-based Mysore Pak with a softer texture and delicate dairy flavour.',
      w: W4(140, 280, 420, 560),
    },
    {
      name: 'Carrot Mysore Pak', cat: 'mysore-pak', price: 140,
      desc: 'A vibrant twist on the classic — Mysore Pak infused with fresh carrot for natural sweetness.',
      w: W4(140, 280, 420, 560),
    },
    {
      name: 'Karupatti Mysore Pak', cat: 'mysore-pak', price: 170,
      desc: 'Health-conscious Mysore Pak sweetened with palm jaggery (karupatti) — rich and aromatic.',
      w: W4(170, 340, 510, 680),
    },
    {
      name: 'Dates Mysore Pak', cat: 'mysore-pak', price: 140,
      desc: 'Naturally sweetened Mysore Pak made with premium dates — a healthier indulgence.',
      w: W4(140, 280, 420, 560),
    },

    // ── Kaju Sweets ─────────────────────────────────────────────────────────
    {
      name: 'Kaju Katli', cat: 'kaju-sweets', price: 275, featured: true,
      desc: 'The king of Indian sweets — smooth, paper-thin cashew katli with a silver vark finish.',
      w: W4(275, 550, 825, 1100),
    },
    {
      name: 'Kaju Pista Strawberry', cat: 'kaju-sweets', price: 300,
      desc: 'Three-layered cashew sweet with pistachio and strawberry — a colourful premium treat.',
      w: W4(300, 600, 900, 1200),
    },
    {
      name: 'Kaju Sandwich', cat: 'kaju-sweets', price: 300,
      desc: 'Layered cashew sweet sandwiched with pistachio and khoya filling — rich and indulgent.',
      w: W4(300, 600, 900, 1200),
    },
    {
      name: 'Fig Kaju Roll', cat: 'kaju-sweets', price: 300,
      desc: 'Premium cashew roll stuffed with Athipazham (fig) — a unique and healthy sweet.',
      w: W4(300, 600, 900, 1200),
    },
    {
      name: 'Kaju Flower', cat: 'kaju-sweets', price: 300,
      desc: 'Artistically crafted flower-shaped cashew sweets — stunning for gifting occasions.',
      w: W4(300, 600, 900, 1200),
    },
    {
      name: 'Kaju Chocolate Laddu', cat: 'kaju-sweets', price: 300,
      desc: 'Luxurious laddus combining the richness of cashews with the indulgence of chocolate.',
      w: W4(300, 600, 900, 1200),
    },
    {
      name: 'Kaju Badam Laddu', cat: 'kaju-sweets', price: 300,
      desc: 'Premium laddus made with a blend of cashews and almonds — rich and nutritious.',
      w: W4(300, 600, 900, 1200),
    },
    {
      name: 'Kaju Laddu', cat: 'kaju-sweets', price: 300,
      desc: 'Classic cashew laddus — smooth, rich and perfect for festivals and celebrations.',
      w: W4(300, 600, 900, 1200),
    },
    {
      name: 'Kaju Rose Laddu', cat: 'kaju-sweets', price: 300,
      desc: 'Fragrant rose-flavoured cashew laddus with a delicate floral aroma.',
      w: W4(300, 600, 900, 1200),
    },
    {
      name: 'Kaju Biscuit', cat: 'kaju-sweets', price: 300,
      desc: 'Crisp cashew biscuit-shaped sweets — a delightful and unique cashew delicacy.',
      w: W4(300, 600, 900, 1200),
    },
    {
      name: 'Mini Kaju Katli (Box)', cat: 'kaju-sweets', price: 120,
      desc: 'Adorable mini kaju katlis packed in a ready-to-gift box — great for festive giving.',
      w: WBOX(120),
    },

    // ── Boondi Sweets ───────────────────────────────────────────────────────
    {
      name: 'Sweet Boondi', cat: 'boondi-sweets', price: 100,
      desc: 'Tiny golden gram flour pearls deep-fried and tossed in sugar syrup with cardamom.',
      w: W1(100),
    },
  ]

  let count = 0
  for (const p of products) {
    const catId = cats[p.cat]
    if (!catId) { console.warn(`  ⚠ No category found for slug "${p.cat}" — skipping ${p.name}`); continue }

    await prisma.product.create({
      data: {
        name: p.name,
        slug: slug(p.name),
        description: p.desc,
        price: p.price,
        image: '/products/placeholder.jpg',
        stock: 100,
        featured: p.featured ?? false,
        isActive: true,
        categoryId: catId,
        weights: p.w,
      },
    })
    console.log(`  ✓ ${p.name} (₹${p.price})`)
    count++
  }

  console.log(`\n✅ Done — ${Object.keys(cats).length} categories, ${count} products seeded.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
