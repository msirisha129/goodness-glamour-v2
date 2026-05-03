import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, MessageSquare, DollarSign, TrendingUp, LogOut, Calendar, Plus, Edit, Trash2, Settings, Shield, ArrowLeft, Phone } from "lucide-react";
import { BookingTrendsBarChart, UserGrowthLineChart, ServiceCategoriesPieChart, RevenueTrendsAreaChart, MessageTrendsBarChart, BookingStatusPieChart, StatCard } from '@/components/admin-charts';
const COLORS = ['#D4AF37', '#FFD700', '#F0E68C', '#BDB76B', '#DAA520'];
export default function AdminDashboard() {
    const [, setLocation] = useLocation();
    const [user, setUser] = useState(null);
    const [timeRange, setTimeRange] = useState("all");
    const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const queryClient = useQueryClient();
    const [eventSource, setEventSource] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isAnalyticsRefreshing, setIsAnalyticsRefreshing] = useState(false);
    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const userData = JSON.parse(userStr);
                setUser(userData);
                if (userData.role !== "admin") {
                    setLocation("/");
                }
            }
            catch (error) {
                console.error("Error parsing user data:", error);
                setLocation("/login");
            }
        }
        else {
            setLocation("/login");
        }
    }, [setLocation]);
    // Subscribe to realtime server-sent events to refresh dashboard instantly
    // (placed after query hooks to avoid TDZ on refetch functions)
    // Fetch services
    const { data: services, refetch: refetchServices } = useQuery({
        queryKey: ["/api/admin/services"],
        queryFn: async () => {
            const token = localStorage.getItem("authToken");
            const response = await fetch("/api/admin/services", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error("Failed to fetch services");
            }
            return response.json();
        },
        enabled: !!user,
    });
    // Fetch dashboard stats
    const { data: stats, refetch: refetchStats } = useQuery({
        queryKey: ["/api/dashboard/stats", timeRange],
        queryFn: async () => {
            const response = await fetch(`/api/dashboard/stats?timeRange=${timeRange}`);
            if (!response.ok)
                throw new Error('Failed to fetch stats');
            return response.json();
        },
        refetchInterval: 5000,
        enabled: !!user,
    });
    // Fetch bookings
    const { data: bookingsData, refetch: refetchBookings } = useQuery({
        queryKey: ["/api/dashboard/bookings", timeRange],
        queryFn: async () => {
            const response = await fetch(`/api/dashboard/bookings?timeRange=${timeRange}`);
            if (!response.ok)
                throw new Error('Failed to fetch bookings');
            return response.json();
        },
        refetchInterval: 5000,
        enabled: !!user,
    });
    // Fetch contact messages (all messages) for the selected time range
    const { data: messagesData, refetch: refetchMessages } = useQuery({
        queryKey: ["/api/dashboard/messages", timeRange],
        queryFn: async () => {
            const response = await fetch(`/api/dashboard/messages?timeRange=${timeRange}`);
            if (!response.ok)
                throw new Error('Failed to fetch messages');
            return response.json();
        },
        refetchInterval: 10000,
        enabled: !!user,
    });
    // Fetch comprehensive analytics
    const { data: analytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery({
        queryKey: ["/api/admin/dashboard/analytics", timeRange],
        queryFn: async () => {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`/api/admin/dashboard/analytics?timeRange=${timeRange}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch analytics');
            }
            return response.json();
        },
        refetchInterval: 15000, // Refresh every 15 seconds for real-time updates
        enabled: !!user,
    });
    // Subscribe to realtime server-sent events to refresh dashboard instantly
    useEffect(() => {
        if (!user)
            return;
        const es = new EventSource(`/api/events`);
        es.onmessage = (evt) => {
            try {
                const data = JSON.parse(evt.data || '{}');
                if (data?.type === 'booking_created' || data?.type === 'message_created') {
                    refetchStats();
                    refetchBookings();
                    refetchAnalytics();
                    refetchMessages();
                }
            }
            catch (_e) { }
        };
        setEventSource(es);
        return () => {
            es.close();
            setEventSource(null);
        };
    }, [user, refetchStats, refetchBookings, refetchAnalytics]);
    // Auto-refresh analytics when time range changes
    useEffect(() => {
        if (user) {
            refetchAnalytics();
            refetchStats();
            refetchBookings();
            refetchMessages();
        }
    }, [timeRange, user, refetchAnalytics, refetchStats, refetchBookings, refetchMessages]);
    async function handleRefresh() {
        try {
            setIsRefreshing(true);
            await Promise.all([
                refetchStats(),
                refetchBookings(),
                refetchServices(),
                refetchAnalytics(),
                refetchMessages(),
            ]);
        }
        finally {
            setIsRefreshing(false);
        }
    }
    async function handleRefreshAnalytics() {
        try {
            setIsAnalyticsRefreshing(true);
            await refetchAnalytics();
        }
        finally {
            setIsAnalyticsRefreshing(false);
        }
    }
    // Add/Update service mutation
    const serviceMutation = useMutation({
        mutationFn: async (serviceData) => {
            const token = localStorage.getItem("authToken");
            const url = editingService
                ? `/api/admin/services/${editingService.id}`
                : "/api/admin/services";
            const response = await fetch(url, {
                method: editingService ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(serviceData),
            });
            if (!response.ok) {
                throw new Error("Failed to save service");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
            setIsAddServiceOpen(false);
            setEditingService(null);
        },
    });
    // Delete service mutation
    const deleteServiceMutation = useMutation({
        mutationFn: async (serviceId) => {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`/api/admin/services/${serviceId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error("Failed to delete service");
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
        },
    });
    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        setLocation("/login");
    };
    const handleEditService = (service) => {
        setEditingService(service);
        setIsAddServiceOpen(true);
    };
    const handleDeleteService = (serviceId) => {
        if (confirm("Are you sure you want to delete this service?")) {
            deleteServiceMutation.mutate(serviceId);
        }
    };
    if (!user) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "text-center", children: _jsx("p", { className: "text-muted-foreground", children: "Loading..." }) }) }));
    }
    return (_jsxs("div", { className: "min-h-screen pt-20 px-4 pb-12 bg-gradient-to-br from-white via-blue-50 to-blue-100", children: [_jsx("section", { className: "pt-16 gradient-hero", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6", children: "Admin Dashboard" }), _jsx("p", { className: "text-lg text-muted-foreground max-w-2xl mx-auto", children: "Manage your salon services, bookings, and customer interactions" })] }) }) }), _jsxs("div", { className: "max-w-7xl mx-auto space-y-8", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Button, { variant: "ghost", onClick: () => setLocation("/"), className: "text-amber-800 hover:text-amber-700", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back to Home"] }), _jsxs("div", { children: [_jsxs("h1", { className: "text-4xl font-serif font-bold text-foreground flex items-center gap-3", children: [_jsx(Shield, { className: "h-10 w-10 text-amber-800" }), "Admin Dashboard"] }), _jsx("p", { className: "text-muted-foreground font-medium", children: "Manage your salon's services and customer bookings" })] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Button, { onClick: handleRefresh, variant: "outline", size: "sm", className: "text-amber-800 border-amber-800 hover:bg-amber-800 hover:text-black", disabled: isRefreshing || analyticsLoading, children: isRefreshing ? "Refreshing..." : "🔄 Refresh" }), _jsxs(Select, { value: timeRange, onValueChange: setTimeRange, children: [_jsx(SelectTrigger, { className: "w-[180px]", children: _jsx(SelectValue, { placeholder: "Select time range" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "today", children: "Today" }), _jsx(SelectItem, { value: "week", children: "This Week" }), _jsx(SelectItem, { value: "month", children: "This Month" }), _jsx(SelectItem, { value: "all", children: "All Time" })] })] }), _jsxs(Button, { variant: "outline", onClick: handleLogout, className: "flex items-center gap-2 text-red-400 border-red-400 hover:bg-red-400 hover:text-white", children: [_jsx(LogOut, { className: "h-4 w-4" }), "Logout"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsxs(Card, { className: "bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Total Bookings" }), _jsx(Users, { className: "h-4 w-4 text-amber-800" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold text-gray-900", children: stats?.totalBookings || 0 }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Confirmed appointments" })] })] }), _jsxs(Card, { className: "bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Messages" }), _jsx(MessageSquare, { className: "h-4 w-4 text-amber-800" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold text-gray-900", children: stats?.totalMessages || 0 }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Customer inquiries" })] })] }), _jsxs(Card, { className: "bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Total Revenue" }), _jsx(DollarSign, { className: "h-4 w-4 text-amber-800" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-3xl font-bold text-green-600", children: ["\u20B9", stats?.totalRevenue || 0] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "From all bookings" })] })] }), _jsxs(Card, { className: "bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Avg Booking Value" }), _jsx(TrendingUp, { className: "h-4 w-4 text-amber-800" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-3xl font-bold text-gray-900", children: ["\u20B9", stats?.averageBookingValue || 0] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Per appointment" })] })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h2", { className: "text-2xl font-bold text-amber-800 flex items-center gap-2", children: [_jsx(TrendingUp, { className: "h-6 w-6" }), "Analytics Dashboard"] }), _jsx(Button, { onClick: handleRefreshAnalytics, variant: "outline", size: "sm", className: "text-amber-800 border-amber-800 hover:bg-amber-800 hover:text-black", disabled: analyticsLoading || isAnalyticsRefreshing, children: isAnalyticsRefreshing || analyticsLoading ? "Refreshing Analytics..." : "🔄 Refresh Analytics" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx(StatCard, { title: "Users Today", value: analytics?.userStats?.usersToday || 0, icon: _jsx(Users, { className: "h-6 w-6" }) }), _jsx(StatCard, { title: "Bookings Today", value: analytics?.bookingStats?.bookingsToday || 0, icon: _jsx(Calendar, { className: "h-6 w-6" }) }), _jsx(StatCard, { title: "Messages Today", value: analytics?.messageStats?.messagesToday || 0, icon: _jsx(MessageSquare, { className: "h-6 w-6" }) }), _jsx(StatCard, { title: "Conversion Rate", value: `${analytics?.messageStats?.conversionRate?.toFixed(1) || 0}%`, subtitle: "Messages to Bookings", icon: _jsx(TrendingUp, { className: "h-6 w-6" }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { className: "bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-gray-800 flex items-center gap-2", children: [_jsx(Users, { className: "h-5 w-5" }), "User Growth Over Time"] }), _jsx(CardDescription, { className: "text-gray-600", children: "New user registrations trend" })] }), _jsx(CardContent, { children: _jsx(UserGrowthLineChart, { data: analytics?.timeSeriesData?.userRegistrations || [], height: 300 }) })] }), _jsxs(Card, { className: "bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-gray-800 flex items-center gap-2", children: [_jsx(Calendar, { className: "h-5 w-5" }), "Booking Trends"] }), _jsx(CardDescription, { className: "text-gray-600", children: "Daily bookings and revenue" })] }), _jsx(CardContent, { children: _jsx(BookingTrendsBarChart, { data: analytics?.timeSeriesData?.bookings || [], height: 300 }) })] }), _jsxs(Card, { className: "bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-gray-800 flex items-center gap-2", children: [_jsx(Settings, { className: "h-5 w-5" }), "Popular Services"] }), _jsx(CardDescription, { className: "text-gray-600", children: "Hover to see exact counts per service in selected time range" })] }), _jsx(CardContent, { children: _jsx(ServiceCategoriesPieChart, { data: analytics?.categoryData?.serviceCategories || [], height: 300 }) })] }), _jsxs(Card, { className: "bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-gray-800 flex items-center gap-2", children: [_jsx(MessageSquare, { className: "h-5 w-5" }), "Message Trends"] }), _jsx(CardDescription, { className: "text-gray-600", children: "Daily contact messages received" })] }), _jsx(CardContent, { children: _jsx(MessageTrendsBarChart, { data: analytics?.timeSeriesData?.messages || [], height: 300 }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { className: "bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-gray-800 flex items-center gap-2", children: [_jsx(DollarSign, { className: "h-5 w-5" }), "Revenue Trends"] }), _jsx(CardDescription, { className: "text-gray-600", children: "Revenue growth over time" })] }), _jsx(CardContent, { children: _jsx(RevenueTrendsAreaChart, { data: analytics?.timeSeriesData?.bookings || [], height: 300 }) })] }), _jsxs(Card, { className: "bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-gray-800 flex items-center gap-2", children: [_jsx(Calendar, { className: "h-5 w-5" }), "Booking Status Distribution"] }), _jsx(CardDescription, { className: "text-gray-600", children: "Current booking statuses" })] }), _jsx(CardContent, { children: _jsx(BookingStatusPieChart, { data: analytics?.categoryData?.bookingStatus || [], height: 300 }) })] })] })] }), _jsxs(Card, { className: "bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "text-amber-800 font-serif flex items-center gap-2", children: [_jsx(Settings, { className: "h-5 w-5" }), "Services Management"] }), _jsx(CardDescription, { className: "text-amber-700", children: "Add, edit, or remove salon services" })] }), _jsxs(Dialog, { open: isAddServiceOpen, onOpenChange: setIsAddServiceOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "bg-black hover:bg-gray-800 text-white", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Service"] }) }), _jsxs(DialogContent, { children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { className: "text-amber-700", children: editingService ? "Edit Service" : "Add New Service" }) }), _jsx(ServiceForm, { service: editingService, onSubmit: (data) => serviceMutation.mutate(data), isLoading: serviceMutation.isPending, onCancel: () => {
                                                            setIsAddServiceOpen(false);
                                                            setEditingService(null);
                                                        } })] })] })] }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: services?.map((service) => (_jsxs("div", { className: "p-4 bg-gradient-to-br from-amber-50/60 to-white/80 rounded-lg border border-amber-200/50 hover:border-amber-400/60 hover:shadow-lg transition-all duration-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: service.name }), _jsx(Badge, { className: service.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800", children: service.isActive ? "Active" : "Inactive" })] }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: service.description }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between text-gray-600", children: [_jsx("span", { children: "Category:" }), _jsx("span", { className: "text-gray-900", children: service.category })] }), _jsxs("div", { className: "flex justify-between text-gray-600", children: [_jsx("span", { children: "Price:" }), _jsxs("span", { className: "text-gray-900", children: ["\u20B9", service.priceMin, " - \u20B9", service.priceMax] })] }), _jsxs("div", { className: "flex justify-between text-gray-600", children: [_jsx("span", { children: "Duration:" }), _jsxs("span", { className: "text-gray-900", children: [service.duration, " min"] })] })] }), _jsxs("div", { className: "flex gap-2 mt-4", children: [_jsxs(Button, { size: "sm", variant: "outline", onClick: () => handleEditService(service), className: "text-amber-800 border-amber-800 hover:bg-amber-800 hover:text-black", children: [_jsx(Edit, { className: "h-3 w-3 mr-1" }), "Edit"] }), _jsxs(Button, { size: "sm", variant: "outline", onClick: () => handleDeleteService(service.id), className: "text-red-400 border-red-400 hover:bg-red-400 hover:text-white", children: [_jsx(Trash2, { className: "h-3 w-3 mr-1" }), "Delete"] })] })] }, service.id))) }) })] }), _jsxs(Card, { className: "bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-amber-700 font-serif flex items-center gap-2", children: [_jsx(Calendar, { className: "h-5 w-5" }), "Recent Bookings"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: bookingsData?.bookings && bookingsData.bookings.length > 0 ? (bookingsData.bookings.slice(0, 5).map((booking, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gradient-to-r from-amber-50/60 to-white/80 rounded-lg border border-amber-200/30 hover:shadow-md transition-all duration-200", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium text-gray-900", children: booking.Name }), _jsx("p", { className: "text-sm text-gray-600", children: booking.Services })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "font-semibold text-amber-700", children: ["\u20B9", booking['Total Amount']] }), _jsx("p", { className: "text-xs text-gray-500", children: booking.Date })] })] }, index)))) : (_jsx("p", { className: "text-center text-gray-500 py-8", children: "No bookings yet" })) }) })] }), _jsxs(Card, { className: "bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-amber-700 font-serif flex items-center gap-2", children: [_jsx(MessageSquare, { className: "h-5 w-5" }), "All Messages"] }), _jsx(CardDescription, { className: "text-gray-300", children: "Showing all customer inquiries for the selected time range" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4 max-h-[420px] overflow-y-auto pr-1", children: Array.isArray(messagesData) && messagesData.length > 0 ? (messagesData.map((msg, idx) => (_jsxs("div", { className: "p-3 bg-gradient-to-r from-amber-50/60 to-white/80 rounded-lg border border-amber-200/30 hover:shadow-md transition-all duration-200", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "font-medium text-gray-900 truncate", children: msg.Name }), _jsx("div", { className: "text-xs text-gray-500 ml-2 whitespace-nowrap", children: msg['Submission Date'] })] }), _jsx("div", { className: "text-sm text-gray-600 mt-1", children: msg['Service Interest'] }), _jsx("div", { className: "text-xs text-gray-600 mt-1 break-words", children: msg.Message }), _jsx("div", { className: "text-xs text-gray-500 mt-1", children: msg['Phone Number'] || msg.Phone })] }, idx)))) : (_jsx("p", { className: "text-center text-gray-400 py-8", children: "No messages yet" })) }) })] })] }), _jsx("section", { className: "py-16 bg-gradient-to-br from-blue-50 via-white to-blue-100", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center", children: [_jsx("h2", { className: "text-3xl font-serif font-bold text-gray-900 mb-4", children: "Admin Dashboard - Salon Management" }), _jsx("p", { className: "text-lg text-gray-600 mb-8 max-w-2xl mx-auto", children: "Manage your salon services, track bookings, and monitor customer interactions from your comprehensive admin panel." }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [_jsx(Button, { asChild: true, className: "btn-primary", children: _jsx("a", { href: "/", children: "View Public Site" }) }), _jsx(Button, { asChild: true, variant: "outline", children: _jsxs("a", { href: "tel:9036626642", children: [_jsx(Phone, { className: "h-4 w-4 mr-2" }), "Call Us: 9036626642"] }) })] })] }) })] }));
}
// Service Form Component
function ServiceForm({ service, onSubmit, isLoading, onCancel }) {
    const [formData, setFormData] = useState({
        name: service?.name || "",
        description: service?.description || "",
        category: service?.category || "women",
        priceMin: service?.priceMin || 0,
        priceMax: service?.priceMax || 0,
        duration: service?.duration || 30,
        isActive: service?.isActive ?? true,
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "name", className: "text-amber-700", children: "Service Name" }), _jsx(Input, { id: "name", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), className: "", required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "category", className: "text-amber-700", children: "Category" }), _jsxs(Select, { value: formData.category, onValueChange: (value) => setFormData({ ...formData, category: value }), children: [_jsx(SelectTrigger, { className: "bg-gray-800 border-gray-600 text-white", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { className: "bg-gray-800 border-gray-600", children: [_jsx(SelectItem, { value: "women", children: "Women" }), _jsx(SelectItem, { value: "kids", children: "Kids" }), _jsx(SelectItem, { value: "home", children: "Home" }), _jsx(SelectItem, { value: "products", children: "Products" })] })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "description", className: "text-amber-700", children: "Description" }), _jsx(Textarea, { id: "description", value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), className: "bg-gray-800 border-gray-600 text-white", required: true })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "priceMin", className: "text-amber-700", children: "Min Price (\u20B9)" }), _jsx(Input, { id: "priceMin", type: "number", value: formData.priceMin, onChange: (e) => setFormData({ ...formData, priceMin: parseInt(e.target.value) }), className: "", required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "priceMax", className: "text-amber-700", children: "Max Price (\u20B9)" }), _jsx(Input, { id: "priceMax", type: "number", value: formData.priceMax, onChange: (e) => setFormData({ ...formData, priceMax: parseInt(e.target.value) }), className: "", required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "duration", className: "text-amber-700", children: "Duration (min)" }), _jsx(Input, { id: "duration", type: "number", value: formData.duration, onChange: (e) => setFormData({ ...formData, duration: parseInt(e.target.value) }), className: "", required: true })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "isActive", checked: formData.isActive, onChange: (e) => setFormData({ ...formData, isActive: e.target.checked }), className: "rounded" }), _jsx(Label, { htmlFor: "isActive", className: "text-amber-700", children: "Active Service" })] }), _jsxs("div", { className: "flex gap-2 pt-4", children: [_jsx(Button, { type: "submit", disabled: isLoading, className: "bg-black hover:bg-gray-800 text-white", children: isLoading ? "Saving..." : service ? "Update Service" : "Add Service" }), _jsx(Button, { type: "button", variant: "outline", onClick: onCancel, className: "", children: "Cancel" })] })] }));
}
