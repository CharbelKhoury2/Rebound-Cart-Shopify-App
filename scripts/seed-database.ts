import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedDatabase() {
  console.log('🌱 Seeding database...')

  try {
    // Create Shop Settings
    const shopSettings = await prisma.shopSettings.createMany({
      data: [
        {
          shop: 'luxe-skincare.myshopify.com',
          commissionRate: 10.0,
          isMarketplaceEnabled: true,
          recoveryTone: 'FRIENDLY',
          customInstructions: 'Focus on luxury skincare benefits and ingredients'
        },
        {
          shop: 'techgear-hub.myshopify.com',
          commissionRate: 12.0,
          isMarketplaceEnabled: true,
          recoveryTone: 'PROFESSIONAL',
          customInstructions: 'Emphasize tech specifications and warranty'
        },
        {
          shop: 'fitlife-nutrition.myshopify.com',
          commissionRate: 8.0,
          isMarketplaceEnabled: true,
          recoveryTone: 'URGENT',
          customInstructions: 'Highlight health benefits and limited stock'
        }
      ]
    })
    console.log('✅ Created shop settings')

    // Create Platform Users
    const adminUser = await prisma.platformUser.create({
      data: {
        email: 'admin@reboundcart.com',
        firstName: 'Sarah',
        lastName: 'Chen',
        role: 'PLATFORM_ADMIN',
        status: 'ACTIVE',
        tier: 'PLATINUM',
        experience: '5+ years in e-commerce recovery',
        skills: 'Customer communication, sales strategy, CRM management'
      }
    })

    const salesRep1 = await prisma.platformUser.create({
      data: {
        email: 'james@sales.com',
        firstName: 'James',
        lastName: 'Wilson',
        role: 'SALES_REP',
        status: 'ACTIVE',
        tier: 'GOLD',
        experience: '3 years in retail sales',
        skills: 'Product knowledge, customer service, upselling'
      }
    })

    const salesRep2 = await prisma.platformUser.create({
      data: {
        email: 'maria@sales.com',
        firstName: 'Maria',
        lastName: 'Garcia',
        role: 'SALES_REP',
        status: 'ACTIVE',
        tier: 'SILVER',
        experience: '2 years in e-commerce',
        skills: 'Email marketing, social media, follow-up strategies'
      }
    })

    const pendingRep = await prisma.platformUser.create({
      data: {
        email: 'alex@sales.com',
        firstName: 'Alex',
        lastName: 'Kim',
        role: 'SALES_REP',
        status: 'PENDING',
        tier: 'BRONZE',
        experience: '1 year in customer service',
        skills: 'Phone support, problem resolution, product training'
      }
    })

    console.log('✅ Created platform users')

    // Create Abandoned Checkouts
    const createdCheckouts = await prisma.abandonedCheckout.createMany({
      data: [
        {
          shop: 'luxe-skincare.myshopify.com',
          checkoutId: 'chk_1',
          cartToken: 'cart_123',
          email: 'customer1@email.com',
          name: 'Jane Doe',
          totalPrice: 289.99,
          currency: 'USD',
          checkoutUrl: 'https://luxe-skincare.myshopify.com/checkouts/abc123',
          status: 'ABANDONED'
        },
        {
          shop: 'techgear-hub.myshopify.com',
          checkoutId: 'chk_2',
          cartToken: 'cart_456',
          email: 'customer2@email.com',
          name: 'John Smith',
          totalPrice: 549.00,
          currency: 'USD',
          checkoutUrl: 'https://techgear.myshopify.com/checkouts/def456',
          status: 'ABANDONED'
        },
        {
          shop: 'fitlife-nutrition.myshopify.com',
          checkoutId: 'chk_3',
          cartToken: 'cart_789',
          email: 'customer3@email.com',
          name: 'Mike Johnson',
          totalPrice: 175.50,
          currency: 'USD',
          checkoutUrl: 'https://fitlife.myshopify.com/checkouts/ghi789',
          status: 'ABANDONED'
        },
        {
          shop: 'luxe-skincare.myshopify.com',
          checkoutId: 'chk_4',
          cartToken: 'cart_321',
          email: 'customer4@email.com',
          name: 'Sarah Williams',
          totalPrice: 412.00,
          currency: 'USD',
          checkoutUrl: 'https://luxe-skincare.myshopify.com/checkouts/jkl012',
          status: 'ABANDONED'
        },
        {
          shop: 'techgear-hub.myshopify.com',
          checkoutId: 'chk_5',
          cartToken: 'cart_654',
          email: 'customer5@email.com',
          name: 'David Brown',
          totalPrice: 899.00,
          currency: 'USD',
          checkoutUrl: 'https://techgear.myshopify.com/checkouts/pqr678',
          status: 'RECOVERED',
          claimedById: salesRep1.id,
          claimedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          orderId: 'order_1001'
        },
        {
          shop: 'fitlife-nutrition.myshopify.com',
          checkoutId: 'chk_6',
          cartToken: 'cart_987',
          email: 'customer6@email.com',
          name: 'Emily Davis',
          totalPrice: 320.00,
          currency: 'USD',
          checkoutUrl: 'https://fitlife.myshopify.com/checkouts/stu901',
          status: 'ABANDONED',
          claimedById: salesRep1.id,
          claimedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        }
      ]
    })

    // Get the created checkouts to reference their IDs
    const allCheckouts = await prisma.abandonedCheckout.findMany({
      where: {
        checkoutId: {
          in: ['chk_5', 'chk_6']
        }
      }
    })

    const recoveredCheckout = allCheckouts.find(c => c.checkoutId === 'chk_5')
    const claimedCheckout = allCheckouts.find(c => c.checkoutId === 'chk_6')

    console.log('✅ Created abandoned checkouts')

    // Create Commissions for recovered carts
    if (recoveredCheckout) {
      await prisma.commission.createMany({
        data: [
          {
            orderId: 'order_1001',
            orderNumber: '#1001',
            totalAmount: 899.00,
            commissionAmount: 107.88, // 12% of 899
            platformFee: 5.39, // 5% of commission
            status: 'PAID',
            checkoutId: recoveredCheckout.id,
            repId: salesRep1.id
          }
        ]
      })
    }
    console.log('✅ Created commissions')

    // Create some communications
    if (claimedCheckout) {
      await prisma.communication.createMany({
        data: [
          {
            checkoutId: claimedCheckout.id,
            repId: salesRep1.id,
            channel: 'Email',
            content: 'Initial contact: Followed up on abandoned cart with discount offer',
            qcScore: 85.5,
            qcFeedback: 'Good personalization, could add more urgency',
            sentiment: 'Positive',
            customerRating: 4
          }
        ]
      })
    }

    if (recoveredCheckout) {
      await prisma.communication.create({
        data: {
          checkoutId: recoveredCheckout.id,
          repId: salesRep1.id,
          channel: 'Phone',
          content: 'Called customer to address technical questions, successfully closed sale',
          qcScore: 92.0,
          qcFeedback: 'Excellent product knowledge and closing technique',
          sentiment: 'Positive',
          customerRating: 5
        }
      })
    }
    console.log('✅ Created communications')

    console.log('🎉 Database seeding completed!')
    console.log('\n📊 Created summary:')
    console.log(`- Shop Settings: 3 shops`)
    console.log(`- Platform Users: 4 (1 admin, 2 active reps, 1 pending)`)
    console.log(`- Abandoned Checkouts: 6 (4 available, 1 claimed, 1 recovered)`)
    console.log(`- Commissions: 1 (paid)`)
    console.log(`- Communications: 2`)

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedDatabase()
  .catch(console.error)
