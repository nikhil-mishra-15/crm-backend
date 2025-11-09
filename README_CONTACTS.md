# How to Post Contacts to Different Employees from Backend

## Overview
Admins can create contacts and assign them to specific employees by including the `userId` field in the POST request.

## Steps

### 1. Get Admin Authentication Token
First, login as an admin to get your JWT token:
```bash
POST /api/auth/login
Body: {
  "email": "admin@example.com",
  "password": "your-password"
}
```
Response will include a `token` - save this for subsequent requests.

### 2. Get Employee User IDs
Get list of all employees to find their user IDs:
```bash
GET /api/users/employees
Headers: Authorization: Bearer <admin-token>
```
Response:
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Employee 1",
    "email": "employee1@example.com",
    "role": "employee"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Employee 2",
    "email": "employee2@example.com",
    "role": "employee"
  }
]
```

### 3. Create Contacts for Specific Employees
Now you can create contacts and assign them to specific employees:

```bash
POST /api/contacts
Headers: 
  Authorization: Bearer <admin-token>
  Content-Type: application/json
Body:
{
  "name": "John Doe",
  "phone": "1234567890",
  "userId": "507f1f77bcf86cd799439011"  // Employee's user ID
}
```

### 4. Example: Create Multiple Contacts for Different Employees

```javascript
// Example using fetch API
const contacts = [
  { name: "Contact 1", phone: "1111111111", userId: "employee1_id" },
  { name: "Contact 2", phone: "2222222222", userId: "employee1_id" },
  { name: "Contact 3", phone: "3333333333", userId: "employee2_id" },
  { name: "Contact 4", phone: "4444444444", userId: "employee2_id" },
];

const adminToken = "your-admin-token";

for (const contact of contacts) {
  await fetch('http://localhost:3000/api/contacts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(contact)
  });
}
```

## Important Notes

1. **Admin Only**: Only users with `role: 'admin'` can assign contacts to other users
2. **Employees**: Regular employees can only create contacts for themselves (userId is automatically set)
3. **Authentication Required**: All requests require a valid JWT token in the Authorization header
4. **User ID Format**: Use MongoDB ObjectId format for userId (24 character hex string)

## Using cURL Examples

```bash
# Get employees list
curl -X GET http://localhost:3000/api/users/employees \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Create contact for employee 1
curl -X POST http://localhost:3000/api/contacts \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "1234567890",
    "userId": "507f1f77bcf86cd799439011"
  }'

# Create contact for employee 2
curl -X POST http://localhost:3000/api/contacts \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "phone": "0987654321",
    "userId": "507f1f77bcf86cd799439012"
  }'
```

## Using Postman/Thunder Client

1. Set up a collection with:
   - Base URL: `http://localhost:3000/api`
   - Authorization: Bearer Token (use your admin token)

2. Create requests:
   - GET `/users/employees` - Get employee list
   - POST `/contacts` - Create contact with userId in body

