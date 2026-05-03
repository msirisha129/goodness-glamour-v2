import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, Phone, Mail, User, ArrowLeft, RefreshCw } from "lucide-react";

export default function MyBookingsPage() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Mock data for user bookings - in real implementation, this would fetch from API
  const { data: bookings, refetch, isLoading } = useQuery({
    queryKey: ["/api/user/bookings"],
    queryFn: async () => {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/user/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }
      
      return response.json();
    },
    enabled: !!user,
    retry: false,
    refetchInterval: 5000, // Refetch every 5 seconds to get updates
  });

  // Subscribe to realtime booking updates
  useEffect(() => {
    if (!user) return;
    
    const es = new EventSource(`/api/events`);
    es.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data || '{}');
        if (data?.type === 'booking_updated' || data?.type === 'booking_deleted') {
          refetch();
        }
      } catch (_e) {}
    };
    return () => {
      es.close();
    };
  }, [user, refetch]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setLocation("/login");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-[#A8C9A5] text-white";
      case "pending":
        return "bg-[#C9A58B] text-white";
      case "completed":
        return "bg-[#D4BEB8] text-[#6B5D52]";
      case "cancelled":
        return "bg-[#B89D8F] text-white";
      default:
        return "bg-[#A39689] text-white";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-black">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F5F0]">
      {/* Hero Section */}
      <section className="pt-16 bg-gradient-to-br from-[#F5F0E8] via-[#E8DDD0] to-[#DFD3C3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-[#6B5D52] mb-3">
              My Bookings
            </h1>
            <p className="text-lg text-[#A39689] max-w-2xl mx-auto">
              Manage your appointments and track your beauty services
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="text-[#8B7D6B] hover:text-[#C9A58B] hover:bg-[#C9A58B]/10 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-4xl font-serif font-bold text-[#6B5D52]">
                My Profile
              </h1>
              <p className="text-[#A39689] font-medium">
                Manage your account information and preferences
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => {
              refetch();
              toast({
                title: "Bookings Refreshed",
                description: "Your booking list has been updated.",
              });
            }}
            variant="outline"
            size="sm"
            className="border-2 border-[#C9A58B] text-[#C9A58B] hover:bg-[#C9A58B] hover:text-white transition-all duration-300"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Profile Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Card className="bg-white shadow-xl border border-[#E8DDD0] rounded-2xl">
            <CardHeader>
              <CardTitle className="text-[#6B5D52] font-serif text-2xl font-bold">
                My Profile
                <div className="w-16 h-0.5 bg-[#C9A58B] mt-2 rounded-full"></div>
              </CardTitle>
              <CardDescription className="text-[#A39689]">Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-10">
              <div className="flex justify-center">
                <div className="w-28 h-28 bg-[#8B7D6B] rounded-full flex items-center justify-center shadow-xl">
                  <User className="h-14 w-14 text-white" />
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-serif font-bold text-[#6B5D52] mb-2">
                  {user.name || "User"}
                </h3>
                <p className="text-[#8B7D6B]">{user.email}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[#8B7D6B]">
                  <Mail className="h-5 w-5 text-[#C9A58B]" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3 text-[#8B7D6B]">
                    <Phone className="h-5 w-5 text-[#C9A58B]" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-[#8B7D6B]">
                  <MapPin className="h-5 w-5 text-[#C9A58B]" />
                  <span>Doorstep Service Area</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#FAF7F2] border-l-4 border-l-[#C9A58B] rounded-2xl shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-[#6B5D52] font-serif text-2xl font-bold">Account Information</CardTitle>
                <CardDescription className="text-[#A39689]">Manage your personal details</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-2 border-[#C9A58B] text-[#C9A58B] hover:bg-[#C9A58B] hover:text-white transition-all duration-300"
              >
                Edit Profile
              </Button>
            </CardHeader>
            <CardContent className="space-y-8 p-10">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#8B7D6B] font-semibold text-sm uppercase tracking-wide">Full Name</label>
                    <p className="text-[#6B5D52] font-semibold mt-1 break-words">{user.name}</p>
                  </div>
                  <div>
                    <label className="text-[#8B7D6B] font-semibold text-sm uppercase tracking-wide">Phone Number</label>
                    <p className="text-[#6B5D52] font-semibold mt-1 break-words">{user.phone || "Not provided"}</p>
                  </div>
                </div>
                
                <div className="w-full">
                  <label className="text-[#8B7D6B] font-semibold text-sm uppercase tracking-wide">Email Address</label>
                  <div className="mt-1 p-3 bg-white rounded-lg border border-[#E8DDD0]">
                    <p className="text-[#6B5D52] font-semibold break-all text-sm leading-relaxed overflow-hidden">{user.email}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-[#8B7D6B] font-semibold text-sm uppercase tracking-wide">Address</label>
                  <p className="text-[#6B5D52] font-semibold mt-1 break-words">Doorstep Service</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8DDD0]">
                <h4 className="text-[#8B7D6B] font-semibold text-sm uppercase tracking-wide mb-3">Account Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#8B7D6B]">Member since:</span>
                    <span className="text-[#6B5D52] font-semibold">October 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B7D6B]">Account type:</span>
                    <span className="text-[#6B5D52] font-semibold">Premium Customer</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full border-2 border-[#8B7D6B] text-[#8B7D6B] hover:bg-[#8B7D6B] hover:text-white transition-all duration-300 py-3 rounded-lg"
                >
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Bookings Section */}
        <Card className="bg-white shadow-xl border border-[#E8DDD0] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-[#6B5D52] font-serif text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6 text-[#C9A58B]" />
              My Bookings
            </CardTitle>
            <CardDescription className="text-[#A39689]">
              View and manage your salon appointments
            </CardDescription>
          </CardHeader>
          <CardContent className="p-10">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-[#A39689]">Loading your bookings...</p>
              </div>
            ) : bookings && bookings.length > 0 ? (
              <div className="space-y-8">
                {bookings.map((booking: any, index: number) => (
                  <div
                    key={index}
                    className="p-8 bg-white border-2 border-[#E8DDD0] rounded-xl hover:border-[#C9A58B] hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-[#C9A58B]" />
                        <div>
                          <h3 className="text-lg font-semibold text-[#6B5D52]">
                            {booking.services || "Hair Cut & Styling, Bridal & Party Hair Styling"}
                          </h3>
                          <p className="text-sm text-[#8B7D6B]">
                            {formatDate(booking.appointmentDate)}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(booking.status)} px-4 py-1 rounded-full font-semibold text-sm`}>
                        {booking.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                      <div className="flex items-center gap-2 text-[#8B7D6B]">
                        <Clock className="h-4 w-4 text-[#C9A58B]" />
                        <span>{formatTime(booking.appointmentDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#8B7D6B]">
                        <MapPin className="h-4 w-4 text-[#C9A58B]" />
                        <span>Your Home</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-[#6B5D52]">
                          ₹{booking.totalAmount || "TBD"}
                        </p>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mt-4 p-3 bg-[#FAF7F2] rounded-lg border border-[#E8DDD0]">
                        <p className="text-sm text-[#8B7D6B]">
                          <strong className="text-[#6B5D52]">Notes:</strong> {booking.notes}
                        </p>
                      </div>
                    )}

                    {booking.status === "pending" && (
                      <div className="mt-4 flex gap-3">
                        <Button
                          size="sm"
                          className="bg-[#8B7D6B] hover:bg-[#9D8E7C] text-white px-6 py-2 rounded-lg transition-all duration-300"
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-2 border-[#B89D8F] text-[#8B7D6B] hover:bg-[#B89D8F] hover:text-white px-6 py-2 rounded-lg transition-all duration-300"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-[#C9A58B] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#6B5D52] mb-2">No Bookings Yet</h3>
                <p className="text-[#A39689] mb-6">
                  You haven't made any appointments yet. Book your first salon service!
                </p>
                <Button
                  onClick={() => setLocation("/booking")}
                  className="bg-[#C9A58B] hover:bg-[#B89479] text-white px-8 py-3 rounded-lg transition-all duration-300"
                >
                  Book Your First Appointment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <section className="py-16 bg-gradient-to-br from-[#F5F0E8] via-[#E8DDD0] to-[#DFD3C3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold text-[#6B5D52] mb-4">
            Your Beauty Journey Awaits
          </h2>
          <p className="text-lg text-[#A39689] mb-8 max-w-2xl mx-auto">
            Manage your appointments, track your beauty services, and enjoy our premium doorstep salon experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setLocation("/booking")}
              className="bg-[#8B7D6B] hover:bg-[#9D8E7C] text-white px-8 py-3 rounded-lg transition-all duration-300"
            >
              Book New Appointment
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-2 border-[#8B7D6B] text-[#8B7D6B] hover:bg-[#8B7D6B] hover:text-white transition-all duration-300"
            >
              <a href="tel:9036626642">
                <Phone className="h-4 w-4 mr-2" />
                Call Us: 9036626642
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
