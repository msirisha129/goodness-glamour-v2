import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowLeft, QrCode, Smartphone, Camera, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
export default function ScanQR() {
    const [, setLocation] = useLocation();
    return (_jsxs("div", { className: "min-h-screen pt-16 bg-background", children: [_jsx("section", { className: "py-8 gradient-hero", children: _jsxs("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsx("div", { className: "flex items-center mb-4", children: _jsxs(Button, { variant: "ghost", onClick: () => setLocation("/"), className: "mr-4", "data-testid": "button-back-home", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back to Home"] }) }), _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-4xl font-serif font-bold text-foreground mb-4", children: "How to Scan QR Code" }), _jsx("p", { className: "text-lg text-muted-foreground", children: "Get started with Goodness Glamour in just a few simple steps" })] })] }) }), _jsx("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [_jsx(Card, { className: "p-8 text-center", children: _jsxs(CardContent, { children: [_jsx("div", { className: "flex items-center justify-center mb-6", children: _jsx("div", { className: "w-48 h-48 bg-white border-2 border-primary/20 rounded-2xl flex items-center justify-center shadow-xl", children: _jsx("img", { src: "/qr-code.png", alt: "QR Code to visit Goodness Glamour website", className: "w-44 h-44 rounded-xl" }) }) }), _jsx("h3", { className: "text-2xl font-serif font-semibold mb-3 text-foreground", children: "Scan This QR Code" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "Point your phone camera at this QR code to instantly access our website" }), _jsxs(Badge, { className: "bg-primary text-primary-foreground px-4 py-2", children: [_jsx(Smartphone, { className: "h-4 w-4 mr-2" }), "Mobile Friendly"] })] }) }), _jsxs("div", { className: "space-y-6", children: [_jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("h3", { className: "text-2xl font-serif font-semibold mb-4 flex items-center", children: [_jsx(Camera, { className: "h-6 w-6 mr-3 text-primary" }), "How to Scan"] }), _jsx("div", { className: "space-y-4", children: [
                                                    {
                                                        step: "1",
                                                        title: "Open Camera App",
                                                        description: "Open your phone's camera app or any QR code scanner"
                                                    },
                                                    {
                                                        step: "2",
                                                        title: "Point at QR Code",
                                                        description: "Point your camera at the QR code above or on our flyers"
                                                    },
                                                    {
                                                        step: "3",
                                                        title: "Tap Notification",
                                                        description: "Tap the notification that appears to open our website"
                                                    },
                                                    {
                                                        step: "4",
                                                        title: "Start Browsing",
                                                        description: "Explore our services and book your appointment"
                                                    }
                                                ].map((item, index) => (_jsxs("div", { className: "flex items-start space-x-4", children: [_jsx("div", { className: "w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0", children: _jsx("span", { className: "text-primary-foreground font-semibold text-sm", children: item.step }) }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-foreground mb-1", children: item.title }), _jsx("p", { className: "text-muted-foreground text-sm", children: item.description })] })] }, index))) })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("h3", { className: "text-xl font-serif font-semibold mb-4 flex items-center", children: [_jsx(Star, { className: "h-5 w-5 mr-2 text-accent" }), "What Happens Next?"] }), _jsx("div", { className: "space-y-3", children: [
                                                    "Browse our premium beauty services",
                                                    "Chat with our AI assistant for recommendations",
                                                    "Book appointments with ease",
                                                    "Get doorstep service at your location"
                                                ].map((item, index) => (_jsxs("div", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mr-3 flex-shrink-0" }), _jsx("span", { className: "text-muted-foreground", children: item })] }, index))) })] }) }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsxs(Button, { onClick: () => setLocation("/services"), className: "btn-primary flex items-center justify-center flex-1", children: [_jsx(QrCode, { className: "h-4 w-4 mr-2" }), "Browse Services"] }), _jsxs(Button, { onClick: () => setLocation("/booking"), className: "btn-accent flex items-center justify-center flex-1", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-2" }), "Book Appointment"] })] })] })] }) })] }));
}
