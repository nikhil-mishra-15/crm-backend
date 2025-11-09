import express from 'express';
import Contact from '../models/Contact.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET all contacts - filtered by user (admins see all)
router.get('/', async (req, res) => {
  try {
    let query = {};
    
    // If user is not admin, only show their contacts
    if (req.user.role !== 'admin') {
      query.userId = req.user.id;
    }
    
    const contacts = await Contact.find(query).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single contact - check ownership (admins can access any)
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    // Check if user owns this contact or is admin
    if (req.user.role !== 'admin' && contact.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new contact - automatically assign to logged-in user (or specified user if admin)
router.post('/', async (req, res) => {
  try {
    const { name, phone, userId } = req.body;
    
    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({ 
        message: 'Name and phone are required fields' 
      });
    }

    // Determine which userId to use
    let assignedUserId = req.user.id; // Default to logged-in user
    
    // If userId is provided in request body, check if user has permission
    if (userId) {
      // Only admins can assign contacts to other users
      if (req.user.role === 'admin') {
        assignedUserId = userId;
      } else {
        // Non-admins can only assign to themselves
        if (userId !== req.user.id) {
          return res.status(403).json({ 
            message: 'You can only assign contacts to yourself' 
          });
        }
        assignedUserId = userId;
      }
    }

    const contact = new Contact({
      userId: assignedUserId,
      name,
      phone
      // remark and status will use default values
    });

    const newContact = await contact.save();
    res.status(201).json(newContact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH update contact - check ownership (admins can update any)
router.patch('/:id', async (req, res) => {
  try {
    const { remark, status, followUpDate, called } = req.body;
    
    // First check if contact exists and user has access
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    // Check ownership (admins can update any contact)
    if (req.user.role !== 'admin' && contact.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const updateFields = {};
    
    // Validate status if provided
    const validStatuses = ['future', 'rejected', 'lead'];
    if (status !== undefined) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        });
      }
      updateFields.status = status;
    }
    
    if (remark !== undefined) updateFields.remark = remark;
    
    // Handle followUpDate - can be null to clear the date
    if (followUpDate !== undefined) {
      updateFields.followUpDate = followUpDate ? new Date(followUpDate) : null;
    }
    
    // Handle called checkbox
    if (called !== undefined) {
      updateFields.called = Boolean(called);
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.json(updatedContact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update entire contact - check ownership (admins can update any)
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, remark, status } = req.body;
    
    // First check if contact exists and user has access
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    // Check ownership (admins can update any contact)
    if (req.user.role !== 'admin' && contact.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      { name, phone, remark, status },
      { new: true, runValidators: true }
    );

    res.json(updatedContact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE contact - check ownership (admins can delete any)
router.delete('/:id', async (req, res) => {
  try {
    // First check if contact exists and user has access
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    // Check ownership (admins can delete any contact)
    if (req.user.role !== 'admin' && contact.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;