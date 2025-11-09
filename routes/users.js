import express from 'express';
import User from '../models/User.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import upload from '../config/upload.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get all users (Admin only) - useful for getting userIds to assign contacts
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all employees (Admin only)
router.get('/employees', authenticate, isAdmin, async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).select('-password').sort({ name: 1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get employee statistics with contact counts (Admin only)
router.get('/employees/stats', authenticate, isAdmin, async (req, res) => {
  try {
    const Contact = (await import('../models/Contact.js')).default;
    const employees = await User.find({ role: 'employee' }).select('-password').sort({ name: 1 });
    
    const employeesWithStats = await Promise.all(
      employees.map(async (employee) => {
        const contacts = await Contact.find({ userId: employee._id });
        const total = contacts.length;
        const called = contacts.filter(c => c.called === true).length;
        const rejected = contacts.filter(c => c.status === 'rejected').length;
        const leads = contacts.filter(c => c.status === 'lead').length;
        const later = contacts.filter(c => c.status === 'future').length;
        
        return {
          id: employee._id,
          name: employee.name,
          email: employee.email,
          stats: {
            total,
            called,
            rejected,
            leads,
            later
          }
        };
      })
    );
    
    res.json(employeesWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload profile picture
router.post('/me/profile-picture', authenticate, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      // Delete uploaded file if user not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile picture if exists
    if (user.profilePicture) {
      const oldPicturePath = path.join(__dirname, '../uploads/profile-pictures', path.basename(user.profilePicture));
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
      }
    }

    // Save the file path (relative to uploads directory)
    const fileUrl = `/uploads/profile-pictures/${req.file.filename}`;
    user.profilePicture = fileUrl;
    await user.save();

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePicture: fileUrl
    });
  } catch (error) {
    // Delete uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error uploading profile picture:', error);
    res.status(400).json({ 
      message: error.message || 'Failed to upload profile picture'
    });
  }
});

// Update current user profile
router.patch('/me', authenticate, async (req, res) => {
  try {
    const { phone, location, memberSince } = req.body;
    const updateFields = {};
    
    if (phone !== undefined) updateFields.phone = phone;
    if (location !== undefined) updateFields.location = location;
    if (memberSince !== undefined) {
      // Handle empty string, null, or undefined
      if (memberSince && String(memberSince).trim() !== '') {
        const date = new Date(memberSince);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ message: 'Invalid date format for memberSince' });
        }
        updateFields.memberSince = date;
      } else {
        // If empty, use current date as default
        updateFields.memberSince = new Date();
      }
    }

    // Check if there are any fields to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(400).json({ 
      message: error.message || 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;

