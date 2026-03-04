// API service for making HTTP requests to backend endpoints
// This connects to our backend server which handles Supabase database operations

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

class ApiService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const token = sessionStorage.getItem('reboundcart_token');
      const url = `${this.baseUrl}${endpoint}`
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('API request failed:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<{ user: any; token: string }> {
    const response = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Login failed');
    }

    return response.data;
  }

  async validateToken(token: string): Promise<{ user: any }> {
    const response = await this.request<{ user: any }>('/auth/validate', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Token validation failed');
    }

    return response.data;
  }

  // Checkout service methods
  async getAvailableCarts(): Promise<any[]> {
    const response = await this.request<any[]>('/checkouts/available');
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get available carts');
    }

    return response.data;
  }

  async claimCart(cartId: string, userId: string): Promise<any> {
    const response = await this.request<any>(`/checkouts/${cartId}/claim`, {
      method: 'POST',
      body: JSON.stringify({ repId: userId }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to claim cart');
    }

    return response.data;
  }

  async getRepClaimedCarts(repId: string): Promise<any[]> {
    const response = await this.request<any[]>(`/checkouts/claimed/${repId}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get claimed carts');
    }

    return response.data;
  }

  // Commission service methods
  async getRepCommissions(repId: string): Promise<any[]> {
    const response = await this.request<any[]>(`/commissions/rep/${repId}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get commissions');
    }

    return response.data;
  }

  async getAllCommissions(): Promise<any[]> {
    const response = await this.request<any[]>('/commissions/admin');
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get commissions');
    }

    return response.data;
  }

  async markCommissionPaid(commissionId: string): Promise<any> {
    const response = await this.request<any>(`/commissions/${commissionId}/paid`, {
      method: 'POST',
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to mark commission as paid');
    }

    return response.data;
  }

  // User management methods
  async getUsers(role?: string): Promise<any[]> {
    const params = role ? `?role=${role}` : '';
    const response = await this.request<any[]>(`/users${params}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get users');
    }

    return response.data;
  }

  async approveUser(userId: string): Promise<any> {
    const response = await this.request<any>(`/users/${userId}/approve`, {
      method: 'POST',
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to approve user');
    }

    return response.data;
  }

  async rejectUser(userId: string): Promise<any> {
    const response = await this.request<any>(`/users/${userId}/reject`, {
      method: 'POST',
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to reject user');
    }

    return response.data;
  }

  // Statistics methods
  async getCartStats(): Promise<any> {
    const response = await this.request<any>('/stats/carts');
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get cart statistics');
    }

    return response.data;
  }

  async getCommissionStats(): Promise<any> {
    const response = await this.request<any>('/stats/commissions');
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get commission statistics');
    }

    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.request<{ status: string; timestamp: string }>('/health');
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Health check failed');
    }

    return response.data;
  }
}

export const apiService = new ApiService()
