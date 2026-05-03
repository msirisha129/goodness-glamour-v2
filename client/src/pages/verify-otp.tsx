import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Mail, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { storeAuthData } from "@/utils/auth";

export default function VerifyOTP() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const pendingUserId = localStorage.getItem("pendingUserId");
    const pendingEmail = localStorage.getItem("pendingUserEmail");

    if (!pendingUserId || !pendingEmail) {
      toast({
        title: "No verification pending",
        description: "Please sign up first.",
        variant: "destructive",
      });
      setLocation("/signup");
      return;
    }

    setUserId(pendingUserId);
    setEmail(pendingEmail);
  }, [setLocation, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast({
        title: "Error",
        description: "User ID not found. Please sign up again.",
        variant: "destructive",
      });
      setLocation("/signup");
      return;
    }

    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      // Store auth data
      storeAuthData(data.token, data.user);

      // Clear pending data
      localStorage.removeItem("pendingUserId");
      localStorage.removeItem("pendingUserEmail");

      toast({
        title: "Email verified!",
        description: "Your account has been verified successfully.",
      });

      // Redirect to home
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Please check the code and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!userId) return;

    setIsResending(true);

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend OTP");
      }

      toast({
        title: "Code sent!",
        description: "A new verification code has been sent to your email.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to resend",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
  };

  if (!userId || !email) {
    return null;
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-[#fafafa] via-[#f8f6f0] to-[#f5f0e8]">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl border border-[#d4af37]/20">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#d4af37] to-[#c9a869] rounded-full flex items-center justify-center">
              <KeyRound className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-serif text-[#2c1810]">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-[#666]">
              We've sent a 6-digit code to
            </CardDescription>
            <div className="flex items-center justify-center gap-2 text-[#2c1810]">
              <Mail className="h-4 w-4" />
              <span className="font-medium">{email}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="otp" className="text-sm font-medium text-[#2c1810]">
                  Verification Code
                </label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={handleOtpChange}
                  className="text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-[#666] text-center">
                  Enter the 6-digit code from your email
                </p>
              </div>

              <Button
                type="submit"
                className="w-full btn-primary"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <p className="text-sm text-[#666]">
                Didn't receive the code?
              </p>
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendOTP}
                disabled={isResending}
                className="text-[#d4af37] hover:text-[#c9a869]"
              >
                {isResending ? "Sending..." : "Resend Code"}
              </Button>
            </div>

            <div className="text-center text-sm">
              <button
                onClick={() => setLocation("/signup")}
                className="text-[#d4af37] hover:text-[#c9a869] font-medium"
              >
                Back to Sign Up
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




