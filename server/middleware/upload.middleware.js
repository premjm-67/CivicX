import multer from 'multer'

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type'), false)
}

export const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } })