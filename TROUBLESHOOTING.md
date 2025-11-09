# Troubleshooting: Cannot GET /api/users/employees

## Issue: 404 Error on GET /api/users/employees

If you're getting "Cannot GET /api/users/employees", try these steps:

### 1. Restart Your Backend Server

The route was just added, so you need to restart the server:

**If using nodemon:**
```bash
# The server should auto-restart, but if not:
# Press Ctrl+C to stop, then restart
npm start
```

**If running manually:**
```bash
# Stop the server (Ctrl+C)
# Then restart:
node server.js
# or
npm start
```

### 2. Verify Server is Running

Check if your server is actually running:
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000
# or on Mac/Linux:
lsof -i :3000
```

### 3. Test the Route Directly

Try these endpoints to verify:

**Health check (should work):**
```
GET http://localhost:3000/api/health
```

**Login (should work):**
```
POST http://localhost:3000/api/auth/login
Body: { "email": "...", "password": "..." }
```

**Get employees (should work after restart):**
```
GET http://localhost:3000/api/users/employees
Headers: Authorization: Bearer <your-token>
```

### 4. Check Server Console

Look at your server console output. You should see:
```
🚀 Server running on http://localhost:3000
📊 MongoDB connected
```

If you see errors, fix them first.

### 5. Verify Route Registration

The route should be registered in `server.js`:
```javascript
app.use('/api/users', userRoutes);
```

And the route should be in `routes/users.js`:
```javascript
router.get('/employees', authenticate, isAdmin, async (req, res) => {
  // ...
});
```

### 6. Check Authentication

Make sure:
- ✅ You're logged in as **admin** (not employee)
- ✅ Your token is valid (not expired)
- ✅ You're including the token in the Authorization header:
  ```
  Authorization: Bearer <your-token>
  ```

### 7. Common Issues

**Issue:** "Cannot GET /api/users/employees"
- **Solution:** Restart the server

**Issue:** 401 Unauthorized
- **Solution:** Check your token is valid and you're logged in as admin

**Issue:** 403 Forbidden
- **Solution:** Make sure your user role is "admin", not "employee"

**Issue:** Empty array []
- **Solution:** This is normal if no employees exist. Create some employee accounts first.

