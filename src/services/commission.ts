import { prisma } from '@/lib/database'
import type { Commission, AbandonedCheckout, ShopSettings, PlatformUser } from '@prisma/client'

export class CommissionService {
  // Create commission when cart is recovered
  static async createCommission(checkoutId: string, orderId: string, orderNumber?: string): Promise<Commission> {
    // Get checkout details
    const checkout = await prisma.abandonedCheckout.findUnique({
      where: { id: checkoutId },
      include: { claimedBy: true }
    })

    if (!checkout || !checkout.claimedById) {
      throw new Error('Checkout not found or not claimed')
    }

    // Get shop settings for commission rate
    const shopSettings = await prisma.shopSettings.findUnique({
      where: { shop: checkout.shop }
    })

    const commissionRate = shopSettings?.commissionRate || 10 // Default 10%
    const commissionAmount = Number(checkout.totalPrice) * (commissionRate / 100)
    const platformFee = commissionAmount * 0.05 // 5% platform fee

    return await prisma.commission.create({
      data: {
        orderId: orderId,
        orderNumber: orderNumber,
        totalAmount: checkout.totalPrice,
        commissionAmount: commissionAmount,
        platformFee: platformFee,
        status: 'PENDING',
        checkoutId: checkoutId,
        repId: checkout.claimedById
      },
      include: {
        checkout: {
          include: {
            claimedBy: true
          }
        },
        rep: true
      }
    })
  }

  // Get commissions for a specific rep
  static async getRepCommissions(repId: string): Promise<Commission[]> {
    return await prisma.commission.findMany({
      where: {
        repId: repId
      },
      include: {
        checkout: {
          include: {
            claimedBy: true
          }
        },
        rep: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  // Get all commissions for admin
  static async getAllCommissions(): Promise<Commission[]> {
    return await prisma.commission.findMany({
      include: {
        checkout: {
          include: {
            claimedBy: true
          }
        },
        rep: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  // Mark commission as paid
  static async markCommissionPaid(commissionId: string): Promise<Commission> {
    return await prisma.commission.update({
      where: { id: commissionId },
      data: {
        status: 'PAID'
      },
      include: {
        checkout: {
          include: {
            claimedBy: true
          }
        },
        rep: true
      }
    })
  }

  // Get commission statistics
  static async getCommissionStats(): Promise<{
    totalCommissions: number
    pendingCommissions: number
    paidCommissions: number
    totalCommissionAmount: number
    totalPlatformFees: number
  }> {
    const stats = await prisma.commission.groupBy({
      by: ['status'],
      _count: {
        id: true
      },
      _sum: {
        commissionAmount: true,
        platformFee: true
      }
    })

    const result = {
      totalCommissions: 0,
      pendingCommissions: 0,
      paidCommissions: 0,
      totalCommissionAmount: 0,
      totalPlatformFees: 0
    }

    stats.forEach(stat => {
      result.totalCommissions += stat._count.id
      result.totalCommissionAmount += Number(stat._sum.commissionAmount || 0)
      result.totalPlatformFees += Number(stat._sum.platformFee || 0)
      
      if (stat.status === 'PENDING') {
        result.pendingCommissions = stat._count.id
      } else if (stat.status === 'PAID') {
        result.paidCommissions = stat._count.id
      }
    })

    return result
  }

  // Get rep earnings summary
  static async getRepEarnings(repId: string): Promise<{
    totalEarnings: number
    pendingEarnings: number
    paidEarnings: number
    totalRecoveries: number
    averageCommission: number
  }> {
    const commissions = await prisma.commission.findMany({
      where: { repId },
      select: {
        commissionAmount: true,
        status: true
      }
    })

    const totalRecoveries = commissions.length
    const totalEarnings = commissions.reduce((sum, c) => sum + Number(c.commissionAmount), 0)
    const pendingEarnings = commissions
      .filter(c => c.status === 'PENDING')
      .reduce((sum, c) => sum + Number(c.commissionAmount), 0)
    const paidEarnings = commissions
      .filter(c => c.status === 'PAID')
      .reduce((sum, c) => sum + Number(c.commissionAmount), 0)
    const averageCommission = totalRecoveries > 0 ? totalEarnings / totalRecoveries : 0

    return {
      totalEarnings,
      pendingEarnings,
      paidEarnings,
      totalRecoveries,
      averageCommission
    }
  }

  // Get monthly earnings for a rep
  static async getRepMonthlyEarnings(repId: string, months: number = 12): Promise<Array<{
    month: string
    earnings: number
    recoveries: number
  }>> {
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    const commissions = await prisma.commission.findMany({
      where: {
        repId: repId,
        createdAt: {
          gte: startDate
        }
      },
      select: {
        commissionAmount: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Group by month
    const monthlyData = new Map<string, { earnings: number; recoveries: number }>()
    
    commissions.forEach(commission => {
      const month = commission.createdAt.toISOString().slice(0, 7) // YYYY-MM
      const existing = monthlyData.get(month) || { earnings: 0, recoveries: 0 }
      monthlyData.set(month, {
        earnings: existing.earnings + Number(commission.commissionAmount),
        recoveries: existing.recoveries + 1
      })
    })

    // Convert to array and fill missing months
    const result = []
    for (let i = 0; i < months; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() - (months - 1 - i))
      const month = date.toISOString().slice(0, 7)
      const data = monthlyData.get(month) || { earnings: 0, recoveries: 0 }
      result.push({
        month,
        earnings: data.earnings,
        recoveries: data.recoveries
      })
    }

    return result
  }
}
