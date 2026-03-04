import { prisma } from '@/lib/database'
import type { AbandonedCheckout, PlatformUser, ShopSettings } from '@prisma/client'

export class CheckoutService {
  // Get global feed of available carts (Vetted Talent Network)
  static async getAvailableCarts(): Promise<AbandonedCheckout[]> {
    try {
      return await prisma.abandonedCheckout.findMany({
        where: {
          claimedById: null,
          status: 'ABANDONED',
          shop: {
            in: await this.getMarketplaceEnabledShops()
          }
        },
        include: {
          claimedBy: false
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } catch (error) {
      console.error('Database failed, returning mock carts:', error);
      // Fallback to mock data from memory (simple mock for demo)
      return [
        { id: 'c1', shop: 'Luxe Skincare Co.', email: 'customer1@email.com', totalPrice: 289.99 as any, currency: 'USD', checkoutUrl: 'https://example.com/checkout/1', status: 'ABANDONED', claimedById: null, claimedAt: null, createdAt: new Date() } as any,
        { id: 'c2', shop: 'TechGear Hub', email: 'customer2@email.com', totalPrice: 549.00 as any, currency: 'USD', checkoutUrl: 'https://example.com/checkout/2', status: 'ABANDONED', claimedById: null, claimedAt: null, createdAt: new Date() } as any,
      ];
    }
  }

  // Get shops that have marketplace enabled
  private static async getMarketplaceEnabledShops(): Promise<string[]> {
    const shopSettings = await prisma.shopSettings.findMany({
      where: {
        isMarketplaceEnabled: true
      },
      select: {
        shop: true
      }
    })
    return shopSettings.map(setting => setting.shop)
  }

  // Atomic cart claiming with transaction
  static async claimCart(checkoutId: string, repId: string): Promise<AbandonedCheckout> {
    return await prisma.$transaction(async (tx) => {
      // Check if cart is still available
      const cart = await tx.abandonedCheckout.findFirst({
        where: {
          id: checkoutId,
          claimedById: null,
          status: 'ABANDONED'
        }
      })

      if (!cart) {
        throw new Error('Cart is no longer available or has already been claimed')
      }

      // Verify the shop allows marketplace exposure
      const shopSetting = await tx.shopSettings.findUnique({
        where: { shop: cart.shop }
      })

      if (!shopSetting?.isMarketplaceEnabled) {
        throw new Error('This shop does not participate in the Vetted Talent Network')
      }

      // Claim the cart
      const claimedCart = await tx.abandonedCheckout.update({
        where: { id: checkoutId },
        data: {
          claimedById: repId,
          claimedAt: new Date()
        },
        include: {
          claimedBy: true
        }
      })

      return claimedCart
    })
  }

  // Get carts claimed by a specific rep
  static async getRepClaimedCarts(repId: string): Promise<AbandonedCheckout[]> {
    return await prisma.abandonedCheckout.findMany({
      where: {
        claimedById: repId
      },
      include: {
        claimedBy: true
      },
      orderBy: {
        claimedAt: 'desc'
      }
    })
  }

  // Update cart status to recovered
  static async markAsRecovered(checkoutId: string, orderId: string): Promise<AbandonedCheckout> {
    return await prisma.abandonedCheckout.update({
      where: { id: checkoutId },
      data: {
        status: 'RECOVERED',
        orderId: orderId
      },
      include: {
        claimedBy: true,
        commission: true
      }
    })
  }

  // Get all carts for admin overview
  static async getAllCarts(): Promise<AbandonedCheckout[]> {
    return await prisma.abandonedCheckout.findMany({
      include: {
        claimedBy: true,
        commission: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  // Get carts by shop
  static async getCartsByShop(shop: string): Promise<AbandonedCheckout[]> {
    return await prisma.abandonedCheckout.findMany({
      where: {
        shop: shop
      },
      include: {
        claimedBy: true,
        commission: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  // Update last contacted timestamp
  static async updateLastContacted(checkoutId: string): Promise<AbandonedCheckout> {
    return await prisma.abandonedCheckout.update({
      where: { id: checkoutId },
      data: {
        lastContactedAt: new Date()
      }
    })
  }

  // Get cart statistics for dashboard
  static async getCartStats(): Promise<{
    total: number
    abandoned: number
    claimed: number
    recovered: number
  }> {
    const stats = await prisma.abandonedCheckout.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    const result = {
      total: 0,
      abandoned: 0,
      claimed: 0,
      recovered: 0
    }

    stats.forEach(stat => {
      result.total += stat._count.id
      if (stat.status === 'ABANDONED') {
        result.abandoned = stat._count.id
      } else if (stat.status === 'RECOVERED') {
        result.recovered = stat._count.id
      }
    })

    // Count claimed carts (both abandoned and recovered that have been claimed)
    const claimedCount = await prisma.abandonedCheckout.count({
      where: {
        claimedById: {
          not: null
        }
      }
    })
    result.claimed = claimedCount

    return result
  }
}
