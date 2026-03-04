// Re-export Prisma types for convenience
export type {
  PlatformUser,
  AbandonedCheckout,
  Commission,
  Communication,
  ShopSettings,
  Session,
  SalesRep,
  AssignmentRule
} from '@prisma/client'

// Common utility types
export type UserRole = "PLATFORM_ADMIN" | "SALES_REP"
export type UserStatus = "PENDING" | "ACTIVE" | "INACTIVE" | "SUSPENDED" | "REJECTED"
export type Tier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
export type CheckoutStatus = "ABANDONED" | "RECOVERED"
export type CommissionStatus = "PENDING" | "PAID"
export type CommunicationChannel = "WhatsApp" | "Email" | "Phone" | "SMS"
export type Sentiment = "Positive" | "Neutral" | "Negative"
export type RecoveryTone = "FRIENDLY" | "PROFESSIONAL" | "URGENT"
