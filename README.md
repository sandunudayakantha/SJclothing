# SJ Clothing - Full MERN Stack E-commerce Store

A complete e-commerce solution for clothing and shoes with separate frontend, admin panel, and backend API.

## 🏗️ Project Structure

```
SJclothing/
├── backend/          # Node.js + Express + MongoDB API
├── frontend/         # React + Vite + Tailwind (Main Store)
└── admin/           # React + Vite + Tailwind (Admin Panel)
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=5007
MONGODB_URI=mongodb://localhost:27017/sjclothing
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
```

5. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:5007`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional):
```env
VITE_API_URL=http://localhost:5007
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### Admin Panel Setup

1. Navigate to admin directory:
```bash
cd admin
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional):
```env
VITE_API_URL=http://localhost:5007
```

4. Start the development server:
```bash
npm run dev
```

The admin panel will run on `http://localhost:5174`

## 🔐 Initial Admin Setup

To create your first admin user, you can use the register endpoint:

```bash
curl -X POST http://localhost:5007/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@sjclothing.com",
    "password": "yourpassword"
  }'
```

**Note:** Remove or protect the register endpoint in production!

## 📁 Features

### Main Website (Frontend)
- ✅ Home page with hero section, featured products, and new arrivals
- ✅ Product listing with category navigation
- ✅ Product detail page with size/color selection
- ✅ Shopping cart with localStorage persistence
- ✅ Wishlist functionality
- ✅ Checkout with customer information
- ✅ Contact page with form and WhatsApp link
- ✅ Responsive design

### Admin Panel
- ✅ JWT-based authentication
- ✅ Dashboard with sales statistics
- ✅ Product management (CRUD)
- ✅ Category management with subcategories
- ✅ Order management with status updates
- ✅ Store settings (contact info, banner, special offers)

### Backend API
- ✅ RESTful API with MVC structure
- ✅ MongoDB with Mongoose ODM
- ✅ JWT authentication for admin
- ✅ Image upload with Multer
- ✅ CORS configured for subdomains
- ✅ Email notifications for contact form

## 🎨 Theme

- **Colors:** Black, White, #4c3724 (brown accent)
- **Style:** Clean, modern, minimal clothing store design

## 🌐 Deployment Structure

- **Main Site:** `shop.mydomain.com`
- **Admin Panel:** `admin.mydomain.com`
- **Backend API:** `api.mydomain.com`

## 📝 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/:id` - Get single order (Admin)
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `GET /api/orders/stats` - Get order statistics (Admin)

### Auth
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/admin/me` - Get current admin (Protected)

### Settings
- `GET /api/settings` - Get store settings
- `PUT /api/settings` - Update settings (Admin)
- `POST /api/settings/contact` - Send contact form email

## 🛠️ Technologies Used

- **Frontend:** React, Vite, Tailwind CSS, React Router, Axios
- **Admin:** React, Vite, Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, Multer, Nodemailer
- **Styling:** Tailwind CSS

## 📦 Build for Production

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

### Admin Panel
```bash
cd admin
npm run build
```

## 🔒 Security Notes

1. Change JWT_SECRET in production
2. Remove or protect admin register endpoint
3. Configure proper CORS origins
4. Use environment variables for sensitive data
5. Implement rate limiting in production
6. Use HTTPS in production

## 📄 License

This project is open source and available under the MIT License.

