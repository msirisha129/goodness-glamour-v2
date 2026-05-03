import { useState } from "react";
import { useLocation } from "wouter";
import { Mail, Lock, User, Phone, UserPlus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import GoogleAuth from "@/components/GoogleAuth";
import { storeAuthData } from "@/utils/auth";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      // Store userId for OTP verification
      localStorage.setItem("pendingUserId", data.userId);
      localStorage.setItem("pendingUserEmail", data.email);

      toast({
        title: "Account created!",
        description: "Please check your email for the verification code.",
      });

      // Redirect to OTP verification
      setLocation("/verify-otp");
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = (user: any) => {
    toast({
      title: "Welcome!",
      description: "Your account has been created successfully.",
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

  const handleAdminLogin = () => {
    // Redirect to login page
    setLocation("/login?admin=true");
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-[#fafafa] via-[#f8f6f0] to-[#f5f0e8]">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl border border-[#d4af37]/20">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#d4af37] to-[#c9a869] rounded-full flex items-center justify-center">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-serif text-[#2c1810]">
              Create Account
            </CardTitle>
            <CardDescription className="text-[#666]">
              Sign up to start booking your beauty services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-[#2c1810]">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#999]" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

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
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
                <p className="text-xs text-[#666]">Must be at least 6 characters</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-[#2c1810]">
                  Phone Number <span className="text-[#999]">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#999]" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full btn-primary"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
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
              <span className="text-[#666]">Already have an account? </span>
              <button
                onClick={() => setLocation("/login")}
                className="text-[#d4af37] hover:text-[#c9a869] font-medium"
              >
                Sign in
              </button>
            </div>

            <div className="relative pt-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#d4af37]/30" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-[#999]">Admin Access</span>
              </div>
            </div>

            <Button
              onClick={handleAdminLogin}
              variant="outline"
              className="w-full border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-white"
            >
              <Shield className="h-4 w-4 mr-2" />
              Login as Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

