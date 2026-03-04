import { useState } from "react";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";
import { useNavigate } from "react-router-dom";

export default function WorkingLoginPage() {
  const { login, user, isLoading } = useSimpleAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    const success = await login(email, password);

    if (!success) {
      alert("Invalid email or password. Please try again.");
    } else {
      const targetRole = email.includes('admin') ? 'PLATFORM_ADMIN' : 'SALES_REP';
      navigate(targetRole === "PLATFORM_ADMIN" ? "/portal/admin" : "/portal/rep");
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
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            Demo emails for testing:
          </p>
          <p className="mt-2 text-xs text-gray-800 text-center">
            Admin: <span className="font-mono">admin@reboundcart.com</span>
          </p>
          <p className="text-xs text-gray-800 text-center">
            Sales Rep: <span className="font-mono">james@sales.com</span>
          </p>
          <p className="mt-2 text-[11px] text-gray-500 text-center">
            Any password will work for these demo accounts.
          </p>
        </div>
      </div>
    </div>
  );
}
