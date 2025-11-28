# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Cloud - Recommended for Quick Start)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a new cluster (Free tier M0)
4. Create a database user:
   - Username: `sjclothing`
   - Password: (create a strong password)
5. Whitelist your IP address (or use `0.0.0.0/0` for all IPs - development only)
6. Click "Connect" → "Connect your application"
7. Copy the connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`)
8. Update your `.env` file:

```env
MONGODB_URI=mongodb+srv://sjclothing:yourpassword@cluster0.xxxxx.mongodb.net/sjclothing?retryWrites=true&w=majority
```

Replace `yourpassword` with your actual database password.

## Option 2: Install MongoDB Locally (macOS)

### Using Homebrew:

```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

### Verify MongoDB is running:

```bash
brew services list | grep mongodb
```

You should see `mongodb-community started`

### Your `.env` file should have:

```env
MONGODB_URI=mongodb://localhost:27017/sjclothing
```

## After Setup

1. Make sure your `.env` file has the correct `MONGODB_URI`
2. Restart your backend server:
   ```bash
   npm run dev
   ```

You should see: `✅ Connected to MongoDB`

