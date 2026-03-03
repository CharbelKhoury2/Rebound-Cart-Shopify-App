export type UserRole = "PLATFORM_ADMIN" | "SALES_REP";
export type UserStatus = "PENDING" | "ACTIVE" | "INACTIVE";
export type Tier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
export type CheckoutStatus = "ABANDONED" | "RECOVERED";
export type CommissionStatus = "PENDING" | "PAID";

export interface PlatformUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  tier: Tier;
  createdAt: string;
}

export interface AbandonedCheckout {
  id: string;
  shopName: string;
  customerEmail: string;
  totalPrice: number;
  currency: string;
  checkoutUrl: string;
  status: CheckoutStatus;
  claimedById: string | null;
  claimedAt: string | null;
  createdAt: string;
  lineItems: { title: string; quantity: number; price: number }[];
}

export interface Commission {
  id: string;
  checkoutId: string;
  repId: string;
  repName: string;
  shopName: string;
  totalAmount: number;
  commissionAmount: number;
  platformFee: number;
  status: CommissionStatus;
  createdAt: string;
}
