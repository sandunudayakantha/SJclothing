# Setup Guide

## Step-by-Step Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

Backend runs on port **5007**

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on port **5173**

### 3. Admin Panel Setup

```bash
cd admin
npm install
npm run dev
```

Admin panel runs on port **5174**

### 4. Create First Admin User

After starting the backend, create your first admin:

```bash
curl -X POST http://localhost:5007/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@sjclothing.com",
    "password": "yourpassword123"
  }'
```

Then login at `http://localhost:5174/login`

### 5. Initial Configuration

1. Login to admin panel
2. Go to Settings
3. Configure:
   - Contact information (phone, email, address, WhatsApp)
   - Banner image and text
   - Special offers (optional)

### 6. Add Categories

1. Go to Categories in admin panel
2. Add main categories (e.g., "Clothes", "Shoes")
3. Add subcategories by selecting a parent category

### 7. Add Products

1. Go to Products in admin panel
2. Click "Add New Product"
3. Fill in product details:
   - Title, description
   - Category and subcategory
   - Price and discount price (optional)
   - Sizes (comma separated: S, M, L, XL)
   - Colors (comma separated: Red, Blue, Green)
   - Upload images (multiple)
   - Stock quantity
   - Mark as Featured or New Arrival

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check MONGODB_URI in .env file
- For MongoDB Atlas, use the connection string from your cluster

### Image Upload Not Working
- Make sure `uploads/` directory exists in backend folder
- Check file permissions
- Verify file size is under 5MB

### CORS Errors
- Make sure backend CORS includes your frontend URLs
- Check that API_URL in frontend/admin .env matches backend URL

### Admin Login Not Working
- Make sure you've created an admin user first
- Check JWT_SECRET in backend .env
- Verify backend is running

## Production Deployment

### Environment Variables

**Backend:**
- Set NODE_ENV=production
- Use strong JWT_SECRET
- Configure MongoDB Atlas or production MongoDB
- Set up SMTP for email notifications
- Remove or protect admin register endpoint

**Frontend/Admin:**
- Set VITE_API_URL to your production API URL
- Build for production: `npm run build`
- Deploy build folder to your hosting

### Subdomain Configuration

- Main site: `shop.mydomain.com` → frontend build
- Admin panel: `admin.mydomain.com` → admin build  
- API: `api.mydomain.com` → backend server

Update CORS in backend/server.js with your actual domains.

