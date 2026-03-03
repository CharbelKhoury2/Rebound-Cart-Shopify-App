import { useState } from "react";
import { useTabAuth } from "@/contexts/TabAuthContext";

export default function SimpleLoginPage() {
  const { login, tabId, isLoading } = useTabAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 Login attempt:', { email, password, tabId, isLoading });
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      alert("Please enter both email and password.");
      return;
    }
    
    if (!tabId) {
      console.log('❌ Tab ID not ready yet');
      alert("Session not ready. Please wait a moment and try again.");
      return;
    }
    
    const success = login(email, password);
    console.log('🔐 Login result:', success);
    
    if (!success) {
      console.log('❌ Login failed for email:', email);
      alert("Invalid credentials. Try admin@reboundcart.com or any sales rep email.");
    } else {
      console.log('✅ Login successful, should redirect...');
    }
  };

  const quickLogin = (userEmail: string) => {
    console.log('⚡ Quick login initiated:', userEmail);
    setEmail(userEmail);
    setPassword("password123");
    
    // Try immediate login
    setTimeout(() => {
      console.log('⚡ Executing quick login:', userEmail);
      if (!tabId) {
        console.log('❌ Tab ID not ready for quick login');
        alert("Session not ready. Please wait a moment and try again.");
        return;
      }
      
      const success = login(userEmail, "password123");
      console.log('⚡ Quick login result:', success);
      
      if (!success) {
        console.log('❌ Quick login failed for:', userEmail);
        alert("Quick login failed. Please try manual login.");
      } else {
        console.log('✅ Quick login successful, should redirect...');
      }
    }, 200); // Increased delay to ensure tabId is ready
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Rebound Cart</h1>
          <p className="text-gray-600">Multi-Tab Admin Dashboard</p>
          {tabId && (
            <p className="text-xs text-gray-500 mt-2">Tab: {tabId.slice(-8)}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center mb-4">Quick Login:</p>
          
          <div className="space-y-2">
            <button
              onClick={() => quickLogin("admin@reboundcart.com")}
              className="w-full text-left px-3 py-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm">Admin User</span>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">ADMIN</span>
              </div>
            </button>

            <button
              onClick={() => quickLogin("james@sales.com")}
              className="w-full text-left px-3 py-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm">Sales Rep</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">REP</span>
              </div>
            </button>

            <button
              onClick={() => quickLogin("maria@sales.com")}
              className="w-full text-left px-3 py-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm">Sales Rep</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">REP</span>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            💡 Each tab maintains its own login session. Open multiple tabs to test different user roles simultaneously.
          </p>
        </div>
      </div>
    </div>
  );
}
