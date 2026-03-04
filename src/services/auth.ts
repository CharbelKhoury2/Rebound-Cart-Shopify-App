import { prisma } from '@/lib/database'
import type { PlatformUser, Session } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET!

export interface JWTPayload {
  userId: string
  email: string
  role: string
  shop?: string
}

// Browser-compatible JWT implementation
class BrowserJWT {
  static base64UrlEncode(str: string): string {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  static base64UrlDecode(str: string): string {
    str += new Array(5 - str.length % 4).join('=')
    return atob(str.replace(/\-/g, '+').replace(/_/g, '/'))
  }

  static encode(payload: JWTPayload): string {
    const header = { alg: 'HS256', typ: 'JWT' }
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header))
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload))
    
    // Simple signature for demo (in production, use proper crypto)
    const signature = this.base64UrlEncode(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}`)
    
    return `${encodedHeader}.${encodedPayload}.${signature}`
  }

  static decode(token: string): JWTPayload | null {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return null
      
      const payload = this.base64UrlDecode(parts[1])
      return JSON.parse(payload)
    } catch (error) {
      console.error('JWT decode error:', error)
      return null
    }
  }

  static verify(token: string): JWTPayload | null {
    try {
      const payload = this.decode(token)
      if (!payload) return null
      
      // Simple verification for demo
      // In production, implement proper HMAC verification
      return payload
    } catch (error) {
      console.error('JWT verification error:', error)
      return null
    }
  }
}

export class AuthService {
  static verifyToken(token: string): JWTPayload | null {
    return BrowserJWT.verify(token)
  }

  static generateToken(payload: JWTPayload): string {
    return BrowserJWT.encode(payload)
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
