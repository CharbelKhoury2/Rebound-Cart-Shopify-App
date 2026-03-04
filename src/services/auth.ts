import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/database'
import type { PlatformUser, Session } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET!

export interface JWTPayload {
  userId: string
  email: string
  role: string
  shop?: string
}

export class AuthService {
  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
      return decoded
    } catch (error) {
      console.error('Token verification failed:', error)
      return null
    }
  }

  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
  }

  static async validateSession(token: string): Promise<{ user: PlatformUser | null, session: Session | null }> {
    const payload = this.verifyToken(token)
    if (!payload) {
      return { user: null, session: null }
    }

    try {
      // Find user by email
      const user = await prisma.platformUser.findUnique({
        where: { email: payload.email }
      })

      // Find session if shop is available
      let session = null
      if (payload.shop) {
        session = await prisma.session.findFirst({
          where: {
            shop: payload.shop,
            email: payload.email
          }
        })
      }

      return { user, session }
    } catch (error) {
      console.error('Session validation error:', error)
      return { user: null, session: null }
    }
  }

  static async createUser(userData: {
    email: string
    firstName?: string
    lastName?: string
    role: string
    tier?: string
    experience?: string
    skills?: string
  }): Promise<PlatformUser> {
    return await prisma.platformUser.create({
      data: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'SALES_REP',
        tier: userData.tier || 'BRONZE',
        experience: userData.experience,
        skills: userData.skills,
        status: 'PENDING'
      }
    })
  }

  static async approveUser(userId: string): Promise<PlatformUser> {
    return await prisma.platformUser.update({
      where: { id: userId },
      data: { status: 'ACTIVE' }
    })
  }

  static async rejectUser(userId: string): Promise<PlatformUser> {
    return await prisma.platformUser.update({
      where: { id: userId },
      data: { status: 'REJECTED' }
    })
  }

  static async getUsersByRole(role?: string): Promise<PlatformUser[]> {
    return await prisma.platformUser.findMany({
      where: role ? { role } : undefined,
      orderBy: { createdAt: 'desc' }
    })
  }
}
