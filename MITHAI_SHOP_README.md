# Sarvaa Sweets - Premium Indian Mithai E-Commerce Platform

A full-stack e-commerce application built with Next.js 16, TypeScript, Prisma, and shadcn/ui for an authentic Indian sweet shop (mithai store).

## 🚀 Technology Stack

- **Frontend Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (New York style)
- **Database**: Prisma ORM with SQLite
- **Authentication**: Custom auth with bcryptjs
- **Icons**: Lucide React

## ✨ Features

### Customer Website

- 🏠 Beautiful homepage with hero section featuring traditional Indian aesthetics
- 🍬 Product catalog with Indian sweet categories (Mithai, Bengali Sweets, Festival Specials)
- 🛒 Shopping cart with add/remove/quantity controls
- 📦 Product stock management
- 📱 Fully responsive design
- 🎨 Modern UI with purple gradient theme inspired by Indian festivities

### Admin Panel

- 📊 Dashboard with statistics (orders, revenue, products, users)
- 📦 Product management (CRUD operations for sweets)
- 📋 Order management with status workflow
- 🏷️ Category management (Mithai, Bengali, Festival, Dry Fruit, Gift Boxes)
- 👥 User management
- 🔍 Search and filtering capabilities

### Backend API

- RESTful API for all operations
- Products API (GET, POST, PUT, DELETE)
- Categories API (GET, POST)
- Orders API (GET, POST, PUT)
- Cart API (GET, POST, PUT, DELETE)
- Authentication API (register, login)

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Homepage with Indian sweet shop theme
│   ├── products/page.tsx           # Sweet catalog
│   ├── cart/page.tsx               # Shopping cart
│   ├── admin/
│   │   ├── page.tsx                # Admin dashboard
│   │   ├── products/page.tsx       # Sweet management
│   │   └── orders/page.tsx         # Order management
│   └── api/
│       ├── products/               # Products API
│       ├── categories/            # Categories API
│       ├── orders/                # Orders API
│       ├── cart/                  # Cart API
│       └── auth/                  # Authentication API
├── components/
│   └── ui/                        # shadcn/ui components
└── lib/
    ├── db.ts                      # Prisma client
    └── utils.ts                   # Utility functions

prisma/
├── schema.prisma                   # Database schema
└── seed.ts                        # Database seeding with Indian sweets
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+
- npm (or bun/yarn)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
# Create .env file with:
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

3. Set up the database:

```bash
npm run db:push
```

4. Seed the database with Indian sweets:

```bash
npm run db:seed
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📊 Database Schema

### Models

- **User**: Customer and admin accounts with Indian names and addresses
- **Category**: Sweet categories (Premium Mithai, Bengali Delicacies, Festival Specials, Dry Fruit, Gift Boxes)
- **Product**: Indian sweets with images, prices in ₹, stock
- **Order**: Customer orders with status tracking
- **OrderItem**: Individual sweets in orders
- **CartItem**: Shopping cart items

### Default Credentials

**Admin User:**

- Email: admin@sarvaasweets.com
- Password: admin123
- Name: Rajesh Kumar
- Location: Delhi

**Test Customer:**

- Email: priya.sharma@example.com
- Password: customer123
- Name: Priya Sharma
- Location: Mumbai

## 🎨 Pages

### Customer Pages

- `/` - Homepage with featured Indian sweets (Kaju Katli, Rasgulla, etc.)
- `/products` - Sweet catalog with category filtering
- `/cart` - Shopping cart

### Admin Pages

- `/admin` - Dashboard with statistics
- `/admin/products` - Sweet management
- `/admin/orders` - Order management

## 🔧 API Endpoints

### Products

- `GET /api/products` - List sweets (supports query params: category, featured, search)
- `POST /api/products` - Create new sweet
- `GET /api/products/[id]` - Get single sweet
- `PUT /api/products/[id]` - Update sweet
- `DELETE /api/products/[id]` - Delete sweet

### Categories

- `GET /api/categories` - List categories
- `POST /api/categories` - Create new category

### Orders

- `GET /api/orders` - List orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get single order
- `PUT /api/orders/[id]` - Update order status

### Cart

- `GET /api/cart?userId=xxx` - Get cart items
- `POST /api/cart` - Add sweet to cart
- `PUT /api/cart/[id]` - Update cart item quantity
- `DELETE /api/cart/[id]` - Remove cart item

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

## 🎯 Features

### Product Features

- Featured Indian sweets display (Kaju Katli, Gulab Jamun, Rasgulla)
- Category-based filtering (Mithai, Bengali, Festival)
- Search functionality
- Stock tracking
- Traditional sweet images

### Order Features

- Order status workflow: pending → confirmed → preparing → ready → delivered
- Order cancellation support
- Customer contact information (Indian phone format)
- Order item details
- Real-time status updates

### Shopping Cart

- Add sweets to cart
- Update quantities
- Remove items
- Clear cart
- Real-time total calculation in ₹
- Local storage persistence

## 🍬 Indian Sweet Categories

### Premium Mithai

- Kaju Katli Premium
- Kesar Peda
- Soan Papdi Special

### Bengali Delicacies

- Rasgulla Royale
- Sandesh Assortment

### Festival Specials

- Motichur Ladoo
- Gulab Jamun
- Festival Gift Boxes

### Dry Fruit Sweets

- Badam Barfi Deluxe
- Anjeer Barfi
- Mixed Dry Fruit Mithai

### Gift Boxes

- Festival Gift Box
- Royal Gift Hamper

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start
```

The application will be served from port 3000.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema to database
- `npm run db:generate` - Generate Prisma Client
- `npm run db:seed` - Seed database with Indian sweets

## 🎨 Customization

### Colors

The application uses a purple gradient theme inspired by Indian festivities:

- Primary: `#743181` (Deep Purple)
- Secondary: `#5a2a6e` (Royal Purple)
- Background: Gradient from purple-50 to pink-50
- Accents: Gold and saffron touches

### Adding Sweets

1. Go to `/admin/products`
2. Click "Add Product"
3. Fill in sweet details (name, slug, description, price in ₹, image, stock, category)
4. Click "Add Product"

### Managing Orders

1. Go to `/admin/orders`
2. View order details
3. Update status using the dropdown
4. Use quick action buttons for common status changes

## 💳 Payment Integration

The application supports Indian payment gateways:

- 📱 UPI
- 💰 Google Pay (GPay)
- 🔵 Paytm
- 🟣 PhonePe

## 🌏 Localization

- Currency: Indian Rupees (₹)
- Phone Format: +91-XXXXXXXXXX
- Addresses: Indian cities (Mumbai, Delhi, etc.)
- Language: English with Hindi elements ("भारत की #1 मिठाई की दुकान")

## 📄 License

This project is private and proprietary.

## 🤝 Support

For questions or issues, please contact the Sarvaa Sweets development team.

---

**Made with ❤️ in India for authentic Indian sweet lovers**
