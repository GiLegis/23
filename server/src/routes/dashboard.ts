import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { DashboardStats } from '@synergia/types';

const router = Router();

router.get('/stats', async (req: AuthenticatedRequest, res) => {
  try {
    const [
      totalClients,
      activeProjects,
      completedProjects,
      newClientsThisMonth,
      recentProjects,
      recentClients
    ] = await Promise.all([
      prisma.client.count(),
      prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.project.count({ where: { status: 'COMPLETED' } }),
      prisma.client.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.project.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { client: true }
      }),
      prisma.client.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const stats: DashboardStats = {
      totalClients,
      activeProjects,
      completedProjects,
      newClientsThisMonth,
      recentProjects,
      recentClients
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export { router as dashboardRouter };