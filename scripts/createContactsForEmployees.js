/**
 * Example script to create contacts for different employees from backend
 * 
 * Usage:
 * 1. Get admin token by logging in as admin
 * 2. Get employee user IDs from /api/users/employees
 * 3. Use the script below to create contacts
 */

// Example: Create contacts for different employees
async function createContactsForEmployees() {
  const API_BASE_URL = 'http://localhost:3000/api';
  const ADMIN_TOKEN = 'your-admin-jwt-token-here'; // Get this by logging in as admin

  // First, get all employees
  const employeesResponse = await fetch(`${API_BASE_URL}/users/employees`, {
    headers: {
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  const employees = await employeesResponse.json();
  console.log('Employees:', employees);

  // Example contacts to assign
  const contactsToCreate = [
    { name: 'John Doe', phone: '1234567890', userId: employees[0]._id },
    { name: 'Jane Smith', phone: '0987654321', userId: employees[0]._id },
    { name: 'Bob Johnson', phone: '5555555555', userId: employees[1]._id },
    { name: 'Alice Williams', phone: '4444444444', userId: employees[1]._id },
  ];

  // Create contacts for each employee
  for (const contact of contactsToCreate) {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contact)
      });

      if (response.ok) {
        const createdContact = await response.json();
        console.log(`✅ Created contact "${contact.name}" for employee ${contact.userId}`);
      } else {
        const error = await response.json();
        console.error(`❌ Failed to create contact "${contact.name}":`, error.message);
      }
    } catch (error) {
      console.error(`❌ Error creating contact "${contact.name}":`, error);
    }
  }
}

// Uncomment to run:
// createContactsForEmployees();

export default createContactsForEmployees;

