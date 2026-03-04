import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetDatabase() {
  console.log('🧹 Resetting database...')

  try {
    // Delete in order of dependencies
    await prisma.communication.deleteMany({})
    console.log('✅ Deleted communications')
    
    await prisma.commission.deleteMany({})
    console.log('✅ Deleted commissions')
    
    await prisma.abandonedCheckout.deleteMany({})
    console.log('✅ Deleted abandoned checkouts')
    
    await prisma.platformUser.deleteMany({})
    console.log('✅ Deleted platform users')
    
    await prisma.shopSettings.deleteMany({})
    console.log('✅ Deleted shop settings')

    console.log('🎉 Database reset completed!')
  } catch (error) {
    console.error('❌ Error resetting database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

resetDatabase()
  .catch(console.error)
