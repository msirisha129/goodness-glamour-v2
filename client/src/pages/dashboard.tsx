import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { Users, MessageSquare, DollarSign, TrendingUp, LogOut, Calendar, Lock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#D4AF37', '#FFD700', '#F0E68C', '#BDB76B', '#DAA520'];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [timeRange, setTimeRange] = useState("all");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Check authentication - requires password every time
  useEffect(() => {
    const authStatus = sessionStorage.getItem("isAdminAuthenticated") === "true";
    setIsAuthenticated(authStatus);
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      sessionStorage.setItem("isAdminAuthenticated", "true");
      setIsAuthenticated(true);
      setPasswordError("");
    } else {
      setPasswordError("Incorrect password. Please try again.");
    }
  };

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ["/api/dashboard/stats", timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/stats?timeRange=${timeRange}`, {
        cache: 'no-cache',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      console.log('📊 Stats received:', data);
      return data;
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
    enabled: isAuthenticated, // Only fetch when authenticated
  });

  const { data: bookingsData, refetch: refetchBookings } = useQuery({
    queryKey: ["/api/dashboard/bookings", timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/bookings?timeRange=${timeRange}`, {
        cache: 'no-cache',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      console.log('📅 Bookings received:', data);
      return data;
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
    enabled: isAuthenticated, // Only fetch when authenticated
  });

  const { data: messages, refetch: refetchMessages } = useQuery({
    queryKey: ["/api/dashboard/messages", timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/messages?timeRange=${timeRange}`, {
        cache: 'no-cache',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      console.log('📧 Messages received:', data.length, data);
      console.log('📋 First 3 messages:', data.slice(0, 3));
      console.log('📅 All dates:', data.map((m: any) => m['Submission Date']));
      return data;
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
    enabled: isAuthenticated, // Only fetch when authenticated
  });

  const handleLogout = () => {
    sessionStorage.removeItem("isAdminAuthenticated");
    setLocation("/login");
  };

  // Show password prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 p-4 relative overflow-hidden">
        {/* Luxurious background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-rose-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-32 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-32 left-32 w-72 h-72 bg-gradient-to-r from-rose-500/10 to-amber-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-r from-amber-500/10 to-rose-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <Card className="w-full max-w-md bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 shadow-2xl shadow-black/50 relative z-10">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-amber-400 via-rose-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Lock className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-4xl font-serif text-white bg-gradient-to-r from-amber-200 via-rose-200 to-purple-200 bg-clip-text text-transparent">
              Admin Access
            </CardTitle>
            <CardDescription className="text-gray-300 font-medium text-lg">
              Enter password to access dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordError && (
                <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                  {passwordError}
                </div>
              )}
              
              <div className="space-y-3">
                <Label htmlFor="password" className="text-gray-200 font-medium text-sm uppercase tracking-wider">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-gray-600 focus:border-amber-400 focus:ring-amber-400/20 bg-gray-800/50 backdrop-blur-sm text-white placeholder:text-gray-400 h-12"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-600 hover:via-rose-600 hover:to-purple-700 text-white font-semibold py-4 rounded-lg shadow-2xl shadow-amber-500/25 transition-all duration-300 transform hover:scale-[1.02] uppercase tracking-wider"
              >
                Access Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 pb-12 gradient-hero">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor your salon's performance and customer activity
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => {
                refetchStats();
                refetchBookings();
                refetchMessages();
              }} 
              variant="outline" 
              size="sm"
            >
              🔄 Refresh
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
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats?.totalBookings || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Confirmed appointments
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{stats?.totalMessages || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Customer inquiries
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">₹{stats?.totalRevenue || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                From all bookings
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Booking Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">₹{stats?.averageBookingValue || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Per appointment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Services Pie Chart */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-serif">Popular Services</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.popularServices && stats.popularServices.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.popularServices}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.popularServices.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No service data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Trends Bar Chart */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-serif">Booking Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsData?.trends && bookingsData.trends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={bookingsData.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="bookings" fill="#D4AF37" name="Bookings" />
                    <Bar dataKey="revenue" fill="#FFD700" name="Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No booking trends available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-serif">Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookingsData?.bookings && bookingsData.bookings.length > 0 ? (
                  bookingsData.bookings.slice(0, 5).map((booking: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{booking.Name}</p>
                        <p className="text-sm text-muted-foreground">{booking.Services}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">₹{booking['Total Amount']}</p>
                        <p className="text-xs text-muted-foreground">{booking.Date}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No bookings yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-serif">Recent Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages && Array.isArray(messages) && messages.length > 0 ? (
                  messages.slice(0, 5).map((message: any, index: number) => (
                    <div key={index} className="p-3 bg-secondary/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground">{message.Name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{message['Phone Number'] || 'No phone'}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{message['Service Interest'] || 'No service'}</p>
                      <p className="text-xs text-muted-foreground mt-1">{message.Address || 'No address'}</p>
                      {message.Message && (
                        <p className="text-xs text-muted-foreground mt-2 italic">"{message.Message}"</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">{message['Submission Date'] || 'No date'}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No messages yet. Submit a contact form to see data here.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Messages Section */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              All Contact Messages ({messages?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages && messages.length > 0 ? (
                messages.map((message: any, index: number) => (
                  <div key={index} className="p-4 bg-secondary/20 rounded-lg border border-border/50">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-start">
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {message.Name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{message.Name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{message['Phone Number'] || 'No phone'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-foreground mb-1">Service Interest</p>
                        <p className="text-sm text-muted-foreground">{message['Service Interest'] || 'No service'}</p>
                        {message.Message && (
                          <>
                            <p className="text-sm font-medium text-foreground mt-2 mb-1">Message</p>
                            <p className="text-sm text-muted-foreground italic">"{message.Message}"</p>
                          </>
                        )}
                      </div>
                      
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-foreground mb-1">Address</p>
                        <p className="text-sm text-muted-foreground">{message.Address || 'No address'}</p>
                        <p className="text-xs text-muted-foreground mt-2">{message['Submission Date'] || 'No date'}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No messages found for the selected time period.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* All Bookings Section */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              All Bookings ({bookingsData?.bookings?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {bookingsData?.bookings && bookingsData.bookings.length > 0 ? (
                bookingsData.bookings.map((booking: any, index: number) => (
                  <div key={index} className="p-4 bg-secondary/20 rounded-lg border border-border/50">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-start">
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-accent">
                              {booking.Name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{booking.Name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{booking['Phone Number'] || 'No phone'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-foreground mb-1">Services</p>
                        <p className="text-sm text-muted-foreground">{booking.Services || 'No services'}</p>
                        {booking.Notes && (
                          <>
                            <p className="text-sm font-medium text-foreground mt-2 mb-1">Notes</p>
                            <p className="text-sm text-muted-foreground italic">"{booking.Notes}"</p>
                          </>
                        )}
                      </div>
                      
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-foreground mb-1">Appointment</p>
                        <p className="text-sm text-muted-foreground">{booking.Date || 'No date'}</p>
                        <p className="text-sm font-medium text-primary mt-1">₹{booking['Total Amount'] || '0'}</p>
                        <p className="text-xs text-muted-foreground mt-1">{booking.Location || 'No location'}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No bookings found for the selected time period.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

