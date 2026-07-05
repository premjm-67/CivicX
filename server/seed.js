import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/User.js'

dotenv.config()

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to MongoDB')

  await User.deleteMany({})
  console.log('Cleared all users')

  await User.create([
    // Govt Admin
    {
      name: 'Government Admin',
      email: 'admin@civic.com',
      password: 'admin1234',
      role: 'admin',
    },
    // All 5 departments
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
      name: 'Drainage Department Admin',
      email: 'drainage@civic.com',
      password: 'drainage1234',
      role: 'department_admin',
      department: 'Drainage',
    },
    {
      name: 'Garbage Department Admin',
      email: 'garbage@civic.com',
      password: 'garbage1234',
      role: 'department_admin',
      department: 'Garbage',
    },
    {
      name: 'Electrical Department Admin',
      email: 'electrical@civic.com',
      password: 'electrical1234',
      role: 'department_admin',
      department: 'Electrical',
    },
    // Workers
    {
      name: 'Road Worker',
      email: 'worker@civic.com',
      password: 'worker1234',
      role: 'worker',
      department: 'Road',
    },
    // Test citizen
    {
      name: 'Test Citizen',
      email: 'citizen@civic.com',
      password: 'citizen1234',
      role: 'citizen',
    },
  ])

  console.log('✅ All users seeded!')
  console.log('--------------------------------')
  console.log('CITIZEN:')
  console.log('citizen@civic.com    / citizen1234')
  console.log('--------------------------------')
  console.log('GOVT ADMIN:')
  console.log('admin@civic.com      / admin1234')
  console.log('--------------------------------')
  console.log('DEPARTMENTS:')
  console.log('road@civic.com       / road1234')
  console.log('water@civic.com      / water1234')
  console.log('drainage@civic.com   / drainage1234')
  console.log('garbage@civic.com    / garbage1234')
  console.log('electrical@civic.com / electrical1234')
  console.log('--------------------------------')
  console.log('WORKER:')
  console.log('worker@civic.com     / worker1234')
  console.log('--------------------------------')
  process.exit()
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})