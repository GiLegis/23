import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { CreateProjectRequest, UpdateProjectRequest } from '@synergia/types';

const router = Router();

// Get all projects
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        client: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get project by ID
router.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true
      }
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Create project
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const projectData: CreateProjectRequest = req.body;

    const project = await prisma.project.create({
      data: {
        ...projectData,
        startDate: projectData.startDate ? new Date(projectData.startDate) : null,
        endDate: projectData.endDate ? new Date(projectData.endDate) : null
      },
      include: {
        client: true
      }
    });

    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update project
router.put('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const updateData: UpdateProjectRequest = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.description !== undefined && { description: updateData.description }),
        ...(updateData.status && { status: updateData.status }),
        ...(updateData.clientId && { clientId: updateData.clientId }),
        ...(updateData.startDate !== undefined && { 
          startDate: updateData.startDate ? new Date(updateData.startDate) : null 
        }),
        ...(updateData.endDate !== undefined && { 
          endDate: updateData.endDate ? new Date(updateData.endDate) : null 
        })
      },
      include: {
        client: true
      }
    });

    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Delete project
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.project.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export { router as projectsRouter };