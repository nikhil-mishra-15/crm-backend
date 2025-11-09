# Quick Guide: Post Contact to Specific Employee

## ❌ WRONG (What you're doing):
```
POST /api/contacts/690f06bcda1df06c66c86bca
Body: {
  "name": "nnnnnn",
  "phone": "888888"
}
```
This tries to POST to a contact ID endpoint, which doesn't exist!

## ✅ CORRECT (What you should do):

### Step 1: Get Employee User ID
First, get the employee's user ID:
```
GET /api/users/employees
Headers: Authorization: Bearer <admin-token>
```

Response will show employees like:
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",  ← This is the userId you need
    "name": "Employee Name",
    "email": "employee@example.com"
  }
]
```

### Step 2: Create Contact with userId
```
POST /api/contacts
Headers: 
  Authorization: Bearer <admin-token>
  Content-Type: application/json
Body:
{
  "name": "nnnnnn",
  "phone": "888888",
  "userId": "507f1f77bcf86cd799439011"  ← Employee's user ID here
}
```

## Key Points:
1. ✅ POST to `/api/contacts` (NO ID in URL)
2. ✅ Include `userId` in the request BODY (not URL)
3. ✅ Must be logged in as admin to assign to other users
4. ✅ The `userId` is the employee's `_id` from the users collection

## Example with cURL:
```bash
# 1. Get employees
curl -X GET http://localhost:3000/api/users/employees \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# 2. Create contact for specific employee
curl -X POST http://localhost:3000/api/contacts \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "nnnnnn",
    "phone": "888888",
    "userId": "507f1f77bcf86cd799439011"
  }'
```

