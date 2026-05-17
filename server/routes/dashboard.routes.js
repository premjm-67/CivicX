import express from 'express'
import { getStats, getPriorityQueue, getHeatmap } from '../controllers/dashboard.controller.js'
import { verifyToken, requireRole } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/stats', verifyToken, requireRole('admin'), getStats)
router.get('/priority-queue', verifyToken, requireRole('admin'), getPriorityQueue)
router.get('/heatmap', verifyToken, requireRole('admin', 'department_admin'), getHeatmap)

export default router