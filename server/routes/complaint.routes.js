import express from 'express'
import {
  createComplaint, getComplaints, getComplaintById, deleteComplaint,
  updateStatus, assignDepartment, assignWorker, addProgress, submitFeedback
} from '../controllers/complaint.controller.js'
import { verifyToken, requireRole } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.middleware.js'

const router = express.Router()

router.post('/', verifyToken, upload.array('media', 5), createComplaint)
router.get('/', verifyToken, getComplaints)
router.get('/:id', verifyToken, getComplaintById)
router.delete('/:id', verifyToken, requireRole('admin', 'department_admin', 'citizen'), deleteComplaint)
router.patch('/:id/status', verifyToken, requireRole('admin', 'department_admin', 'worker'), updateStatus)
router.patch('/:id/assign', verifyToken, requireRole('admin'), assignDepartment)
router.patch('/:id/assign-worker', verifyToken, requireRole('admin', 'department_admin'), assignWorker)
router.post('/:id/progress', verifyToken, requireRole('department_admin', 'worker'), upload.single('media'), addProgress)
router.patch('/:id/feedback', verifyToken, submitFeedback)

export default router