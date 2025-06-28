import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { supabase } from '../lib/supabase.js';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { UserRole, UpdateUserRequest } from '@synergia/types';

const router = Router();

// Get all users (Admin only)
router.get('/', requireRole([UserRole.ADMIN]), async (req: AuthenticatedRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Invite user (Admin only)
router.post('/invite', requireRole([UserRole.ADMIN]), async (req: AuthenticatedRequest, res) => {
  try {
    const { email, name, role } = req.body;

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-8), // Temporary password
      email_confirm: true
    });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    // Create user in our database
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: role || UserRole.EMPLOYEE,
        status: 'PENDING'
      }
    });

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update user (Admin only)
router.put('/:id', requireRole([UserRole.ADMIN]), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const updateData: UpdateUserRequest = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.role && { role: updateData.role }),
        ...(updateData.status && { status: updateData.status })
      }
    });

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Delete user (Admin only)
router.delete('/:id', requireRole([UserRole.ADMIN]), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Don't allow admin to delete themselves
    if (id === req.user!.id) {
      return res.status(400).json({ success: false, error: 'Cannot delete your own account' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Delete from Supabase Auth
    await supabase.auth.admin.deleteUser(id);

    // Delete from our database
    await prisma.user.delete({ where: { id } });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export { router as usersRouter };