import { useState } from "react";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";

export default function WorkingLoginPage() {
  const { login, user, isLoading } = useSimpleAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Debug: Show current state
  console.log('🔍 WorkingLoginPage state:', { user: user?.email, isLoading, email, password });

  const clearSession = () => {
    sessionStorage.clear();
    window.location.reload();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 WorkingLoginPage login attempt:', { email, password, isLoading });
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      alert("Please enter both email and password.");
      return;
    }
    
    const success = login(email, password);
    console.log('🔐 WorkingLoginPage login result:', success);
    
    if (!success) {
      console.log('❌ Login failed for email:', email);
      alert("Invalid credentials. Try admin@reboundcart.com or any sales rep email.");
    } else {
      console.log('✅ Login successful, should redirect automatically...');
      // Force a page reload to trigger navigation
      setTimeout(() => {
        window.location.href = email === "admin@reboundcart.com" ? "/portal/admin" : "/portal/rep";
      }, 100);
    }
  };

  const quickLogin = (userEmail: string) => {
    console.log('⚡ Quick login initiated:', userEmail);
    setEmail(userEmail);
    setPassword("password123");
    
    // Immediate login
    const success = login(userEmail, "password123");
    console.log('⚡ Quick login result:', success);
    
    if (!success) {
      console.log('❌ Quick login failed for:', userEmail);
      alert("Quick login failed. Please try manual login.");
    } else {
      console.log('✅ Quick login successful, forcing redirect...');
      // Force a page reload to trigger navigation
      setTimeout(() => {
        window.location.href = userEmail === "admin@reboundcart.com" ? "/portal/admin" : "/portal/rep";
      }, 100);
    }
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
          <p className="text-gray-600">Admin Dashboard Login</p>
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

        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <p className="text-xs text-green-800 mb-2">
            ✅ Working login system with simple authentication. Click quick login buttons for instant access.
          </p>
          
          {/* Debug Info */}
          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
            <p className="font-mono">Debug Info:</p>
            <p className="font-mono">User: {user?.email || 'null'}</p>
            <p className="font-mono">Loading: {isLoading ? 'Yes' : 'No'}</p>
            <p className="font-mono">Email: {email || 'empty'}</p>
            <p className="font-mono">Password: {password ? '***' : 'empty'}</p>
          </div>

          {/* Clear Session Button */}
          <div className="mt-3">
            <button
              onClick={clearSession}
              className="w-full text-xs bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors"
            >
              🧹 Clear Session & Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
