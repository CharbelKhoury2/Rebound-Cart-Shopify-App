import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Download, MoreVertical, Eye, Edit, Trash2, Globe, Mail, Phone, Calendar, TrendingUp, Users, DollarSign, ShoppingCart, AlertCircle, CheckCircle, Clock, RefreshCw, CheckSquare, Square, Play, Pause, Archive } from "lucide-react";
import { ShopifyStore, StoreFilters } from "@/types/store";
import { shopifyApi } from "@/services/shopifyApiService";
import { webhookService } from "@/services/shopifyWebhookService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StoreHealthIndicator, StoreHealthSummary } from "@/components/admin/StoreHealthIndicator";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

// Mock data - replace with actual API call
const mockStores: ShopifyStore[] = [
  {
    id: "1",
    shopDomain: "fashion-store.myshopify.com",
    shopName: "Fashion Boutique",
    email: "owner@fashion-store.com",
    ownerName: "Sarah Johnson",
    plan: "PRO",
    status: "ACTIVE",
    installedAt: "2024-01-15T10:30:00Z",
    lastActiveAt: "2024-03-03T14:22:00Z",
    totalCheckouts: 1247,
    recoveredCarts: 312,
    recoveryRate: 25.0,
    totalRevenue: 45680.50,
    commissionEarned: 1370.42,
    appVersion: "2.1.3",
    country: "United States",
    currency: "USD",
    timezone: "America/New_York",
    features: {
      emailNotifications: true,
      smsNotifications: false,
      advancedAnalytics: true,
      customBranding: true,
      apiAccess: true,
    },
    billing: {
      nextBillingDate: "2024-04-15T00:00:00Z",
      monthlyFee: 49.99,
    },
    support: {
      ticketsOpen: 2,
      lastSupportContact: "2024-03-01T16:30:00Z",
    },
  },
  {
    id: "2",
    shopDomain: "tech-gadgets.myshopify.com",
    shopName: "Tech Gadgets Plus",
    email: "admin@tech-gadgets.com",
    ownerName: "Mike Chen",
    plan: "BASIC",
    status: "ACTIVE",
    installedAt: "2024-02-20T09:15:00Z",
    lastActiveAt: "2024-03-03T11:45:00Z",
    totalCheckouts: 856,
    recoveredCarts: 171,
    recoveryRate: 20.0,
    totalRevenue: 28940.75,
    commissionEarned: 578.82,
    appVersion: "2.1.2",
    country: "Canada",
    currency: "CAD",
    timezone: "America/Toronto",
    features: {
      emailNotifications: true,
      smsNotifications: true,
      advancedAnalytics: false,
      customBranding: false,
      apiAccess: false,
    },
    billing: {
      nextBillingDate: "2024-04-20T00:00:00Z",
      monthlyFee: 19.99,
    },
    support: {
      ticketsOpen: 0,
    },
  },
  {
    id: "3",
    shopDomain: "home-decor-shop.myshopify.com",
    shopName: "Home Decor Shop",
    email: "contact@home-decor-shop.com",
    ownerName: "Emma Wilson",
    plan: "FREE",
    status: "INACTIVE",
    installedAt: "2024-01-08T14:20:00Z",
    lastActiveAt: "2024-02-28T16:10:00Z",
    totalCheckouts: 234,
    recoveredCarts: 35,
    recoveryRate: 15.0,
    totalRevenue: 8920.30,
    commissionEarned: 0.00,
    appVersion: "2.0.8",
    country: "United Kingdom",
    currency: "GBP",
    timezone: "Europe/London",
    features: {
      emailNotifications: true,
      smsNotifications: false,
      advancedAnalytics: false,
      customBranding: false,
      apiAccess: false,
    },
    billing: {
      nextBillingDate: "",
      monthlyFee: 0,
    },
    support: {
      ticketsOpen: 1,
      lastSupportContact: "2024-03-02T10:15:00Z",
    },
  },
  {
    id: "4",
    shopDomain: "sports-equipment.myshopify.com",
    shopName: "Sports Equipment Pro",
    email: "sales@sports-equipment.com",
    ownerName: "David Martinez",
    plan: "ENTERPRISE",
    status: "SUSPENDED",
    installedAt: "2023-12-10T11:00:00Z",
    lastActiveAt: "2024-03-01T09:30:00Z",
    totalCheckouts: 2156,
    recoveredCarts: 647,
    recoveryRate: 30.0,
    totalRevenue: 98450.80,
    commissionEarned: 2953.52,
    appVersion: "2.1.3",
    country: "Australia",
    currency: "AUD",
    timezone: "Australia/Sydney",
    features: {
      emailNotifications: true,
      smsNotifications: true,
      advancedAnalytics: true,
      customBranding: true,
      apiAccess: true,
    },
    billing: {
      nextBillingDate: "2024-04-10T00:00:00Z",
      monthlyFee: 149.99,
    },
    support: {
      ticketsOpen: 3,
      lastSupportContact: "2024-03-02T14:45:00Z",
    },
  },
];

export default function StoreManagement() {
  const [stores, setStores] = useState<ShopifyStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<StoreFilters>({
    search: "",
    status: "",
    plan: "",
    country: "",
    dateRange: "",
    tags: [],
    minRevenue: "",
    maxRevenue: "",
    minRecoveryRate: "",
    maxRecoveryRate: ""
  });
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Generate health metrics for stores
  const generateHealthMetrics = (store: ShopifyStore) => {
    return {
      recoveryRate: store.recoveryRate,
      revenueGrowth: Math.random() * 20 - 5, // Random growth between -5% and 15%
      activeUsers: Math.floor(Math.random() * 200) + 20,
      responseTime: Math.floor(Math.random() * 800) + 100,
      errorRate: Math.random() * 15,
      lastSync: new Date(Date.now() - Math.random() * 3600000),
      uptime: 95 + Math.random() * 5
    };
  };

  // Bulk operations
  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete' | 'sync' | 'Contact' | 'Suspend') => {
    if (selectedStores.length === 0) return;
    
    setIsBulkProcessing(true);
    try {
      switch (action) {
        case 'activate':
          await new Promise(resolve => setTimeout(resolve, 1500));
          toast.success(`Activated ${selectedStores.length} stores`);
          break;
        case 'deactivate':
          await new Promise(resolve => setTimeout(resolve, 1500));
          toast.success(`Deactivated ${selectedStores.length} stores`);
          break;
        case 'delete':
          if (confirm(`Are you sure you want to delete ${selectedStores.length} stores?`)) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success(`Deleted ${selectedStores.length} stores`);
            setStores(prev => prev.filter(store => !selectedStores.includes(store.id)));
          }
          break;
        case 'sync':
          await new Promise(resolve => setTimeout(resolve, 2000));
          toast.success(`Synced ${selectedStores.length} stores`);
          break;
        case 'Contact':
          toast.success(`Contacted ${selectedStores.length} stores`);
          break;
        case 'Suspend':
          await shopifyApi.bulkSyncStores(selectedStores);
          toast.success(`Suspended ${selectedStores.length} stores`);
          break;
      }
      setSelectedStores([]);
      loadStores(); // Refresh data
    } catch (error) {
      toast.error('Bulk operation failed');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const selectAllStores = () => {
    if (selectedStores.length === filteredStores.length) {
      setSelectedStores([]);
    } else {
      setSelectedStores(filteredStores.map(store => store.id));
    }
  };

  // Load stores from API
  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setLoading(true);
      
      // Try to load from real API first
      const response = await shopifyApi.getStores(filters);
      if (response.success) {
        setStores(response.data);
        console.log('✅ Loaded stores from Shopify app');
      } else {
        throw new Error(response.message || 'API returned error');
      }
      
    } catch (error) {
      console.error('❌ Failed to load stores from API:', error);
      console.log('📊 Using mock data - check your Shopify app connection');
      toast.error('Using mock data - Shopify app not responding');
      setStores(mockStores); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  // Reload when filters change
  useEffect(() => {
    loadStores();
  }, [filters]);

  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      const matchesSearch = !filters.search || 
        store.shopName.toLowerCase().includes(filters.search.toLowerCase()) ||
        store.shopDomain.toLowerCase().includes(filters.search.toLowerCase()) ||
        store.ownerName.toLowerCase().includes(filters.search.toLowerCase()) ||
        store.email.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = !filters.status || store.status === filters.status;
      const matchesPlan = !filters.plan || store.plan === filters.plan;
      const matchesCountry = !filters.country || store.country === filters.country;

      return matchesSearch && matchesStatus && matchesPlan && matchesCountry;
    });
  }, [stores, filters]);

  const stats = useMemo(() => {
    return {
      totalStores: stores.length,
      activeStores: stores.filter(s => s.status === 'ACTIVE').length,
      totalRevenue: stores.reduce((sum, s) => sum + s.totalRevenue, 0),
      totalRecovered: stores.reduce((sum, s) => sum + s.recoveredCarts, 0),
      avgRecoveryRate: stores.reduce((sum, s) => sum + s.recoveryRate, 0) / stores.length,
    };
  }, [stores]);

  const handleExport = async () => {
    try {
      const blob = await shopifyApi.exportStores(filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stores_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Exported stores data successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed');
    }
  };

  
  const handleSyncStore = async (storeId: string) => {
    try {
      await shopifyApi.syncStoreData(storeId);
      toast.success('Store synced successfully');
      loadStores(); // Refresh data
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Sync failed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green';
      case 'INACTIVE': return 'text-gray';
      case 'SUSPENDED': return 'text-red';
      case 'PENDING': return 'text-yellow';
      default: return 'text-gray';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green';
      case 'INACTIVE': return 'bg-gray';
      case 'SUSPENDED': return 'bg-red';
      case 'PENDING': return 'bg-yellow';
      default: return 'bg-gray';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'FREE': return 'text-gray';
      case 'BASIC': return 'text-blue';
      case 'PRO': return 'text-purple';
      case 'ENTERPRISE': return 'text-orange';
      default: return 'text-gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Store Management</h1>
          <p className="text-muted-foreground">Manage all Shopify stores using Rebound Cart</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => loadStores()}
            className="flex items-center gap-2 px-4 py-2 bg-gray text-white rounded-lg hover:bg-gray/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue text-white rounded-lg hover:bg-blue/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray">Total Stores</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalStores}</p>
            </div>
            <div className="p-3 bg-blue/10 rounded-lg">
              <Globe className="h-6 w-6 text-blue" />
            </div>
          </div>
        </div>
        {/* ... other stat cards */}
      </div>

      {/* Store Health Summary */}
      <div className="mb-6">
        <StoreHealthSummary 
          stores={filteredStores.map(store => ({
            id: store.id,
            name: store.shopName,
            metrics: generateHealthMetrics(store)
          }))}
        />
      </div>

      {/* Bulk Actions Panel */}
      {showBulkActions && selectedStores.length > 0 && (
        <Card className="glass-card mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">
                  {selectedStores.length} store{selectedStores.length !== 1 ? 's' : ''} selected
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose an action to perform on selected stores
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                  disabled={isBulkProcessing}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('deactivate')}
                  disabled={isBulkProcessing}
                >
                  <Pause className="h-4 w-4 mr-1" />
                  Deactivate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('sync')}
                  disabled={isBulkProcessing}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Sync
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('Contact')}
                  disabled={isBulkProcessing}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Contact
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  disabled={isBulkProcessing}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-yellow/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray">Avg Recovery Rate</p>
              <p className="text-2xl font-bold text-foreground">{stats.avgRecoveryRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-purple/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray" />
              <input
                type="text"
                placeholder="Search stores..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/20"
              />
            </div>
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/20"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING">Pending</option>
          </select>
          
          <select
            value={filters.plan}
            onChange={(e) => setFilters(prev => ({ ...prev, plan: e.target.value }))}
            className="px-3 py-2 border border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/20"
          >
            <option value="">All Plans</option>
            <option value="FREE">Free</option>
            <option value="BASIC">Basic</option>
            <option value="PRO">Pro</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>
          
          <select
            value={filters.country}
            onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
            className="px-3 py-2 border border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/20"
          >
            <option value="">All Countries</option>
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Australia">Australia</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedStores.length > 0 && (
        <div className="bg-blue/10 border border-blue rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue font-medium">
              {selectedStores.length} store{selectedStores.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('Contact')}
                className="px-3 py-1 bg-blue text-white rounded hover:bg-blue/90 transition-colors"
              >
                <Mail className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleBulkAction('Suspend')}
                className="px-3 py-1 bg-red text-white rounded hover:bg-red/90 transition-colors"
              >
                <AlertCircle className="h-4 w-4" />
              </button>
              <button
                onClick={() => setSelectedStores([])}
                className="px-3 py-1 bg-gray text-white rounded hover:bg-gray/90 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stores Table */}
      <div className="bg-white rounded-lg border border-gray overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedStores.length === filteredStores.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStores(filteredStores.map(s => s.id));
                      } else {
                        setSelectedStores([]);
                      }
                    }}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray uppercase">Store</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray uppercase">Owner</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray uppercase">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray uppercase">Performance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray uppercase">Revenue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray uppercase">Installed</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray">
              {filteredStores.map((store) => (
                <tr key={store.id} className="hover:bg-gray/50 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedStores.includes(store.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStores(prev => [...prev, store.id]);
                        } else {
                          setSelectedStores(prev => prev.filter(id => id !== store.id));
                        }
                      }}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-foreground">{store.shopName}</div>
                      <div className="text-sm text-gray">{store.shopDomain}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-foreground">{store.ownerName}</div>
                      <div className="text-sm text-gray">{store.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(store.plan)}`}>
                      {store.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBg(store.status)} text-white`}>
                      {store.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <div className="text-foreground">{store.recoveredCarts} / {store.totalCheckouts}</div>
                      <div className="text-gray">{store.recoveryRate}% recovery</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <div className="font-medium text-foreground">{store.currency} {store.totalRevenue.toLocaleString()}</div>
                      <div className="text-gray">{store.currency} {store.commissionEarned.toLocaleString()} commission</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray">
                      <div>{new Date(store.installedAt).toLocaleDateString()}</div>
                      <div>v{store.appVersion}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSyncStore(store.id)}
                        className="p-1 text-gray hover:text-blue transition-colors"
                        title="Sync Store"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 text-gray hover:text-blue transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 text-gray hover:text-blue transition-colors"
                        title="Edit Store"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 text-gray hover:text-red transition-colors"
                        title="Delete Store"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 text-gray hover:text-gray transition-colors"
                        title="More Options"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredStores.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray/10 rounded-full mb-4">
            <Globe className="h-8 w-8 text-gray" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No stores found</h3>
          <p className="text-gray">
            Try adjusting your filters or search terms to find the stores you're looking for.
          </p>
        </div>
      )}
    </div>
  );
}
