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
import { 
  Users, 
  MessageSquare, 
  DollarSign, 
  TrendingUp, 
  LogOut, 
  Calendar, 
  Plus,
  Edit,
  Trash2,
  Settings,
  Shield,
  ArrowLeft,
  Phone
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  UserRegistrationPieChart,
  BookingTrendsBarChart,
  UserGrowthLineChart,
  ServiceCategoriesPieChart,
  RevenueTrendsAreaChart,
  MessageTrendsBarChart,
  BookingStatusPieChart,
  StatCard
} from '@/components/admin-charts';

const COLORS = ['#D4AF37', '#FFD700', '#F0E68C', '#BDB76B', '#DAA520'];

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  priceMin: number;
  priceMax: number;
  duration: number;
  imageUrl?: string;
  isActive: boolean;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [timeRange, setTimeRange] = useState("all");
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isEditBookingOpen, setIsEditBookingOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any | null>(null);
  const queryClient = useQueryClient();
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
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
      } catch (error) {
        console.error("Error parsing user data:", error);
        setLocation("/login");
      }
    } else {
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
      if (!response.ok) throw new Error('Failed to fetch stats');
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
      if (!response.ok) throw new Error('Failed to fetch bookings');
      return response.json();
    },
    refetchInterval: 5000,
    enabled: !!user,
  });

  // Fetch all bookings for admin management
  const { data: allBookings, refetch: refetchAllBookings } = useQuery({
    queryKey: ["/api/admin/bookings"],
    queryFn: async () => {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch bookings');
      return response.json();
    },
    enabled: !!user,
  });
  
  // Fetch contact messages (all messages) for the selected time range
  const { data: messagesData, refetch: refetchMessages } = useQuery({
    queryKey: ["/api/dashboard/messages", timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/messages?timeRange=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
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
    if (!user) return;
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
        // Handle service updates
        if (data?.type === 'service_created' || data?.type === 'service_updated' || data?.type === 'service_deleted') {
          refetchServices();
          queryClient.invalidateQueries({ queryKey: ["/api/services"] });
        }
        // Handle booking updates
        if (data?.type === 'booking_updated' || data?.type === 'booking_deleted' || data?.type === 'booking_created') {
          refetchAllBookings();
          refetchBookings();
          refetchStats();
          refetchAnalytics();
          queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
          queryClient.invalidateQueries({ queryKey: ["/api/dashboard/bookings"] });
          queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
          queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/analytics"] });
          queryClient.invalidateQueries({ queryKey: ["/api/user/bookings"] });
        }
        // Handle user updates
        if (data?.type === 'user_created' || data?.type === 'user_updated') {
          refetchStats();
          refetchAnalytics();
          queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
          queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/analytics"] });
        }
      } catch (_e) {}
    };
    setEventSource(es);
    return () => {
      es.close();
      setEventSource(null);
    };
  }, [user, refetchStats, refetchBookings, refetchAnalytics, refetchServices, queryClient]);

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
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleRefreshAnalytics() {
    try {
      setIsAnalyticsRefreshing(true);
      await refetchAnalytics();
    } finally {
      setIsAnalyticsRefreshing(false);
    }
  }

  // Add/Update service mutation
  const serviceMutation = useMutation({
    mutationFn: async (serviceData: Partial<Service>) => {
      const token = localStorage.getItem("authToken");
      const url = editingService 
        ? `/api/admin/services/${editingService.id}` 
        : "/api/admin/services";
      
      console.log(`🔄 ${editingService ? 'Updating' : 'Creating'} service:`, serviceData);
      console.log(`📡 URL: ${url}, Method: ${editingService ? 'PUT' : 'POST'}`);
      
      const response = await fetch(url, {
        method: editingService ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ Failed to ${editingService ? 'update' : 'create'} service:`, errorData);
        throw new Error(errorData.message || "Failed to save service");
      }

      const result = await response.json();
      console.log(`✅ Service ${editingService ? 'updated' : 'created'} successfully:`, result);
      return result;
    },
    onSuccess: () => {
      console.log(`🔄 Invalidating query caches...`);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setIsAddServiceOpen(false);
      setEditingService(null);
    },
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
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
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
    },
  });

  // Update booking mutation
  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = localStorage.getItem("authToken");
      
      console.log(`🔄 Updating booking ${id} with data:`, data);
      
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ Failed to update booking:`, errorData);
        throw new Error(errorData.message || "Failed to update booking");
      }

      const result = await response.json();
      console.log(`✅ Booking updated successfully:`, result);
      return result;
    },
    onSuccess: () => {
      console.log(`🔄 Invalidating booking query caches...`);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/bookings"] });
      setIsEditBookingOpen(false);
      setEditingBooking(null);
    },
  });

  // Delete booking mutation
  const deleteBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const token = localStorage.getItem("authToken");
      
      console.log(`🗑️ Deleting booking ${bookingId}`);
      
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ Failed to delete booking:`, errorData);
        throw new Error(errorData.message || "Failed to delete booking");
      }
      
      console.log(`✅ Booking deleted successfully`);
    },
    onSuccess: () => {
      console.log(`🔄 Invalidating booking query caches...`);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/bookings"] });
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setLocation("/login");
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsAddServiceOpen(true);
  };

  const handleDeleteService = (serviceId: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      deleteServiceMutation.mutate(serviceId);
    }
  };

  const handleEditBooking = (booking: any) => {
    setEditingBooking(booking);
    setIsEditBookingOpen(true);
  };

  const handleSaveBooking = (bookingData: any) => {
    if (editingBooking) {
      updateBookingMutation.mutate({ id: editingBooking.id, data: bookingData });
    }
  };

  const handleDeleteBooking = (bookingId: string) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      deleteBookingMutation.mutate(bookingId);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 pb-12 bg-gradient-to-br from-white via-blue-50 to-blue-100">
      {/* Hero Section */}
      <section className="pt-16 gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6">
              Admin Dashboard
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Manage your salon services, bookings, and customer interactions
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="text-amber-800 hover:text-amber-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-4xl font-serif font-bold text-foreground flex items-center gap-3">
                <Shield className="h-10 w-10 text-amber-800" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground font-medium">
                Manage your salon's services and customer bookings
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleRefresh}
              variant="outline" 
              size="sm"
              className="text-amber-800 border-amber-800 hover:bg-amber-800 hover:text-black"
              disabled={isRefreshing || analyticsLoading}
            >
              {isRefreshing ? "Refreshing..." : "🔄 Refresh"}
            </Button>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
              <Users className="h-4 w-4 text-amber-800" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats?.totalBookings || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                Confirmed appointments
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-amber-800" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats?.totalMessages || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                Customer inquiries
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-amber-800" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">₹{stats?.totalRevenue || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                From all bookings
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Avg Booking Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-800" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">₹{stats?.averageBookingValue || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                Per appointment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Dashboard */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-amber-800 flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Analytics Dashboard
            </h2>
            <Button
              onClick={handleRefreshAnalytics}
              variant="outline"
              size="sm"
              className="text-amber-800 border-amber-800 hover:bg-amber-800 hover:text-black"
              disabled={analyticsLoading || isAnalyticsRefreshing}
            >
              {isAnalyticsRefreshing || analyticsLoading ? "Refreshing Analytics..." : "🔄 Refresh Analytics"}
            </Button>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Users Today"
              value={analytics?.userStats?.usersToday || 0}
              icon={<Users className="h-6 w-6" />}
            />
            <StatCard
              title="Bookings Today"
              value={analytics?.bookingStats?.bookingsToday || 0}
              icon={<Calendar className="h-6 w-6" />}
            />
            <StatCard
              title="Messages Today"
              value={analytics?.messageStats?.messagesToday || 0}
              icon={<MessageSquare className="h-6 w-6" />}
            />
            <StatCard
              title="Conversion Rate"
              value={`${analytics?.messageStats?.conversionRate?.toFixed(1) || 0}%`}
              subtitle="Messages to Bookings"
              icon={<TrendingUp className="h-6 w-6" />}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Growth Over Time
                </CardTitle>
                <CardDescription className="text-gray-600">
                  New user registrations trend
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserGrowthLineChart 
                  data={analytics?.timeSeriesData?.userRegistrations || []} 
                  height={300}
                />
              </CardContent>
            </Card>

            {/* Booking Trends Chart */}
            <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Booking Trends
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Daily bookings and revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BookingTrendsBarChart 
                  data={analytics?.timeSeriesData?.bookings || []} 
                  height={300}
                />
              </CardContent>
            </Card>

            {/* Service Categories Chart */}
            <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
              Popular Services
                </CardTitle>
                <CardDescription className="text-gray-600">
              Hover to see exact counts per service in selected time range
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ServiceCategoriesPieChart 
                  data={analytics?.categoryData?.serviceCategories || []} 
                  height={300}
                />
              </CardContent>
            </Card>

            {/* Message Trends Chart */}
            <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Message Trends
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Daily contact messages received
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MessageTrendsBarChart 
                  data={analytics?.timeSeriesData?.messages || []} 
                  height={300}
                />
              </CardContent>
            </Card>
          </div>

          {/* Additional Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trends */}
            <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Trends
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Revenue growth over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueTrendsAreaChart 
                  data={analytics?.timeSeriesData?.bookings || []} 
                  height={300}
                />
              </CardContent>
            </Card>

            {/* Booking Status */}
            <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Booking Status Distribution
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Current booking statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BookingStatusPieChart 
                  data={analytics?.categoryData?.bookingStatus || []} 
                  height={300}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Services Management */}
        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-amber-800 font-serif flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Services Management
              </CardTitle>
              <CardDescription className="text-amber-700">
                Add, edit, or remove salon services
              </CardDescription>
            </div>
            
            <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
              <DialogTrigger asChild>
                <Button className="bg-black hover:bg-gray-800 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-amber-700">
                    {editingService ? "Edit Service" : "Add New Service"}
                  </DialogTitle>
                </DialogHeader>
                <ServiceForm 
                  service={editingService}
                  onSubmit={(data) => serviceMutation.mutate(data)}
                  isLoading={serviceMutation.isPending}
                  onCancel={() => {
                    setIsAddServiceOpen(false);
                    setEditingService(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services?.map((service: Service) => (
                <div
                  key={service.id}
                  className="p-4 bg-gradient-to-br from-amber-50/60 to-white/80 rounded-lg border border-amber-200/50 hover:border-amber-400/60 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                    <Badge className={service.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {service.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Category:</span>
                      <span className="text-gray-900">{service.category}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Price:</span>
                      <span className="text-gray-900">₹{service.priceMin} - ₹{service.priceMax}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Duration:</span>
                      <span className="text-gray-900">{service.duration} min</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditService(service)}
                      className="text-amber-800 border-amber-800 hover:bg-amber-800 hover:text-black"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteService(service.id)}
                      className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All Bookings Management */}
        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20">
          <CardHeader>
            <CardTitle className="text-amber-700 font-serif flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              All Bookings Management
            </CardTitle>
            <CardDescription className="text-gray-600">
              View, edit, and delete all bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allBookings && allBookings.length > 0 ? (
                allBookings
                  .filter((booking: any) => booking.status === 'confirmed') // Only show confirmed bookings
                  .map((booking: any) => {
                  const bookingDate = booking.appointmentDate 
                    ? new Date(booking.appointmentDate).toLocaleDateString('en-IN', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })
                    : 'N/A';
                  
                  const bookingTime = booking.appointmentDate
                    ? new Date(booking.appointmentDate).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })
                    : 'N/A';
                  
                  // Get service names from serviceIds
                  const serviceIds = Array.isArray(booking.serviceIds) ? booking.serviceIds : [];
                  const bookedServices = serviceIds
                    .map((serviceId: string) => {
                      const service = services?.find((s: Service) => s.id === serviceId);
                      return service ? service.name : null;
                    })
                    .filter((name: string | null) => name !== null);
                  
                  return (
                    <div key={booking.id} className="p-4 bg-gradient-to-r from-amber-50/60 to-white/80 rounded-lg border border-amber-200/30 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium text-gray-900">Booking ID: {booking.id.substring(0, 8)}...</p>
                            <Badge className={booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                              {booking.status || 'pending'}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Date:</span> {bookingDate} at {bookingTime}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Amount:</span> ₹{booking.totalAmount || 0}
                            </p>
                            {bookedServices.length > 0 ? (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-700 mb-1">Booked Services:</p>
                                <div className="flex flex-wrap gap-1">
                                  {bookedServices.map((serviceName: string, index: number) => (
                                    <Badge 
                                      key={index} 
                                      variant="outline" 
                                      className="text-xs bg-amber-50 text-amber-800 border-amber-300"
                                    >
                                      {serviceName}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 mt-1">
                                {serviceIds.length > 0 ? `${serviceIds.length} service(s)` : 'No services'}
                              </p>
                            )}
                            {booking.notes && (
                              <p className="text-xs text-gray-500 mt-2">
                                <span className="font-medium">Notes:</span> {booking.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditBooking(booking)}
                            className="text-amber-800 border-amber-800 hover:bg-amber-800 hover:text-black"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-500 py-8">No bookings yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Booking Edit Dialog */}
        <Dialog open={isEditBookingOpen} onOpenChange={setIsEditBookingOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-amber-700">Edit Booking</DialogTitle>
            </DialogHeader>
            {editingBooking && (
              <BookingEditForm
                booking={editingBooking}
                onSave={handleSaveBooking}
                onCancel={() => {
                  setIsEditBookingOpen(false);
                  setEditingBooking(null);
                }}
                isLoading={updateBookingMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* All Messages */}
        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20">
          <CardHeader>
            <CardTitle className="text-amber-700 font-serif flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              All Messages
            </CardTitle>
            <CardDescription className="text-gray-300">
              Showing all customer inquiries for the selected time range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {Array.isArray(messagesData) && messagesData.length > 0 ? (
                messagesData.map((msg: any, idx: number) => (
                  <div key={idx} className="p-3 bg-gradient-to-r from-amber-50/60 to-white/80 rounded-lg border border-amber-200/30 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900 truncate">
                        {msg.Name}
                      </div>
                      <div className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                        {msg['Submission Date']}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {msg['Service Interest']}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 break-words">
                      {msg.Message}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {msg['Phone Number'] || msg.Phone}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-8">No messages yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blue Gradient Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            Admin Dashboard - Salon Management
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Manage your salon services, track bookings, and monitor customer interactions from your comprehensive admin panel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="btn-primary"
            >
              <a href="/">
                View Public Site
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
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

// Booking Edit Form Component
function BookingEditForm({
  booking,
  onSave,
  onCancel,
  isLoading
}: {
  booking: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    status: booking.status || "pending",
    appointmentDate: booking.appointmentDate 
      ? new Date(booking.appointmentDate).toISOString().split('T')[0]
      : "",
    appointmentTime: booking.appointmentDate
      ? new Date(booking.appointmentDate).toTimeString().slice(0, 5)
      : "",
    totalAmount: booking.totalAmount || 0,
    notes: booking.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine date and time into appointmentDate
    const appointmentDateTime = formData.appointmentDate && formData.appointmentTime
      ? new Date(`${formData.appointmentDate}T${formData.appointmentTime}`).toISOString()
      : booking.appointmentDate;

    onSave({
      status: formData.status,
      appointmentDate: appointmentDateTime,
      totalAmount: formData.totalAmount,
      notes: formData.notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status" className="text-amber-700">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="totalAmount" className="text-amber-700">Total Amount (₹)</Label>
          <Input
            id="totalAmount"
            type="number"
            value={formData.totalAmount}
            onChange={(e) => setFormData({ ...formData, totalAmount: parseInt(e.target.value) || 0 })}
            className="bg-gray-800 border-gray-600 text-white"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="appointmentDate" className="text-amber-700">Appointment Date</Label>
          <Input
            id="appointmentDate"
            type="date"
            value={formData.appointmentDate}
            onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
            className="bg-gray-800 border-gray-600 text-white"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="appointmentTime" className="text-amber-700">Appointment Time</Label>
          <Input
            id="appointmentTime"
            type="time"
            value={formData.appointmentTime}
            onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
            className="bg-gray-800 border-gray-600 text-white"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-amber-700">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="bg-gray-800 border-gray-600 text-white"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-amber-700 hover:bg-amber-800 text-white"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

// Service Form Component
function ServiceForm({ 
  service, 
  onSubmit, 
  isLoading, 
  onCancel 
}: { 
  service: Service | null;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: service?.name || "",
    description: service?.description || "",
    category: service?.category || "women",
    priceMin: service?.priceMin || 0,
    priceMax: service?.priceMax || 0,
    duration: service?.duration || 30,
    isActive: service?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-amber-700">Service Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className=""
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category" className="text-amber-700">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="women">Women</SelectItem>
              <SelectItem value="kids">Kids</SelectItem>
              <SelectItem value="home">Home</SelectItem>
              <SelectItem value="products">Products</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-amber-700">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-gray-800 border-gray-600 text-white"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priceMin" className="text-amber-700">Min Price (₹)</Label>
          <Input
            id="priceMin"
            type="number"
            value={formData.priceMin}
            onChange={(e) => setFormData({ ...formData, priceMin: parseInt(e.target.value) })}
            className=""
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priceMax" className="text-amber-700">Max Price (₹)</Label>
          <Input
            id="priceMax"
            type="number"
            value={formData.priceMax}
            onChange={(e) => setFormData({ ...formData, priceMax: parseInt(e.target.value) })}
            className=""
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration" className="text-amber-700">Duration (min)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
            className=""
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="isActive" className="text-amber-700">Active Service</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-black hover:bg-gray-800 text-white"
        >
          {isLoading ? "Saving..." : service ? "Update Service" : "Add Service"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className=""
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
