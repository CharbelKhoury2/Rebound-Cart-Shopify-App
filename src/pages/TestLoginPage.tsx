import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TestLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🧪 Test login attempt:', { email, password });
    
    // Simple mock login - just check if email is provided
    if (email && password) {
      console.log('🧪 Test login successful');
      
      // Store in sessionStorage for this test
      const mockUser = {
        id: email === "admin@reboundcart.com" ? "u1" : "u2",
        email: email,
        firstName: email === "admin@reboundcart.com" ? "Sarah" : "James",
        lastName: email === "admin@reboundcart.com" ? "Chen" : "Wilson",
        role: email === "admin@reboundcart.com" ? "PLATFORM_ADMIN" : "SALES_REP",
        status: "ACTIVE" as const,
        tier: "PLATINUM" as const,
        createdAt: "2025-01-15"
      };
      
      sessionStorage.setItem('test_user', JSON.stringify(mockUser));
      console.log('🧪 User stored, navigating to dashboard...');
      
      // Navigate based on role
      if (email === "admin@reboundcart.com") {
        navigate("/portal/admin");
      } else {
        navigate("/portal/rep");
      }
    } else {
      console.log('🧪 Test login failed - missing fields');
      alert("Please enter email and password");
    }
  };

  const quickLogin = (userEmail: string, isAdmin: boolean) => {
    setEmail(userEmail);
    setPassword("test123");
    
    const mockUser = {
      id: isAdmin ? "u1" : "u2",
      email: userEmail,
      firstName: isAdmin ? "Sarah" : "James",
      lastName: isAdmin ? "Chen" : "Wilson",
      role: isAdmin ? "PLATFORM_ADMIN" : "SALES_REP",
      status: "ACTIVE" as const,
      tier: "PLATINUM" as const,
      createdAt: "2025-01-15"
    };
    
    sessionStorage.setItem('test_user', JSON.stringify(mockUser));
    console.log('🧪 Quick login successful for:', userEmail);
    
    // Navigate based on role
    if (isAdmin) {
      navigate("/portal/admin");
    } else {
      navigate("/portal/rep");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Test Login</h1>
          <p className="text-gray-600">Simple test login page</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
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
            Sign In (Test)
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center mb-4">Quick Login (Test):</p>
          
          <div className="space-y-2">
            <button
              onClick={() => quickLogin("admin@reboundcart.com", true)}
              className="w-full text-left px-3 py-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm">Admin User</span>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">ADMIN</span>
              </div>
            </button>

            <button
              onClick={() => quickLogin("james@sales.com", false)}
              className="w-full text-left px-3 py-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm">Sales Rep</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">REP</span>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-xs text-yellow-800">
            🧪 This is a test login page that bypasses the complex authentication. Use this to test if the issue is with the login system or routing.
          </p>
        </div>
      </div>
    </div>
  );
}
