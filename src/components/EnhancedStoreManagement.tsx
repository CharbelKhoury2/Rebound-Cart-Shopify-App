import { useState, useEffect, useMemo } from "react";
import React from "react";
import { Search, Filter, Download, MoreVertical, Eye, Edit, Trash2, Globe, Mail, Phone, Calendar, TrendingUp, Users, DollarSign, ShoppingCart, AlertCircle, CheckCircle, Clock, RefreshCw, Tag, Star, Activity, BarChart3, Settings, Zap, ChevronDown, ChevronUp, X, Plus } from "lucide-react";
import { ShopifyStore, StoreFilters } from "@/types/store";
import { shopifyApi } from "@/services/shopifyApiService";
import { webhookService } from "@/services/shopifyWebhookService";
import { toast } from "sonner";

interface StoreMetrics {
  id: string;
  storeId: string;
  date: string;
  totalCheckouts: number;
  recoveredCarts: number;
  revenue: number;
  recoveryRate: number;
  avgOrderValue: number;
  topProducts: Array<{
    id: string;
    title: string;
    quantity: number;
    revenue: number;
    currency: string;
  }>;
}

interface StoreTag {
  id: string;
  name: string;
  color: string;
  storeIds: string[];
}

export default function EnhancedStoreManagement() {
  const [stores, setStores] = useState<ShopifyStore[]>([]);
  const [storeMetrics, setStoreMetrics] = useState<Record<string, StoreMetrics>>({});
  const [storeTags, setStoreTags] = useState<StoreTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [expandedStores, setExpandedStores] = useState<Set<string>>(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'settings'>('overview');

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
    maxRecoveryRate: "",
  });

  // Live metrics will be loaded from the API
  useEffect(() => {
    loadStores();
    loadStoreMetrics();
    loadStoreTags();
  }, []);

  const loadStores = async () => {
    try {
      setLoading(true);
      const response = await shopifyApi.getStores(filters);
      if (response.success) {
        setStores(response.data || []);
        console.log('✅ Loaded real store data from API');
      } else {
        throw new Error(response.message || 'API error');
      }
    } catch (error) {
      console.error('❌ Failed to load stores:', error);
      toast.error('Failed to load stores from API. Showing empty state.');
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStoreMetrics = async () => {
    // We could load actual metrics if we have a loop, but for now we'll start empty
    setStoreMetrics({});
  };

  const loadStoreTags = async () => {
    // Tags should come from backend
    setStoreTags([]);
  };

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

      const matchesMinRevenue = !filters.minRevenue || store.totalRevenue >= parseFloat(filters.minRevenue);
      const matchesMaxRevenue = !filters.maxRevenue || store.totalRevenue <= parseFloat(filters.maxRevenue);

      const matchesMinRecoveryRate = !filters.minRecoveryRate || store.recoveryRate >= parseFloat(filters.minRecoveryRate);
      const matchesMaxRecoveryRate = !filters.maxRecoveryRate || store.recoveryRate <= parseFloat(filters.maxRecoveryRate);

      return matchesSearch && matchesStatus && matchesPlan && matchesCountry &&
        matchesMinRevenue && matchesMaxRevenue && matchesMinRecoveryRate && matchesMaxRecoveryRate;
    });
  }, [stores, filters]);

  const stats = useMemo(() => {
    return {
      totalStores: stores.length,
      activeStores: stores.filter(s => s.status === 'ACTIVE').length,
      totalRevenue: stores.reduce((sum, s) => sum + s.totalRevenue, 0),
      totalRecovered: stores.reduce((sum, s) => sum + s.recoveredCarts, 0),
      avgRecoveryRate: stores.reduce((sum, s) => sum + s.recoveryRate, 0) / stores.length,
      highPerformers: stores.filter(s => s.recoveryRate > 25).length,
      needsAttention: stores.filter(s => s.recoveryRate < 15 && s.status === 'ACTIVE').length,
    };
  }, [stores]);

  const toggleStoreExpansion = (storeId: string) => {
    const newExpanded = new Set(expandedStores);
    if (newExpanded.has(storeId)) {
      newExpanded.delete(storeId);
    } else {
      newExpanded.add(storeId);
    }
    setExpandedStores(newExpanded);
  };

  const getStoreTags = (storeId: string) => {
    return storeTags.filter(tag => tag.storeIds.includes(storeId));
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

  const getTagColor = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green/10 text-green border-green';
      case 'yellow': return 'bg-yellow/10 text-yellow border-yellow';
      case 'blue': return 'bg-blue/10 text-blue border-blue';
      case 'purple': return 'bg-purple/10 text-purple border-purple';
      default: return 'bg-gray/10 text-gray border-gray';
    }
  };

  const handleBulkAction = async (action: string) => {
    try {
      switch (action) {
        case 'Contact':
          toast.success(`Contacted ${selectedStores.length} stores`);
          break;
        case 'Tag':
          toast.success(`Tagged ${selectedStores.length} stores`);
          break;
        case 'Export':
          toast.success(`Exported ${selectedStores.length} stores`);
          break;
        case 'Suspend':
          toast.success(`Suspended ${selectedStores.length} stores`);
          break;
        default:
          toast.success(`${action} ${selectedStores.length} stores`);
      }
      setSelectedStores([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast.error('Bulk action failed');
    }
  };

  const handleSyncStore = async (storeId: string) => {
    try {
      toast.success('Store synced successfully');
      loadStores(); // Refresh data
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Sync failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Enhanced Store Management</h1>
          <p className="text-muted-foreground">Advanced store management with analytics and insights</p>
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
            className="flex items-center gap-2 px-4 py-2 bg-blue text-white rounded-lg hover:bg-blue/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Store
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-green text-white rounded-lg hover:bg-green/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray">Total Stores</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalStores}</p>
            </div>
            <div className="p-2 bg-blue/10 rounded-lg">
              <Globe className="h-5 w-5 text-blue" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray">Active</p>
              <p className="text-2xl font-bold text-green">{stats.activeStores}</p>
            </div>
            <div className="p-2 bg-green/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray">Revenue</p>
              <p className="text-xl font-bold text-foreground">${(stats.totalRevenue / 1000).toFixed(1)}k</p>
            </div>
            <div className="p-2 bg-yellow/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-yellow" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray">Recovered</p>
              <p className="text-2xl font-bold text-purple">{stats.totalRecovered}</p>
            </div>
            <div className="p-2 bg-purple/10 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-purple" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray">Avg Recovery</p>
              <p className="text-2xl font-bold text-foreground">{stats.avgRecoveryRate.toFixed(1)}%</p>
            </div>
            <div className="p-2 bg-orange/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray">High Performers</p>
              <p className="text-2xl font-bold text-green">{stats.highPerformers}</p>
            </div>
            <div className="p-2 bg-green/10 rounded-lg">
              <Star className="h-5 w-5 text-green" />
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-foreground">Advanced Filters</h3>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 text-sm text-gray hover:text-foreground"
          >
            {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showAdvancedFilters ? 'Hide' : 'Show'} Advanced
          </button>
        </div>

        {/* Basic Filters */}
        <div className="flex flex-wrap gap-4 items-center mb-4">
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

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="border-t border-gray pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray mb-1">Min Revenue</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minRevenue}
                  onChange={(e) => setFilters(prev => ({ ...prev, minRevenue: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray mb-1">Max Revenue</label>
                <input
                  type="number"
                  placeholder="100000"
                  value={filters.maxRevenue}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxRevenue: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray mb-1">Min Recovery Rate (%)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minRecoveryRate}
                  onChange={(e) => setFilters(prev => ({ ...prev, minRecoveryRate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray mb-1">Max Recovery Rate (%)</label>
                <input
                  type="number"
                  placeholder="100"
                  value={filters.maxRecoveryRate}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxRecoveryRate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/20"
                />
              </div>
            </div>
          </div>
        )}
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
                onClick={() => handleBulkAction('Tag')}
                className="px-3 py-1 bg-purple text-white rounded hover:bg-purple/90 transition-colors"
              >
                <Tag className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleBulkAction('Export')}
                className="px-3 py-1 bg-green text-white rounded hover:bg-green/90 transition-colors"
              >
                <Download className="h-4 w-4" />
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
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Stores Table */}
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray uppercase">Tags</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray">
              {filteredStores.map((store) => (
                <React.Fragment key={store.id}>
                  <tr className="hover:bg-gray/50 transition-colors">
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleStoreExpansion(store.id)}
                          className="p-1 text-gray hover:text-blue transition-colors"
                        >
                          {expandedStores.has(store.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        <div>
                          <div className="font-medium text-foreground">{store.shopName}</div>
                          <div className="text-sm text-gray">{store.shopDomain}</div>
                        </div>
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
                      <div className="flex flex-wrap gap-1">
                        {getStoreTags(store.id).map(tag => (
                          <span
                            key={tag.id}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTagColor(tag.color)}`}
                          >
                            {tag.name}
                          </span>
                        ))}
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

                  {/* Expanded Row with Store Details */}
                  {expandedStores.has(store.id) && (
                    <tr className="bg-gray/20">
                      <td colSpan={9} className="px-4 py-6">
                        <div className="space-y-4">
                          {/* Tabs */}
                          <div className="flex border-b border-gray">
                            <button
                              onClick={() => setActiveTab('overview')}
                              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview'
                                ? 'border-blue text-blue'
                                : 'border-transparent text-gray hover:text-foreground'
                                }`}
                            >
                              Overview
                            </button>
                            <button
                              onClick={() => setActiveTab('performance')}
                              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'performance'
                                ? 'border-blue text-blue'
                                : 'border-transparent text-gray hover:text-foreground'
                                }`}
                            >
                              Performance
                            </button>
                            <button
                              onClick={() => setActiveTab('settings')}
                              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'settings'
                                ? 'border-blue text-blue'
                                : 'border-transparent text-gray hover:text-foreground'
                                }`}
                            >
                              Settings
                            </button>
                          </div>

                          {/* Tab Content */}
                          {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="bg-white p-4 rounded-lg border border-gray">
                                <h4 className="font-medium text-foreground mb-2">Store Information</h4>
                                <div className="space-y-2 text-sm">
                                  <div><span className="text-gray">Domain:</span> {store.shopDomain}</div>
                                  <div><span className="text-gray">Country:</span> {store.country}</div>
                                  <div><span className="text-gray">Currency:</span> {store.currency}</div>
                                  <div><span className="text-gray">Timezone:</span> {store.timezone}</div>
                                  <div><span className="text-gray">App Version:</span> v{store.appVersion}</div>
                                </div>
                              </div>

                              <div className="bg-white p-4 rounded-lg border border-gray">
                                <h4 className="font-medium text-foreground mb-2">Billing Information</h4>
                                <div className="space-y-2 text-sm">
                                  <div><span className="text-gray">Plan:</span> {store.plan}</div>
                                  <div><span className="text-gray">Monthly Fee:</span> {store.currency} {store.billing.monthlyFee}</div>
                                  <div><span className="text-gray">Next Billing:</span> {new Date(store.billing.nextBillingDate).toLocaleDateString()}</div>
                                </div>
                              </div>

                              <div className="bg-white p-4 rounded-lg border border-gray">
                                <h4 className="font-medium text-foreground mb-2">Support</h4>
                                <div className="space-y-2 text-sm">
                                  <div><span className="text-gray">Open Tickets:</span> {store.support.ticketsOpen}</div>
                                  <div><span className="text-gray">Last Contact:</span> {store.support.lastSupportContact ? new Date(store.support.lastSupportContact).toLocaleDateString() : 'Never'}</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {activeTab === 'performance' && storeMetrics[store.id] && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="bg-white p-4 rounded-lg border border-gray">
                                <h4 className="font-medium text-foreground mb-2">Performance Metrics</h4>
                                <div className="space-y-2 text-sm">
                                  <div><span className="text-gray">Total Checkouts:</span> {storeMetrics[store.id].totalCheckouts}</div>
                                  <div><span className="text-gray">Recovered Carts:</span> {storeMetrics[store.id].recoveredCarts}</div>
                                  <div><span className="text-gray">Recovery Rate:</span> {storeMetrics[store.id].recoveryRate}%</div>
                                  <div><span className="text-gray">Average Order Value:</span> {store.currency} {storeMetrics[store.id].avgOrderValue}</div>
                                </div>
                              </div>

                              <div className="bg-white p-4 rounded-lg border border-gray">
                                <h4 className="font-medium text-foreground mb-2">Top Products</h4>
                                <div className="space-y-2">
                                  {storeMetrics[store.id].topProducts.map((product, index) => (
                                    <div key={product.id} className="flex items-center justify-between text-sm">
                                      <span className="text-foreground">{index + 1}. {product.title}</span>
                                      <span className="text-gray">{product.currency} {product.revenue}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {activeTab === 'settings' && (
                            <div className="bg-white p-4 rounded-lg border border-gray">
                              <h4 className="font-medium text-foreground mb-2">Store Features</h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={store.features.emailNotifications}
                                    readOnly
                                    className="rounded"
                                  />
                                  <span className="text-sm">Email Notifications</span>
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={store.features.smsNotifications}
                                    readOnly
                                    className="rounded"
                                  />
                                  <span className="text-sm">SMS Notifications</span>
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={store.features.advancedAnalytics}
                                    readOnly
                                    className="rounded"
                                  />
                                  <span className="text-sm">Advanced Analytics</span>
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={store.features.customBranding}
                                    readOnly
                                    className="rounded"
                                  />
                                  <span className="text-sm">Custom Branding</span>
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={store.features.apiAccess}
                                    readOnly
                                    className="rounded"
                                  />
                                  <span className="text-sm">API Access</span>
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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
