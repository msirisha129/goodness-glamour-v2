import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import VerifyOTP from "@/pages/verify-otp";
export default function AuthGuard({ children }) {
    const [location, setLocation] = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem("authToken");
        const userStr = localStorage.getItem("user");
        // Parse user data safely
        let user = null;
        try {
            user = userStr ? JSON.parse(userStr) : null;
        }
        catch (error) {
            console.error("Error parsing user data:", error);
            // Clear invalid user data
            localStorage.removeItem("user");
            localStorage.removeItem("authToken");
        }
        const isAuthenticated = token && user && user.isVerified;
        console.log("🔐 Auth Guard Check:", {
            hasToken: !!token,
            hasUser: !!user,
            isVerified: user?.isVerified,
            isAuthenticated,
            currentPath: location
        });
        // Allow access to auth pages without authentication
        const authPages = ["/login", "/signup", "/verify-otp"];
        const isOnAuthPage = authPages.includes(location);
        if (!isAuthenticated && !isOnAuthPage) {
            console.log("🚪 Redirecting to login - user not authenticated");
            setLocation("/login");
        }
        setIsLoading(false);
    }, [location, setLocation]);
    // Show loading spinner while checking authentication
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto" }), _jsx("p", { className: "mt-4 text-muted-foreground", children: "Loading..." })] }) }));
    }
    // Check authentication status
    const token = localStorage.getItem("authToken");
    const userStr = localStorage.getItem("user");
    let user = null;
    try {
        user = userStr ? JSON.parse(userStr) : null;
    }
    catch (error) {
        user = null;
    }
    const isAuthenticated = token && user && user.isVerified;
    const authPages = ["/login", "/signup", "/verify-otp", "/admin-login"];
    const isOnAuthPage = authPages.includes(location);
    // Role-based redirect logic
    if (isAuthenticated && !isOnAuthPage) {
        // If admin tries to access regular user pages, redirect to admin dashboard
        if (user.role === "admin" && !location.startsWith("/admin")) {
            if (location === "/dashboard" || location === "/my-bookings") {
                setLocation("/admin-dashboard");
                return _jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto" }), _jsx("p", { className: "mt-4 text-muted-foreground", children: "Redirecting..." })] }) });
            }
        }
        // If regular user tries to access admin pages, redirect to my bookings
        if (user.role !== "admin" && location.startsWith("/admin")) {
            setLocation("/my-bookings");
            return _jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto" }), _jsx("p", { className: "mt-4 text-muted-foreground", children: "Redirecting..." })] }) });
        }
    }
    // If not authenticated and not on auth page, show login
    if (!isAuthenticated && !isOnAuthPage) {
        return _jsx(Login, {});
    }
    // If on auth pages, show the appropriate auth component
    if (isOnAuthPage) {
        switch (location) {
            case "/login":
                return _jsx(Login, {});
            case "/signup":
                return _jsx(Signup, {});
            case "/verify-otp":
                return _jsx(VerifyOTP, {});
            default:
                return _jsx(Login, {});
        }
    }
    // User is authenticated, show protected content
    return _jsx(_Fragment, { children: children });
}
