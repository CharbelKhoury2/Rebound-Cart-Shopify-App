// Connection test utility for debugging
export const testConnection = async () => {
  console.log('🔍 Testing dashboard connections...');
  
  // Test environment variables
  const shopifyUrl = import.meta.env.VITE_SHOPIFY_APP_URL;
  const dashboardUrl = import.meta.env.VITE_DASHBOARD_URL;
  const wsUrl = import.meta.env.VITE_WS_URL;
  
  console.log('📋 Environment Variables:');
  console.log('  VITE_SHOPIFY_APP_URL:', shopifyUrl);
  console.log('  VITE_DASHBOARD_URL:', dashboardUrl);
  console.log('  VITE_WS_URL:', wsUrl);
  
  // Test API connectivity
  if (shopifyUrl) {
    try {
      console.log('🌐 Testing API connection...');
      const response = await fetch(`${shopifyUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API connection successful:', data);
      } else {
        console.log('❌ API connection failed:', response.status);
      }
    } catch (error) {
      console.log('❌ API connection error:', error);
    }
  }
  
  // Test WebSocket connection
  if (wsUrl) {
    try {
      console.log('🔌 Testing WebSocket connection...');
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('✅ WebSocket connection successful!');
        ws.close();
      };
      
      ws.onerror = (error) => {
        console.log('❌ WebSocket connection failed:', error);
      };
      
      ws.onclose = () => {
        console.log('🔌 WebSocket test completed');
      };
      
      // Close after 5 seconds if no connection
      setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.close();
          console.log('⏰ WebSocket connection timeout');
        }
      }, 5000);
      
    } catch (error) {
      console.log('❌ WebSocket test error:', error);
    }
  }
  
  // Test dashboard URL
  if (dashboardUrl) {
    console.log('🖥️ Dashboard URL:', dashboardUrl);
    console.log('📝 Add this to your Shopify app CORS:');
    console.log(`  Access-Control-Allow-Origin: ${dashboardUrl}`);
  }
  
  return {
    shopifyUrl,
    dashboardUrl,
    wsUrl,
    hasRequiredVars: !!(shopifyUrl && wsUrl)
  };
};

// Run test in browser console
export const runConnectionTest = () => {
  console.log('🚀 Running connection test...');
  console.log('Copy and paste this in browser console:');
  console.log('testConnection();');
};
