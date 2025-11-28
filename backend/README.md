# SJ Clothing Backend API

Node.js + Express + MongoDB backend for the SJ Clothing e-commerce store.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
PORT=5007
MONGODB_URI=mongodb://localhost:27017/sjclothing
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
ADMIN_EMAIL=admin@sjclothing.com
```

3. Start the server:
```bash
npm run dev
```

## Project Structure

```
backend/
├── models/          # MongoDB models
├── controllers/     # Route controllers
├── routes/          # API routes
├── middleware/      # Custom middleware
├── uploads/         # Uploaded images (created automatically)
└── server.js        # Main server file
```

## API Documentation

See main README.md for API endpoints.

