# Troubleshooting Network Errors

## Network Error: "Cannot connect to server"

If you're seeing network errors in the frontend console, follow these steps:

### 1. Check Backend is Running

```bash
cd backend
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5007
📡 API available at http://localhost:5007/api
```

### 2. Test Backend Manually

Open your browser or use curl:
```bash
curl http://localhost:5007/api/health
```

Should return: `{"status":"OK","message":"SJ Clothing API is running"}`

### 3. Check Frontend API Configuration

In `frontend/src/config/api.js`, the default API URL is:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5007'
```

### 4. Verify Ports

- **Backend**: Should be running on port **5007**
- **Frontend**: Should be running on port **5173** (Vite default)

### 5. Check CORS

The backend allows these origins:
- `http://localhost:5173` (Frontend)
- `http://localhost:5174` (Admin Panel)
- `http://127.0.0.1:5173`
- `http://127.0.0.1:5174`

### 6. Common Issues

#### Issue: Backend not starting
**Solution**: Check MongoDB is running
```bash
# Check MongoDB
brew services list | grep mongodb

# Or check if MongoDB Atlas connection string is correct in .env
```

#### Issue: Port already in use
**Solution**: Change port in backend/.env
```env
PORT=5008
```

Then update frontend/.env:
```env
VITE_API_URL=http://localhost:5008
```

#### Issue: CORS errors
**Solution**: Make sure frontend is running on port 5173, or update backend CORS settings

#### Issue: Network Error persists
**Solution**: 
1. Restart both frontend and backend
2. Clear browser cache
3. Check browser console for detailed error messages
4. Verify firewall isn't blocking localhost connections

### 7. Quick Fix Commands

```bash
# Kill process on port 5007
lsof -ti:5007 | xargs kill -9

# Restart backend
cd backend && npm run dev

# Restart frontend (in new terminal)
cd frontend && npm run dev
```

### 8. Verify Connection

The frontend now includes a connection status indicator at the top of the page. If you see a red banner, the backend is not reachable.

