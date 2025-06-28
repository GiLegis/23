import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { CreateClientRequest, UpdateClientRequest } from '@synergia/types';

const router = Router();

// Get all clients
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const clients = await prisma.client.findMany({
      include: {
        projects: true,
        _count: {
          select: { projects: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: clients });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get client by ID
router.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        projects: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    res.json({ success: true, data: client });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Create client
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const clientData: CreateClientRequest = req.body;

    const client = await prisma.client.create({
      data: clientData
    });

    res.json({ success: true, data: client });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update client
router.put('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const updateData: UpdateClientRequest = req.body;

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.email && { email: updateData.email }),
        ...(updateData.phone !== undefined && { phone: updateData.phone }),
        ...(updateData.address !== undefined && { address: updateData.address }),
        ...(updateData.status && { status: updateData.status })
      }
    });

    res.json({ success: true, data: client });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Delete client
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.client.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export { router as clientsRouter };