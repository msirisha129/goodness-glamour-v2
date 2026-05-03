import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const [user, setUser] = useState(null);
    const { toast } = useToast();
    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                setUser(JSON.parse(userStr));
            }
            catch (error) {
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
    });
    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        setLocation("/login");
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };
    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };
    const getStatusColor = (status) => {
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
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "text-center", children: _jsx("p", { className: "text-black", children: "Loading..." }) }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-[#F9F5F0]", children: [_jsx("section", { className: "pt-16 bg-gradient-to-br from-[#F5F0E8] via-[#E8DDD0] to-[#DFD3C3]", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-4xl lg:text-5xl font-serif font-bold text-[#6B5D52] mb-3", children: "My Bookings" }), _jsx("p", { className: "text-lg text-[#A39689] max-w-2xl mx-auto", children: "Manage your appointments and track your beauty services" })] }) }) }), _jsxs("div", { className: "max-w-6xl mx-auto px-8 py-8 space-y-8", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Button, { variant: "ghost", onClick: () => setLocation("/"), className: "text-[#8B7D6B] hover:text-[#C9A58B] hover:bg-[#C9A58B]/10 transition-all duration-300", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back to Home"] }), _jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-serif font-bold text-[#6B5D52]", children: "My Profile" }), _jsx("p", { className: "text-[#A39689] font-medium", children: "Manage your account information and preferences" })] })] }), _jsxs(Button, { onClick: () => {
                                    refetch();
                                    toast({
                                        title: "Bookings Refreshed",
                                        description: "Your booking list has been updated.",
                                    });
                                }, variant: "outline", size: "sm", className: "border-2 border-[#C9A58B] text-[#C9A58B] hover:bg-[#C9A58B] hover:text-white transition-all duration-300", children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Refresh"] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-12", children: [_jsxs(Card, { className: "bg-white shadow-xl border border-[#E8DDD0] rounded-2xl", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-[#6B5D52] font-serif text-2xl font-bold", children: ["My Profile", _jsx("div", { className: "w-16 h-0.5 bg-[#C9A58B] mt-2 rounded-full" })] }), _jsx(CardDescription, { className: "text-[#A39689]", children: "Your account information" })] }), _jsxs(CardContent, { className: "space-y-8 p-10", children: [_jsx("div", { className: "flex justify-center", children: _jsx("div", { className: "w-28 h-28 bg-[#8B7D6B] rounded-full flex items-center justify-center shadow-xl", children: _jsx(User, { className: "h-14 w-14 text-white" }) }) }), _jsxs("div", { className: "text-center", children: [_jsx("h3", { className: "text-2xl font-serif font-bold text-[#6B5D52] mb-2", children: user.name || "User" }), _jsx("p", { className: "text-[#8B7D6B]", children: user.email })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3 text-[#8B7D6B]", children: [_jsx(Mail, { className: "h-5 w-5 text-[#C9A58B]" }), _jsx("span", { children: user.email })] }), user.phone && (_jsxs("div", { className: "flex items-center gap-3 text-[#8B7D6B]", children: [_jsx(Phone, { className: "h-5 w-5 text-[#C9A58B]" }), _jsx("span", { children: user.phone })] })), _jsxs("div", { className: "flex items-center gap-3 text-[#8B7D6B]", children: [_jsx(MapPin, { className: "h-5 w-5 text-[#C9A58B]" }), _jsx("span", { children: "Doorstep Service Area" })] })] })] })] }), _jsxs(Card, { className: "bg-[#FAF7F2] border-l-4 border-l-[#C9A58B] rounded-2xl shadow-xl", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-[#6B5D52] font-serif text-2xl font-bold", children: "Account Information" }), _jsx(CardDescription, { className: "text-[#A39689]", children: "Manage your personal details" })] }), _jsx(Button, { variant: "outline", size: "sm", className: "border-2 border-[#C9A58B] text-[#C9A58B] hover:bg-[#C9A58B] hover:text-white transition-all duration-300", children: "Edit Profile" })] }), _jsxs(CardContent, { className: "space-y-8 p-10", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-[#8B7D6B] font-semibold text-sm uppercase tracking-wide", children: "Full Name" }), _jsx("p", { className: "text-[#6B5D52] font-semibold mt-1 break-words", children: user.name })] }), _jsxs("div", { children: [_jsx("label", { className: "text-[#8B7D6B] font-semibold text-sm uppercase tracking-wide", children: "Phone Number" }), _jsx("p", { className: "text-[#6B5D52] font-semibold mt-1 break-words", children: user.phone || "Not provided" })] })] }), _jsxs("div", { className: "w-full", children: [_jsx("label", { className: "text-[#8B7D6B] font-semibold text-sm uppercase tracking-wide", children: "Email Address" }), _jsx("div", { className: "mt-1 p-3 bg-white rounded-lg border border-[#E8DDD0]", children: _jsx("p", { className: "text-[#6B5D52] font-semibold break-all text-sm leading-relaxed overflow-hidden", children: user.email }) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-[#8B7D6B] font-semibold text-sm uppercase tracking-wide", children: "Address" }), _jsx("p", { className: "text-[#6B5D52] font-semibold mt-1 break-words", children: "Doorstep Service" })] })] }), _jsxs("div", { className: "pt-4 border-t border-[#E8DDD0]", children: [_jsx("h4", { className: "text-[#8B7D6B] font-semibold text-sm uppercase tracking-wide mb-3", children: "Account Information" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-[#8B7D6B]", children: "Member since:" }), _jsx("span", { className: "text-[#6B5D52] font-semibold", children: "October 2024" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-[#8B7D6B]", children: "Account type:" }), _jsx("span", { className: "text-[#6B5D52] font-semibold", children: "Premium Customer" })] })] })] }), _jsx("div", { className: "pt-4", children: _jsx(Button, { onClick: handleLogout, variant: "outline", className: "w-full border-2 border-[#8B7D6B] text-[#8B7D6B] hover:bg-[#8B7D6B] hover:text-white transition-all duration-300 py-3 rounded-lg", children: "Sign Out" }) })] })] })] }), _jsxs(Card, { className: "bg-white shadow-xl border border-[#E8DDD0] rounded-2xl", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-[#6B5D52] font-serif text-2xl font-bold flex items-center gap-2", children: [_jsx(Calendar, { className: "h-6 w-6 text-[#C9A58B]" }), "My Bookings"] }), _jsx(CardDescription, { className: "text-[#A39689]", children: "View and manage your salon appointments" })] }), _jsx(CardContent, { className: "p-10", children: isLoading ? (_jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-[#A39689]", children: "Loading your bookings..." }) })) : bookings && bookings.length > 0 ? (_jsx("div", { className: "space-y-8", children: bookings.map((booking, index) => (_jsxs("div", { className: "p-8 bg-white border-2 border-[#E8DDD0] rounded-xl hover:border-[#C9A58B] hover:shadow-lg transition-all duration-300", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Calendar, { className: "h-5 w-5 text-[#C9A58B]" }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-[#6B5D52]", children: booking.services || "Hair Cut & Styling, Bridal & Party Hair Styling" }), _jsx("p", { className: "text-sm text-[#8B7D6B]", children: formatDate(booking.appointmentDate) })] })] }), _jsx(Badge, { className: `${getStatusColor(booking.status)} px-4 py-1 rounded-full font-semibold text-sm`, children: booking.status })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-[#8B7D6B]", children: [_jsx(Clock, { className: "h-4 w-4 text-[#C9A58B]" }), _jsx("span", { children: formatTime(booking.appointmentDate) })] }), _jsxs("div", { className: "flex items-center gap-2 text-[#8B7D6B]", children: [_jsx(MapPin, { className: "h-4 w-4 text-[#C9A58B]" }), _jsx("span", { children: "Your Home" })] }), _jsx("div", { className: "text-right", children: _jsxs("p", { className: "text-xl font-bold text-[#6B5D52]", children: ["\u20B9", booking.totalAmount || "TBD"] }) })] }), booking.notes && (_jsx("div", { className: "mt-4 p-3 bg-[#FAF7F2] rounded-lg border border-[#E8DDD0]", children: _jsxs("p", { className: "text-sm text-[#8B7D6B]", children: [_jsx("strong", { className: "text-[#6B5D52]", children: "Notes:" }), " ", booking.notes] }) })), booking.status === "pending" && (_jsxs("div", { className: "mt-4 flex gap-3", children: [_jsx(Button, { size: "sm", className: "bg-[#8B7D6B] hover:bg-[#9D8E7C] text-white px-6 py-2 rounded-lg transition-all duration-300", children: "Confirm" }), _jsx(Button, { size: "sm", variant: "outline", className: "border-2 border-[#B89D8F] text-[#8B7D6B] hover:bg-[#B89D8F] hover:text-white px-6 py-2 rounded-lg transition-all duration-300", children: "Cancel" })] }))] }, index))) })) : (_jsxs("div", { className: "text-center py-12", children: [_jsx(Calendar, { className: "h-16 w-16 text-[#C9A58B] mx-auto mb-4" }), _jsx("h3", { className: "text-xl font-semibold text-[#6B5D52] mb-2", children: "No Bookings Yet" }), _jsx("p", { className: "text-[#A39689] mb-6", children: "You haven't made any appointments yet. Book your first salon service!" }), _jsx(Button, { onClick: () => setLocation("/booking"), className: "bg-[#C9A58B] hover:bg-[#B89479] text-white px-8 py-3 rounded-lg transition-all duration-300", children: "Book Your First Appointment" })] })) })] })] }), _jsx("section", { className: "py-16 bg-gradient-to-br from-[#F5F0E8] via-[#E8DDD0] to-[#DFD3C3]", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center", children: [_jsx("h2", { className: "text-3xl font-serif font-bold text-[#6B5D52] mb-4", children: "Your Beauty Journey Awaits" }), _jsx("p", { className: "text-lg text-[#A39689] mb-8 max-w-2xl mx-auto", children: "Manage your appointments, track your beauty services, and enjoy our premium doorstep salon experience." }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [_jsx(Button, { onClick: () => setLocation("/booking"), className: "bg-[#8B7D6B] hover:bg-[#9D8E7C] text-white px-8 py-3 rounded-lg transition-all duration-300", children: "Book New Appointment" }), _jsx(Button, { asChild: true, variant: "outline", className: "border-2 border-[#8B7D6B] text-[#8B7D6B] hover:bg-[#8B7D6B] hover:text-white transition-all duration-300", children: _jsxs("a", { href: "tel:9036626642", children: [_jsx(Phone, { className: "h-4 w-4 mr-2" }), "Call Us: 9036626642"] }) })] })] }) })] }));
}
