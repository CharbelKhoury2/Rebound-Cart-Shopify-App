import type { PlatformUser, AbandonedCheckout, Commission } from "@/types";

export const mockUsers: PlatformUser[] = [
  { id: "u1", email: "admin@reboundcart.com", firstName: "Sarah", lastName: "Chen", role: "PLATFORM_ADMIN", status: "ACTIVE", tier: "PLATINUM", createdAt: "2025-01-15" },
  { id: "u2", email: "james@sales.com", firstName: "James", lastName: "Wilson", role: "SALES_REP", status: "ACTIVE", tier: "GOLD", createdAt: "2025-02-01" },
  { id: "u3", email: "maria@sales.com", firstName: "Maria", lastName: "Garcia", role: "SALES_REP", status: "ACTIVE", tier: "SILVER", createdAt: "2025-03-10" },
  { id: "u4", email: "alex@sales.com", firstName: "Alex", lastName: "Kim", role: "SALES_REP", status: "PENDING", tier: "BRONZE", createdAt: "2025-06-20" },
  { id: "u5", email: "nina@sales.com", firstName: "Nina", lastName: "Patel", role: "SALES_REP", status: "ACTIVE", tier: "PLATINUM", createdAt: "2025-01-28" },
  { id: "u6", email: "tom@sales.com", firstName: "Tom", lastName: "Rivera", role: "SALES_REP", status: "INACTIVE", tier: "BRONZE", createdAt: "2025-04-05" },
];

export const mockCheckouts: AbandonedCheckout[] = [
  { id: "c1", shopName: "Luxe Skincare Co.", customerEmail: "customer1@email.com", totalPrice: 289.99, currency: "USD", checkoutUrl: "https://luxe-skincare.myshopify.com/checkouts/abc123", status: "ABANDONED", claimedById: null, claimedAt: null, createdAt: "2026-03-02T14:30:00Z", lineItems: [{ title: "Retinol Serum", quantity: 2, price: 89.99 }, { title: "Moisturizer Set", quantity: 1, price: 110.01 }] },
  { id: "c2", shopName: "TechGear Hub", customerEmail: "customer2@email.com", totalPrice: 549.00, currency: "USD", checkoutUrl: "https://techgear.myshopify.com/checkouts/def456", status: "ABANDONED", claimedById: null, claimedAt: null, createdAt: "2026-03-02T12:15:00Z", lineItems: [{ title: "Wireless Earbuds Pro", quantity: 1, price: 249.00 }, { title: "Phone Case Bundle", quantity: 1, price: 300.00 }] },
  { id: "c3", shopName: "FitLife Nutrition", customerEmail: "customer3@email.com", totalPrice: 175.50, currency: "USD", checkoutUrl: "https://fitlife.myshopify.com/checkouts/ghi789", status: "ABANDONED", claimedById: null, claimedAt: null, createdAt: "2026-03-01T18:45:00Z", lineItems: [{ title: "Protein Powder 2kg", quantity: 1, price: 89.50 }, { title: "BCAA Capsules", quantity: 2, price: 43.00 }] },
  { id: "c4", shopName: "Urban Threads", customerEmail: "customer4@email.com", totalPrice: 412.00, currency: "USD", checkoutUrl: "https://urbanthreads.myshopify.com/checkouts/jkl012", status: "ABANDONED", claimedById: null, claimedAt: null, createdAt: "2026-03-02T09:20:00Z", lineItems: [{ title: "Designer Jacket", quantity: 1, price: 312.00 }, { title: "Silk Scarf", quantity: 1, price: 100.00 }] },
  { id: "c5", shopName: "Luxe Skincare Co.", customerEmail: "rep-visible@email.com", totalPrice: 195.00, currency: "USD", checkoutUrl: "https://luxe-skincare.myshopify.com/checkouts/mno345", status: "ABANDONED", claimedById: "u2", claimedAt: "2026-03-01T20:00:00Z", createdAt: "2026-03-01T10:00:00Z", lineItems: [{ title: "Anti-Aging Kit", quantity: 1, price: 195.00 }] },
  { id: "c6", shopName: "TechGear Hub", customerEmail: "rep-visible2@email.com", totalPrice: 899.00, currency: "USD", checkoutUrl: "https://techgear.myshopify.com/checkouts/pqr678", status: "RECOVERED", claimedById: "u2", claimedAt: "2026-02-28T15:00:00Z", createdAt: "2026-02-28T08:00:00Z", lineItems: [{ title: "Smart Watch Ultra", quantity: 1, price: 899.00 }] },
  { id: "c7", shopName: "FitLife Nutrition", customerEmail: "rep-visible3@email.com", totalPrice: 320.00, currency: "USD", checkoutUrl: "https://fitlife.myshopify.com/checkouts/stu901", status: "ABANDONED", claimedById: "u2", claimedAt: "2026-03-02T11:00:00Z", createdAt: "2026-03-02T06:00:00Z", lineItems: [{ title: "Supplement Stack", quantity: 1, price: 320.00 }] },
];

export const mockCommissions: Commission[] = [
  { id: "cm1", checkoutId: "c6", repId: "u2", repName: "James Wilson", shopName: "TechGear Hub", totalAmount: 899.00, commissionAmount: 62.93, platformFee: 26.97, status: "PAID", createdAt: "2026-03-01" },
  { id: "cm2", checkoutId: "cx1", repId: "u5", repName: "Nina Patel", shopName: "Luxe Skincare Co.", totalAmount: 450.00, commissionAmount: 31.50, platformFee: 13.50, status: "PENDING", createdAt: "2026-03-02" },
  { id: "cm3", checkoutId: "cx2", repId: "u2", repName: "James Wilson", shopName: "Urban Threads", totalAmount: 1200.00, commissionAmount: 84.00, platformFee: 36.00, status: "PENDING", createdAt: "2026-03-02" },
  { id: "cm4", checkoutId: "cx3", repId: "u3", repName: "Maria Garcia", shopName: "FitLife Nutrition", totalAmount: 275.00, commissionAmount: 19.25, platformFee: 8.25, status: "PAID", createdAt: "2026-02-28" },
  { id: "cm5", checkoutId: "cx4", repId: "u5", repName: "Nina Patel", shopName: "TechGear Hub", totalAmount: 680.00, commissionAmount: 47.60, platformFee: 20.40, status: "PENDING", createdAt: "2026-03-03" },
];
