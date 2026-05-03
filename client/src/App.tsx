import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Services from "@/pages/services";
import Booking from "@/pages/booking";
import ScanQR from "@/pages/scan-qr";
import AboutService from "@/pages/about-service";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import VerifyOTP from "@/pages/verify-otp";
import AdminDashboard from "@/pages/admin-dashboard";
import MyBookings from "@/pages/my-bookings";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/navigation";
import WhatsAppChat from "@/components/whatsapp-chat";

function Router() {
  return (
    <>
      <Switch>
        {/* Public routes - no login required */}
        <Route path="/">
          <Navigation />
          <Home />
        </Route>
        <Route path="/services">
          <Navigation />
          <Services />
        </Route>
        <Route path="/services/:category">
          <Navigation />
          <Services />
        </Route>
        <Route path="/booking">
          <Navigation />
          <Booking />
        </Route>
        <Route path="/scan-qr">
          <Navigation />
          <ScanQR />
        </Route>
        <Route path="/about-service">
          <Navigation />
          <AboutService />
        </Route>
        <Route path="/dashboard">
          <Navigation />
          <Dashboard />
        </Route>
        <Route path="/admin-dashboard">
          <Navigation />
          <AdminDashboard />
        </Route>
        <Route path="/my-bookings">
          <Navigation />
          <MyBookings />
        </Route>
        <Route path="/ai-chat">
          <Navigation />
          <Home />
        </Route>
        <Route path="/login">
          <Navigation />
          <Login />
        </Route>
        <Route path="/signup">
          <Navigation />
          <Signup />
        </Route>
        <Route path="/verify-otp">
          <Navigation />
          <VerifyOTP />
        </Route>
        
        {/* 404 page */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Router />
          <Toaster />
          <WhatsAppChat />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
