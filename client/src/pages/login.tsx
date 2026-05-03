import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Mail, Lock, LogIn, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { storeAuthData } from "@/utils/auth";
import GoogleAuth from "@/components/GoogleAuth";

export default function Login() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isAdminLogin = location.includes("admin=true") || new URLSearchParams(window.location.search).get("admin") === "true";
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    // If admin login, pre-fill with admin email hint
    if (isAdminLogin) {
      setFormData(prev => ({ ...prev, email: "2akonsultant@gmail.com" }));
    }
  }, [isAdminLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store auth data
      storeAuthData(data.token, data.user);

      toast({
        title: isAdminLogin ? "Welcome Admin!" : "Welcome back!",
        description: isAdminLogin ? "You have been successfully logged in as admin." : "You have been successfully logged in.",
      });

      // Redirect based on user role
      if (data.user.role === "admin") {
        setLocation("/admin-dashboard");
      } else {
        setLocation("/");
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = (user: any) => {
    toast({
      title: "Welcome!",
      description: "You have been successfully logged in.",
    });
    setLocation("/");
  };

  const handleGoogleError = (error: string) => {
    toast({
      title: "Authentication failed",
      description: error,
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-[#fafafa] via-[#f8f6f0] to-[#f5f0e8]">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl border border-[#d4af37]/20">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#d4af37] to-[#c9a869] rounded-full flex items-center justify-center">
              {isAdminLogin ? <Shield className="h-8 w-8 text-white" /> : <LogIn className="h-8 w-8 text-white" />}
            </div>
            <CardTitle className="text-3xl font-serif text-[#2c1810]">
              {isAdminLogin ? "Admin Login" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-[#666]">
              {isAdminLogin ? "Sign in with your admin credentials" : "Sign in to your account to continue"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-[#2c1810]">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#999]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-[#2c1810]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#999]" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full btn-primary"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#d4af37]/30" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-[#999]">Or continue with</span>
              </div>
            </div>

            <GoogleAuth
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              className="w-full"
            />

            <div className="text-center text-sm">
              <span className="text-[#666]">Don't have an account? </span>
              <button
                onClick={() => setLocation("/signup")}
                className="text-[#d4af37] hover:text-[#c9a869] font-medium"
              >
                Sign up
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

