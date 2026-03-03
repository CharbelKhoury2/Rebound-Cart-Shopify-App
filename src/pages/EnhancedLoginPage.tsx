import { useState } from "react";
import { useTabAuth } from "@/contexts/TabAuthContext";
import { Eye, EyeOff, Users, Globe, Shield, ArrowRight } from "lucide-react";

export default function EnhancedLoginPage() {
  const { login, tabId, isLoading } = useTabAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show loading while tab ID is being generated
  if (isLoading || !tabId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue to-purple flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Initializing session...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const success = login(email, password);
      if (!success) {
        alert("Invalid credentials. Try admin@reboundcart.com or any sales rep email.");
      }
      setIsSubmitting(false);
    }, 500);
  };

  const quickLogin = (email: string) => {
    setEmail(email);
    setPassword("password123");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue to-purple flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Tab Info */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 mb-6 border border-white/20">
          <div className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Tab ID: {tabId.slice(-8)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Isolated Session</span>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue to-purple p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Rebound Cart</h1>
            <p className="text-white/80">Multi-Tab Admin Dashboard</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-transparent pr-12"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue to-purple text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Login Options */}
            <div className="mt-8 pt-6 border-t border-gray">
              <p className="text-sm text-gray text-center mb-4">Quick Login (Demo Accounts)</p>
              
              <div className="space-y-2">
                <button
                  onClick={() => quickLogin("admin@reboundcart.com")}
                  className="w-full text-left px-4 py-3 bg-gray/50 rounded-lg hover:bg-gray/100 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray">Admin User</div>
                      <div className="text-sm text-gray">admin@reboundcart.com</div>
                    </div>
                    <div className="px-2 py-1 bg-purple text-white text-xs rounded-full">ADMIN</div>
                  </div>
                </button>

                <button
                  onClick={() => quickLogin("james@sales.com")}
                  className="w-full text-left px-4 py-3 bg-gray/50 rounded-lg hover:bg-gray/100 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray">Sales Rep</div>
                      <div className="text-sm text-gray">james@sales.com</div>
                    </div>
                    <div className="px-2 py-1 bg-blue text-white text-xs rounded-full">REP</div>
                  </div>
                </button>

                <button
                  onClick={() => quickLogin("maria@sales.com")}
                  className="w-full text-left px-4 py-3 bg-gray/50 rounded-lg hover:bg-gray/100 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray">Sales Rep</div>
                      <div className="text-sm text-gray">maria@sales.com</div>
                    </div>
                    <div className="px-2 py-1 bg-blue text-white text-xs rounded-full">REP</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Multi-Tab Info */}
            <div className="mt-6 p-4 bg-blue/10 rounded-lg">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-blue mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue mb-1">Multi-Tab Testing</p>
                  <p className="text-blue/80">
                    Each tab maintains its own login session. Open multiple tabs to test different user roles simultaneously.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
