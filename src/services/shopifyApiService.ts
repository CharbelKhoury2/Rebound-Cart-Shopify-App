import { ShopifyStore, StoreFilters } from '@/types/store';
import { CheckoutWebhookData, OrderWebhookData } from './shopifyWebhookService';

export interface ShopifyApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StoreMetrics {
  totalCheckouts: number;
  recoveredCarts: number;
  recoveryRate: number;
  totalRevenue: number;
  commissionEarned: number;
  averageOrderValue: number;
  topProducts: Array<{
    id: string;
    title: string;
    quantity: number;
    revenue: number;
  }>;
  recentActivity: Array<{
    type: 'checkout' | 'order' | 'recovery';
    timestamp: string;
    amount: number;
    description: string;
  }>;
}

export class ShopifyApiService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_SHOPIFY_APP_URL || 'http://localhost:3000';
    this.apiKey = import.meta.env.VITE_API_KEY || '';
  }

  // Store Management APIs
  async getStores(filters?: StoreFilters): Promise<ShopifyApiResponse<ShopifyStore[]>> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.plan) params.append('plan', filters.plan);
      if (filters?.country) params.append('country', filters.country);
      if (filters?.dateRange) params.append('dateRange', filters.dateRange);

      const response = await fetch(`${this.baseUrl}/api/stores?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to fetch stores:', error);
      throw error;
    }
  }

  async getStore(storeId: string): Promise<ShopifyApiResponse<ShopifyStore>> {
    const response = await fetch(`${this.baseUrl}/api/stores/${storeId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async syncStoreData(storeId: string): Promise<ShopifyApiResponse<any>> {
    try {
      console.log(`🔄 Syncing store data for ${storeId}`);
      
      const response = await fetch(`${this.baseUrl}/api/stores/${storeId}/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Store sync completed:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to sync store:', error);
      throw error;
    }
  }

  async bulkSyncStores(storeIds: string[]): Promise<ShopifyApiResponse<any>> {
    const response = await fetch(`${this.baseUrl}/api/stores/bulk-sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ storeIds }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Store Metrics APIs
  async getStoreMetrics(storeId: string, dateRange?: string): Promise<ShopifyApiResponse<StoreMetrics>> {
    const params = dateRange ? `?dateRange=${dateRange}` : '';
    const response = await fetch(`${this.baseUrl}/api/stores/${storeId}/metrics${params}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async getGlobalMetrics(dateRange?: string): Promise<ShopifyApiResponse<any>> {
    const params = dateRange ? `?dateRange=${dateRange}` : '';
    const response = await fetch(`${this.baseUrl}/api/analytics/overview${params}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Store Actions APIs
  async suspendStore(storeId: string, reason?: string): Promise<ShopifyApiResponse<any>> {
    const response = await fetch(`${this.baseUrl}/api/stores/${storeId}/suspend`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async activateStore(storeId: string): Promise<ShopifyApiResponse<any>> {
    const response = await fetch(`${this.baseUrl}/api/stores/${storeId}/activate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async deleteStore(storeId: string): Promise<ShopifyApiResponse<any>> {
    const response = await fetch(`${this.baseUrl}/api/stores/${storeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async updateStorePlan(storeId: string, plan: string): Promise<ShopifyApiResponse<any>> {
    const response = await fetch(`${this.baseUrl}/api/stores/${storeId}/plan`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Cart Recovery APIs
  async getAbandonedCarts(storeId: string, filters?: any): Promise<ShopifyApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${this.baseUrl}/api/stores/${storeId}/carts?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async recoverCart(storeId: string, cartId: string, recoveryData: any): Promise<ShopifyApiResponse<any>> {
    const response = await fetch(`${this.baseUrl}/api/stores/${storeId}/carts/${cartId}/recover`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recoveryData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Export APIs
  async exportStores(filters?: StoreFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.plan) params.append('plan', filters.plan);
    if (filters?.country) params.append('country', filters.country);

    const response = await fetch(`${this.baseUrl}/api/stores/export?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  }

  async exportStoreMetrics(storeId: string, dateRange?: string): Promise<Blob> {
    const params = dateRange ? `?dateRange=${dateRange}` : '';
    const response = await fetch(`${this.baseUrl}/api/stores/${storeId}/export${params}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  }

  // Health Check
  async healthCheck(): Promise<ShopifyApiResponse<{ status: string; timestamp: string }>> {
    const response = await fetch(`${this.baseUrl}/api/health`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Get API status and webhook health
  async getSystemStatus(): Promise<ShopifyApiResponse<{
    api: 'healthy' | 'degraded' | 'down';
    webhooks: 'healthy' | 'degraded' | 'down';
    database: 'healthy' | 'degraded' | 'down';
    lastSync: string;
  }>> {
    const response = await fetch(`${this.baseUrl}/api/system/status`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

// Export singleton instance
export const shopifyApi = new ShopifyApiService();
