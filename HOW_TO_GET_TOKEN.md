# How to Get Your Admin Token

## Step 1: Login as Admin

Make a POST request to the login endpoint:

```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "your-admin-email@example.com",
  "password": "your-admin-password"
}
```

## Step 2: Copy the Token from Response

The response will look like this:

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDYwNDgwMH0.xxxxxxxxxxxx",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Copy the `token` value** - that's what you need!

## Step 3: Use the Token

Now use this token in all your requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Example with cURL:

```bash
# 1. Login and save token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-password"
  }'

# Response will include the token - copy it!

# 2. Use the token
curl -X GET http://localhost:3000/api/users/employees \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Example with Postman/Thunder Client:

1. **Create a new request:**
   - Method: `POST`
   - URL: `http://localhost:3000/api/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "admin@example.com",
       "password": "your-password"
     }
     ```

2. **Send the request** - you'll get a response with the token

3. **Copy the token** from the response

4. **Use it in other requests:**
   - Go to the "Auth" tab
   - Select "Bearer Token"
   - Paste your token

## If You Don't Have an Admin Account:

Create one by signing up:

```
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "your-password",
  "role": "admin"
}
```

Then login with those credentials to get your token!

