export interface ShopifyStore {
  id: string;
  shopDomain: string;
  shopName: string;
  email: string;
  ownerName: string;
  plan: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  installedAt: string;
  lastActiveAt: string;
  totalCheckouts: number;
  recoveredCarts: number;
  recoveryRate: number;
  totalRevenue: number;
  commissionEarned: number;
  appVersion: string;
  country: string;
  currency: string;
  timezone: string;
  features: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    advancedAnalytics: boolean;
    customBranding: boolean;
    apiAccess: boolean;
  };
  billing: {
    nextBillingDate: string;
    monthlyFee: number;
    trialEndsAt?: string;
  };
  support: {
    ticketsOpen: number;
    lastSupportContact?: string;
  };
}

export interface StoreFilters {
  search: string;
  status: string;
  plan: string;
  country: string;
  dateRange: string;
}
