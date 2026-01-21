# Sweet Delights Cake Shop - E-commerce Platform

A full-stack e-commerce application built with Next.js 16, TypeScript, Prisma, and shadcn/ui for a cake shop.

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
- 🏠 Beautiful homepage with hero section and featured products
- 🎂 Product catalog with category filtering and search
- 🛒 Shopping cart with add/remove/quantity controls
- 📦 Product stock management
- 📱 Fully responsive design
- 🎨 Modern UI with pink/purple theme

### Admin Panel
- 📊 Dashboard with statistics (orders, revenue, products, users)
- 📦 Product management (CRUD operations)
- 📋 Order management with status workflow
- 🏷️ Category management
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
│   ├── page.tsx                    # Homepage
│   ├── products/page.tsx           # Products catalog
│   ├── cart/page.tsx               # Shopping cart
│   ├── admin/
│   │   ├── page.tsx                # Admin dashboard
│   │   ├── products/page.tsx       # Product management
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
└── seed.ts                        # Database seeding script
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- Bun (recommended) or npm/yarn

### Installation

1. Install dependencies:
```bash
bun install
```

2. Set up the database:
```bash
bun run db:push
```

3. Seed the database with sample data:
```bash
bun run db:seed
```

4. Run the development server:
```bash
bun run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📊 Database Schema

### Models
- **User**: Customer and admin accounts
- **Category**: Product categories (birthday, wedding, etc.)
- **Product**: Cake products with images, prices, stock
- **Order**: Customer orders with status tracking
- **OrderItem**: Individual items in orders
- **CartItem**: Shopping cart items

### Default Credentials

**Admin User:**
- Email: admin@sweetdelights.com
- Password: admin123

**Test Customer:**
- Email: customer@example.com
- Password: customer123

## 🎨 Pages

### Customer Pages
- `/` - Homepage with featured products
- `/products` - Product catalog with filtering
- `/cart` - Shopping cart

### Admin Pages
- `/admin` - Dashboard with statistics
- `/admin/products` - Product management
- `/admin/orders` - Order management

## 🔧 API Endpoints

### Products
- `GET /api/products` - List products (supports query params: category, featured, search)
- `POST /api/products` - Create new product
- `GET /api/products/[id]` - Get single product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

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
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/[id]` - Update cart item quantity
- `DELETE /api/cart/[id]` - Remove cart item

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

## 🎯 Features

### Product Features
- Featured products display
- Category-based filtering
- Search functionality
- Stock tracking
- Image display

### Order Features
- Order status workflow: pending → confirmed → preparing → ready → delivered
- Order cancellation support
- Customer contact information
- Order item details
- Real-time status updates

### Shopping Cart
- Add products to cart
- Update quantities
- Remove items
- Clear cart
- Real-time total calculation
- Local storage persistence

## 🚀 Deployment

### Production Build
```bash
bun run build
bun run start
```

The application will be served from port 3000.

## 📝 Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run db:push` - Push schema to database
- `bun run db:generate` - Generate Prisma Client
- `bun run db:seed` - Seed database with sample data

## 🎨 Customization

### Colors
The application uses a pink/purple theme for the cake shop. Colors are defined in Tailwind CSS classes:
- Primary: pink-600
- Secondary: purple-600
- Background: gray-50

### Adding Products
1. Go to `/admin/products`
2. Click "Add Product"
3. Fill in product details (name, slug, description, price, image, stock, category)
4. Click "Add Product"

### Managing Orders
1. Go to `/admin/orders`
2. View order details
3. Update status using the dropdown
4. Use quick action buttons for common status changes

## 📄 License

This project is private and proprietary.

## 🤝 Support

For questions or issues, please contact the development team.
