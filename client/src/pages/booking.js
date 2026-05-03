import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useLocation } from "wouter";
import { Calendar, Clock, User, Phone, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
const createBookingSchema = (isAuthenticated) => z.object({
    customerName: isAuthenticated ? z.string().optional() : z.string().min(2, "Name must be at least 2 characters"),
    customerPhone: isAuthenticated ? z.string().optional() : z.string().min(10, "Phone number must be at least 10 digits"),
    customerEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
    customerAddress: isAuthenticated ? z.string().optional() : z.string().min(10, "Please provide a complete address"),
    appointmentDate: z.string().min(1, "Please select a date"),
    appointmentTime: z.string().min(1, "Please select a time"),
    notes: z.string().optional(),
});
export default function Booking() {
    const [, setLocation] = useLocation();
    const [selectedServices, setSelectedServices] = useState([]);
    const [currentStep, setCurrentStep] = useState("services");
    const [bookingId, setBookingId] = useState(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();
    // Check if user is authenticated
    const token = localStorage.getItem("authToken");
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const isAuthenticated = token && user && user.isVerified;
    // Create dynamic schema and type based on authentication status
    const bookingSchema = createBookingSchema(isAuthenticated);
    const { data: services = [], isLoading } = useQuery({
        queryKey: ["/api/services"],
    });
    const form = useForm({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            customerName: user?.name || "",
            customerPhone: user?.phone || "",
            customerEmail: user?.email || "",
            customerAddress: "Doorstep Service",
            appointmentDate: "",
            appointmentTime: "",
            notes: "",
        },
    });
    const createCustomerMutation = useMutation({
        mutationFn: async (customerData) => {
            const response = await apiRequest("POST", "/api/customers", customerData);
            return response.json();
        },
    });
    const createBookingMutation = useMutation({
        mutationFn: async (bookingData) => {
            const response = await apiRequest("POST", "/api/bookings", bookingData);
            return response.json();
        },
        onSuccess: (data) => {
            setBookingId(data.id);
            setCurrentStep("confirmation");
            queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
            toast({
                title: "Booking Confirmed!",
                description: "Your appointment has been successfully scheduled.",
            });
        },
        onError: (error) => {
            toast({
                title: "Booking Failed",
                description: "Unable to create booking. Please try again.",
                variant: "destructive",
            });
        },
    });
    const createUserBookingMutation = useMutation({
        mutationFn: async (bookingData) => {
            const token = localStorage.getItem("authToken");
            const response = await fetch("/api/user/bookings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(bookingData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create booking");
            }
            return response.json();
        },
        onSuccess: (data) => {
            setBookingId(data.id);
            setCurrentStep("confirmation");
            queryClient.invalidateQueries({ queryKey: ["/api/user/bookings"] });
            toast({
                title: "Booking Confirmed!",
                description: "Your appointment has been successfully scheduled and added to your bookings.",
            });
        },
        onError: (error) => {
            toast({
                title: "Booking Failed",
                description: error.message || "Unable to create booking. Please try again.",
                variant: "destructive",
            });
        },
    });
    const handleServiceToggle = (service) => {
        setSelectedServices(prev => {
            const exists = prev.find(s => s.id === service.id);
            if (exists) {
                return prev.filter(s => s.id !== service.id);
            }
            else {
                return [...prev, service];
            }
        });
    };
    const calculateTotal = () => {
        return selectedServices.reduce((total, service) => total + service.priceMin, 0);
    };
    const calculateDuration = () => {
        return selectedServices.reduce((total, service) => total + service.duration, 0);
    };
    const formatDuration = (minutes) => {
        if (minutes < 60)
            return `${minutes} mins`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour <= 20; hour++) {
            for (let minute of [0, 30]) {
                if (hour === 20 && minute === 30)
                    break;
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(time);
            }
        }
        return slots;
    };
    const getNextSevenDays = () => {
        const dates = [];
        for (let i = 1; i <= 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            dates.push({
                value: date.toISOString().split('T')[0],
                label: date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric'
                }),
            });
        }
        return dates;
    };
    const onSubmit = async (data) => {
        if (selectedServices.length === 0) {
            toast({
                title: "No Services Selected",
                description: "Please select at least one service to continue.",
                variant: "destructive",
            });
            return;
        }
        try {
            const appointmentDateTime = new Date(`${data.appointmentDate}T${data.appointmentTime}`);
            if (isAuthenticated) {
                // For authenticated users, create booking directly linked to user
                await createUserBookingMutation.mutateAsync({
                    serviceIds: selectedServices.map(s => s.id),
                    appointmentDate: appointmentDateTime.toISOString(),
                    notes: data.notes || null,
                });
            }
            else {
                // For non-authenticated users, create customer first then booking
                const customer = await createCustomerMutation.mutateAsync({
                    name: data.customerName,
                    phone: data.customerPhone,
                    email: data.customerEmail || null,
                    address: data.customerAddress,
                });
                await createBookingMutation.mutateAsync({
                    customerId: customer.id,
                    serviceIds: selectedServices.map(s => s.id),
                    appointmentDate: appointmentDateTime.toISOString(),
                    notes: data.notes || null,
                });
            }
        }
        catch (error) {
            console.error("Booking error:", error);
        }
    };
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen pt-16 flex items-center justify-center bg-[#F9F5F0]", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-32 w-32 border-b-2 border-[#C9A58B]" }), _jsx("p", { className: "mt-4 text-[#8B7D6B]", children: "Loading booking form..." })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-[#F9F5F0]", children: [_jsx("section", { className: "pt-16 bg-gradient-to-b from-[#F5F0E8] to-[#FAF7F2]", "data-testid": "booking-header", children: _jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16", children: [_jsx("div", { className: "flex items-center mb-4", children: _jsxs(Button, { variant: "ghost", onClick: () => setLocation("/"), className: "mr-4 text-[#8B7D6B] hover:text-[#C9A58B] hover:bg-[#C9A58B]/10 transition-all duration-300", "data-testid": "button-back-home", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back to Home"] }) }), _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-4xl lg:text-5xl font-serif font-bold text-[#6B5D52] mb-3", children: "Book Your Appointment" }), _jsx("p", { className: "text-lg text-black max-w-2xl mx-auto", children: "Schedule your premium doorstep beauty service in just a few steps" })] })] }) }), _jsx("section", { className: "py-8 bg-white border-b border-[#E8DDD0]", "data-testid": "booking-progress", children: _jsx("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsx("div", { className: "bg-white border border-[#E8DDD0] rounded-full p-4 shadow-md", children: _jsx("div", { className: "flex items-center justify-center space-x-12", children: [
                                { step: "services", label: "Select Services", icon: CheckCircle },
                                { step: "details", label: "Booking Details", icon: User },
                                { step: "confirmation", label: "Confirmation", icon: CheckCircle },
                            ].map(({ step, label, icon: Icon }, index) => (_jsxs("div", { className: "flex items-center", "data-testid": `step-${step}`, children: [_jsx("div", { className: `flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${currentStep === step
                                            ? "bg-[#8B7D6B] border-[#8B7D6B] text-white shadow-lg"
                                            : index < (currentStep === "details" ? 1 : currentStep === "confirmation" ? 2 : 0)
                                                ? "bg-[#C9A58B] border-[#C9A58B] text-white shadow-md"
                                                : "border-[#E8DDD0] bg-[#E8DDD0] text-[#A39689]"}`, children: _jsx(Icon, { className: "h-5 w-5" }) }), _jsx("span", { className: `ml-3 font-semibold text-sm transition-colors duration-300 ${currentStep === step ? "text-[#6B5D52]" : index < (currentStep === "details" ? 1 : currentStep === "confirmation" ? 2 : 0) ? "text-[#8B7D6B]" : "text-[#A39689]"}`, children: label }), index < 2 && (_jsx("div", { className: `ml-12 w-12 h-1 rounded-full transition-colors duration-300 ${index < (currentStep === "details" ? 1 : currentStep === "confirmation" ? 2 : 0)
                                            ? "bg-[#C9A58B]"
                                            : "bg-[#E8DDD0]"}` }))] }, step))) }) }) }) }), _jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [currentStep === "services" && (_jsxs(Card, { className: "bg-white shadow-xl border border-[#E8DDD0] rounded-2xl", "data-testid": "step-services", children: [_jsxs(CardHeader, { className: "p-10", children: [_jsxs(CardTitle, { className: "text-3xl font-serif font-bold text-[#6B5D52]", children: ["Select Your Services", _jsx("div", { className: "w-16 h-0.5 bg-[#C9A58B] mt-2 rounded-full" })] }), _jsx("p", { className: "text-black text-base mt-3", children: "Choose from our premium beauty treatments" })] }), _jsxs(CardContent, { className: "p-10 space-y-10", children: [_jsxs("div", { children: [_jsx("div", { className: "bg-[#F5F0E8] border-l-4 border-l-[#C9A58B] px-4 py-3 rounded-lg mb-6", children: _jsxs("h3", { className: "text-xl font-serif font-bold text-[#8B7D6B] flex items-center", children: [_jsx("span", { className: "text-2xl mr-3", children: "\uD83D\uDC69" }), "Women's Hair Services"] }) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: services
                                                    .filter((service) => service.category === "women")
                                                    .map((service) => (_jsxs("div", { onClick: () => handleServiceToggle(service), className: `p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${selectedServices.find(s => s.id === service.id)
                                                        ? "border-[#C9A58B] bg-[#FAF7F2] shadow-lg"
                                                        : "border-[#E8DDD0] bg-white hover:border-[#C9A58B] hover:shadow-md"}`, "data-testid": `service-option-${service.id}`, children: [_jsxs("div", { className: "flex justify-between items-start mb-3", children: [_jsx("h4", { className: "font-semibold text-[#6B5D52] text-lg", children: service.name }), _jsxs("div", { className: "text-xl font-bold text-[#C9A58B]", children: ["\u20B9", service.priceMin] })] }), _jsx("p", { className: "text-sm text-black mb-4 leading-relaxed", children: service.description }), _jsxs("div", { className: "flex items-center text-sm text-black", children: [_jsx(Clock, { className: "h-4 w-4 mr-2 text-[#C9A58B]" }), formatDuration(service.duration)] })] }, service.id))) })] }), _jsxs("div", { children: [_jsx("div", { className: "bg-[#F5F0E8] border-l-4 border-l-[#C9A58B] px-4 py-3 rounded-lg mb-6", children: _jsxs("h3", { className: "text-xl font-serif font-bold text-[#8B7D6B] flex items-center", children: [_jsx("span", { className: "text-2xl mr-3", children: "\uD83E\uDDD2" }), "Kids Hair Services"] }) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: services
                                                    .filter((service) => service.category === "kids")
                                                    .map((service) => (_jsxs("div", { onClick: () => handleServiceToggle(service), className: `p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${selectedServices.find(s => s.id === service.id)
                                                        ? "border-[#C9A58B] bg-[#FAF7F2] shadow-lg"
                                                        : "border-[#E8DDD0] bg-white hover:border-[#C9A58B] hover:shadow-md"}`, "data-testid": `service-option-${service.id}`, children: [_jsxs("div", { className: "flex justify-between items-start mb-3", children: [_jsx("h4", { className: "font-semibold text-[#6B5D52] text-lg", children: service.name }), _jsxs("div", { className: "text-xl font-bold text-[#C9A58B]", children: ["\u20B9", service.priceMin] })] }), _jsx("p", { className: "text-sm text-black mb-4 leading-relaxed", children: service.description }), _jsxs("div", { className: "flex items-center text-sm text-black", children: [_jsx(Clock, { className: "h-4 w-4 mr-2 text-[#C9A58B]" }), formatDuration(service.duration)] })] }, service.id))) })] }), selectedServices.length > 0 && (_jsx(Card, { className: "bg-[#FAF7F2] border-2 border-[#C9A58B] shadow-lg", children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("h4", { className: "font-semibold mb-4 text-[#6B5D52] text-lg", children: ["Selected Services (", selectedServices.length, ")"] }), _jsx("div", { className: "space-y-3 mb-6", children: selectedServices.map((service) => (_jsxs("div", { className: "flex justify-between items-center p-3 bg-white rounded-lg border border-[#E8DDD0]", children: [_jsx("span", { className: "text-sm font-medium text-black", children: service.name }), _jsxs("span", { className: "text-sm font-bold text-[#C9A58B]", children: ["\u20B9", service.priceMin] })] }, service.id))) }), _jsx("div", { className: "w-full h-px bg-[#E8DDD0] mb-4" }), _jsxs("div", { className: "flex justify-between items-center font-bold mb-2", children: [_jsx("span", { className: "text-[#6B5D52]", children: "Total Amount:" }), _jsxs("span", { className: "text-[#C9A58B] text-xl", children: ["\u20B9", calculateTotal()] })] }), _jsxs("div", { className: "flex justify-between items-center text-sm text-[#8B7D6B]", children: [_jsx("span", { children: "Estimated Duration:" }), _jsx("span", { className: "font-medium", children: formatDuration(calculateDuration()) })] })] }) })), _jsx("div", { className: "flex justify-center mt-8", children: _jsx(Button, { onClick: () => setCurrentStep("details"), disabled: selectedServices.length === 0, className: "bg-[#8B7D6B] hover:bg-[#9D8E7C] text-white px-8 py-4 rounded-xl font-bold text-lg tracking-wide shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed", "data-testid": "button-continue-to-details", children: "Continue to Booking Details" }) })] })] })), currentStep === "details" && (_jsxs(Card, { className: "bg-white shadow-xl border border-[#E8DDD0] rounded-2xl", "data-testid": "step-details", children: [_jsxs(CardHeader, { className: "p-10", children: [_jsxs(CardTitle, { className: "text-3xl font-serif font-bold text-[#6B5D52]", children: ["Booking Details", _jsx("div", { className: "w-16 h-0.5 bg-[#C9A58B] mt-2 rounded-full" })] }), _jsx("p", { className: "text-black text-base mt-3", children: "Please provide your information and preferred appointment time" })] }), _jsx(CardContent, { className: "p-10", children: _jsx(Form, { ...form, children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-8", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("h3", { className: "text-xl font-semibold flex items-center text-[#6B5D52]", children: [_jsx(User, { className: "h-6 w-6 mr-3 text-[#C9A58B]" }), isAuthenticated ? "Your Information" : "Customer Information"] }), isAuthenticated ? (_jsxs("div", { className: "bg-[#FAF7F2] border-2 border-[#C9A58B] rounded-xl p-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 bg-[#C9A58B] rounded-full flex items-center justify-center", children: _jsx(User, { className: "h-6 w-6 text-white" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-[#6B5D52] text-lg", children: user.name }), _jsx("p", { className: "text-sm text-black", children: user.email }), user.phone && _jsx("p", { className: "text-sm text-black", children: user.phone })] })] }), _jsxs("p", { className: "text-sm text-black mt-3 flex items-center", children: [_jsx("span", { className: "text-[#C9A58B] mr-2", children: "\u2713" }), "Using your account information for booking"] })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(FormField, { control: form.control, name: "customerName", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Full Name *" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "Enter your full name", ...field, "data-testid": "input-customer-name" }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "customerPhone", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Phone Number *" }), _jsx(FormControl, { children: _jsx(Input, { type: "tel", placeholder: "Enter your phone number", ...field, "data-testid": "input-customer-phone" }) }), _jsx(FormMessage, {})] })) })] }), _jsx(FormField, { control: form.control, name: "customerEmail", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Email Address" }), _jsx(FormControl, { children: _jsx(Input, { type: "email", placeholder: "Enter your email (optional)", ...field, "data-testid": "input-customer-email" }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "customerAddress", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Complete Address *" }), _jsx(FormControl, { children: _jsx(Textarea, { placeholder: "Enter your complete address for doorstep service", className: "h-24", ...field, "data-testid": "textarea-customer-address" }) }), _jsx(FormMessage, {})] })) })] }))] }), _jsx("div", { className: "w-full h-px bg-[#E8DDD0]" }), _jsxs("div", { className: "space-y-6", children: [_jsxs("h3", { className: "text-xl font-semibold flex items-center text-[#6B5D52]", children: [_jsx(Calendar, { className: "h-6 w-6 mr-3 text-[#C9A58B]" }), "Appointment Scheduling"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(FormField, { control: form.control, name: "appointmentDate", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Preferred Date *" }), _jsxs(Select, { onValueChange: field.onChange, value: field.value, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { "data-testid": "select-appointment-date", children: _jsx(SelectValue, { placeholder: "Select appointment date" }) }) }), _jsx(SelectContent, { children: getNextSevenDays().map((date) => (_jsx(SelectItem, { value: date.value, children: date.label }, date.value))) })] }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "appointmentTime", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Preferred Time *" }), _jsxs(Select, { onValueChange: field.onChange, value: field.value, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { "data-testid": "select-appointment-time", children: _jsx(SelectValue, { placeholder: "Select appointment time" }) }) }), _jsx(SelectContent, { children: generateTimeSlots().map((time) => (_jsx(SelectItem, { value: time, children: time }, time))) })] }), _jsx(FormMessage, {})] })) })] }), _jsx(FormField, { control: form.control, name: "notes", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Special Instructions" }), _jsx(FormControl, { children: _jsx(Textarea, { placeholder: "Any special requirements or notes for the stylist", className: "h-20", ...field, "data-testid": "textarea-booking-notes" }) }), _jsx(FormMessage, {})] })) })] }), _jsx("div", { className: "w-full h-px bg-[#E8DDD0]" }), _jsx(Card, { className: "bg-[#FAF7F2] border-2 border-[#C9A58B] shadow-lg", children: _jsxs(CardContent, { className: "p-6", children: [_jsx("h4", { className: "font-semibold mb-4 text-[#6B5D52] text-lg", children: "Booking Summary" }), _jsx("div", { className: "space-y-3 mb-6", children: selectedServices.map((service) => (_jsxs("div", { className: "flex justify-between items-center p-3 bg-white rounded-lg border border-[#E8DDD0]", children: [_jsx("span", { className: "text-sm font-medium text-black", children: service.name }), _jsxs("span", { className: "text-sm font-bold text-[#C9A58B]", children: ["\u20B9", service.priceMin] })] }, service.id))) }), _jsx("div", { className: "w-full h-px bg-[#E8DDD0] mb-4" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center font-bold", children: [_jsx("span", { className: "text-[#6B5D52]", children: "Total Amount:" }), _jsxs("span", { className: "text-[#C9A58B] text-xl", children: ["\u20B9", calculateTotal()] })] }), _jsxs("div", { className: "flex justify-between items-center text-sm text-black", children: [_jsx("span", { children: "Estimated Duration:" }), _jsx("span", { className: "font-medium", children: formatDuration(calculateDuration()) })] })] })] }) }), _jsxs("div", { className: "flex justify-between mt-8", children: [_jsxs(Button, { type: "button", variant: "outline", onClick: () => setCurrentStep("services"), className: "border-2 border-[#8B7D6B] text-[#8B7D6B] hover:bg-[#8B7D6B] hover:text-white transition-all duration-300 px-6 py-3 rounded-lg", "data-testid": "button-back-to-services", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back to Services"] }), _jsx(Button, { type: "submit", disabled: createCustomerMutation.isPending || createBookingMutation.isPending, className: "bg-[#8B7D6B] hover:bg-[#9D8E7C] text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50", "data-testid": "button-confirm-booking", children: createCustomerMutation.isPending || createBookingMutation.isPending ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }), "Processing..."] })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-2" }), "Confirm Booking"] })) })] })] }) }) })] })), currentStep === "confirmation" && bookingId && (_jsx(Card, { className: "text-center bg-white shadow-xl border border-[#E8DDD0] rounded-2xl", "data-testid": "step-confirmation", children: _jsxs(CardContent, { className: "p-10", children: [_jsx("div", { className: "w-24 h-24 bg-[#A8C9A5] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg", children: _jsx(CheckCircle, { className: "h-12 w-12 text-white" }) }), _jsx("h2", { className: "text-3xl font-serif font-bold text-[#6B5D52] mb-4", children: "Booking Confirmed!" }), _jsx("p", { className: "text-lg text-black mb-8 max-w-2xl mx-auto", children: "Your appointment has been successfully scheduled. We'll contact you shortly to confirm the details." }), _jsx(Card, { className: "bg-[#FAF7F2] border-2 border-[#C9A58B] mb-8 shadow-lg", children: _jsxs(CardContent, { className: "p-6", children: [_jsx("h4", { className: "font-semibold mb-4 text-[#6B5D52] text-lg", children: "Booking Details" }), _jsxs("div", { className: "space-y-3 text-sm", children: [_jsxs("div", { className: "flex justify-between p-3 bg-white rounded-lg border border-[#E8DDD0]", children: [_jsx("span", { className: "text-black", children: "Booking ID:" }), _jsx("span", { className: "font-mono text-[#6B5D52] font-medium", children: bookingId })] }), _jsxs("div", { className: "flex justify-between p-3 bg-white rounded-lg border border-[#E8DDD0]", children: [_jsx("span", { className: "text-black", children: "Services:" }), _jsxs("span", { className: "text-[#6B5D52] font-medium", children: [selectedServices.length, " service(s)"] })] }), _jsxs("div", { className: "flex justify-between p-3 bg-white rounded-lg border border-[#E8DDD0]", children: [_jsx("span", { className: "text-black", children: "Total Amount:" }), _jsxs("span", { className: "font-bold text-[#C9A58B] text-lg", children: ["\u20B9", calculateTotal()] })] }), _jsxs("div", { className: "flex justify-between p-3 bg-white rounded-lg border border-[#E8DDD0]", children: [_jsx("span", { className: "text-black", children: "Estimated Duration:" }), _jsx("span", { className: "text-[#6B5D52] font-medium", children: formatDuration(calculateDuration()) })] })] })] }) }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-center text-sm text-black", children: [_jsx(Phone, { className: "h-4 w-4 mr-2 text-[#C9A58B]" }), _jsx("span", { children: "We'll call you at the provided number for confirmation" })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [_jsx(Button, { onClick: () => setLocation("/"), className: "bg-[#8B7D6B] hover:bg-[#9D8E7C] text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300", "data-testid": "button-back-home", children: "Back to Home" }), _jsx(Button, { asChild: true, variant: "outline", className: "border-2 border-[#8B7D6B] text-[#8B7D6B] hover:bg-[#8B7D6B] hover:text-white transition-all duration-300", "data-testid": "button-call-salon", children: _jsxs("a", { href: "tel:9036626642", children: [_jsx(Phone, { className: "h-4 w-4 mr-2" }), "Call Salon"] }) })] })] })] }) }))] }), _jsx("section", { className: "py-20 bg-gradient-to-r from-[#F5F0E8] to-[#E8DDD0]", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center", children: [_jsx("h2", { className: "text-3xl lg:text-4xl font-serif font-bold text-[#6B5D52] mb-4", children: "Ready to Experience Beauty at Your Doorstep?" }), _jsx("p", { className: "text-lg text-black mb-8 max-w-2xl mx-auto", children: "Book your appointment today and let our professional stylists bring luxury salon services to your home." }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [_jsx(Button, { onClick: () => setLocation("/"), className: "bg-[#C9A58B] hover:bg-[#B89479] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02]", children: "Explore More Services" }), _jsx(Button, { asChild: true, variant: "outline", className: "border-2 border-[#8B7D6B] text-[#8B7D6B] hover:bg-[#8B7D6B] hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300", children: _jsxs("a", { href: "tel:9036626642", children: [_jsx(Phone, { className: "h-5 w-5 mr-2" }), "Call Us: 9036626642"] }) })] })] }) })] }));
}
