import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const verifyToken = async (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ message: 'Please login to continue' })
  try {
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
    if (!req.user) return res.status(401).json({ message: 'User not found. Please login again.' })
    next()
  } catch {
    res.status(401).json({ message: 'Session expired. Please login again.' })
  }
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: `Access denied. Required role: ${roles.join(' or ')}` })
  next()
}