import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/User.js'

dotenv.config()

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to MongoDB')

  await User.deleteMany({ role: { $ne: 'citizen' } })

  await User.create([
    {
      name: 'Government Admin',
      email: 'admin@civic.com',
      password: 'admin1234',
      role: 'admin',
    },
    {
      name: 'Road Department Admin',
      email: 'road@civic.com',
      password: 'road1234',
      role: 'department_admin',
      department: 'Road',
    },
    {
      name: 'Water Department Admin',
      email: 'water@civic.com',
      password: 'water1234',
      role: 'department_admin',
      department: 'Water',
    },
    {
      name: 'Garbage Department Admin',
      email: 'garbage@civic.com',
      password: 'garbage1234',
      role: 'department_admin',
      department: 'Garbage',
    },
    {
      name: 'Worker One',
      email: 'worker@civic.com',
      password: 'worker1234',
      role: 'worker',
      department: 'Road',
    },
  ])

  console.log('✅ Users seeded successfully!')
  console.log('--------------------------------')
  console.log('admin@civic.com     / admin1234   → Govt Admin')
  console.log('road@civic.com      / road1234    → Road Dept Admin')
  console.log('water@civic.com     / water1234   → Water Dept Admin')
  console.log('garbage@civic.com   / garbage1234 → Garbage Dept Admin')
  console.log('worker@civic.com    / worker1234  → Worker')
  console.log('--------------------------------')
  process.exit()
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})