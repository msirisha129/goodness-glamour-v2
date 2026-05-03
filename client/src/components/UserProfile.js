import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
export default function UserProfile() {
    const [, setLocation] = useLocation();
    const [user, setUser] = useState(null);
    useEffect(() => {
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);
    const handleLogout = () => {
        // Clear localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        // Redirect to login
        setLocation('/login');
    };
    if (!user) {
        return (_jsxs(Button, { onClick: () => setLocation('/login'), className: "bg-[#8B7D6B] hover:bg-[#9D8E7C] text-white", children: [_jsx(User, { className: "h-4 w-4 mr-2" }), "Sign In"] }));
    }
    return (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", className: "relative h-10 w-10 rounded-full", children: _jsxs(Avatar, { className: "h-10 w-10", children: [_jsx(AvatarImage, { src: user.profilePicture, alt: user.name }), _jsx(AvatarFallback, { className: "bg-[#8B7D6B] text-white", children: user.name.charAt(0).toUpperCase() })] }) }) }), _jsxs(DropdownMenuContent, { className: "w-56", align: "end", forceMount: true, children: [_jsx(DropdownMenuLabel, { className: "font-normal", children: _jsxs("div", { className: "flex flex-col space-y-1", children: [_jsx("p", { className: "text-sm font-medium leading-none", children: user.name }), _jsx("p", { className: "text-xs leading-none text-muted-foreground", children: user.email })] }) }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: () => setLocation('/my-bookings'), className: "cursor-pointer", children: [_jsx(User, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "My Bookings" })] }), _jsxs(DropdownMenuItem, { onClick: () => setLocation('/profile'), className: "cursor-pointer", children: [_jsx(Settings, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "Settings" })] }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: handleLogout, className: "cursor-pointer text-red-600 focus:text-red-600", children: [_jsx(LogOut, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "Log out" })] })] })] }));
}
