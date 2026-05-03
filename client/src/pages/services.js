import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ServiceCard from "@/components/service-card";
import AIChat from "@/components/ai-chat";
import { useQuery } from "@tanstack/react-query";
export default function Services() {
    const params = useParams();
    const [, setLocation] = useLocation();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(params.category || "all");
    const [sortBy, setSortBy] = useState("name");
    const [showAIChat, setShowAIChat] = useState(false);
    const [aiInitialMessage, setAiInitialMessage] = useState("");
    const { data: allServices = [], isLoading } = useQuery({
        queryKey: ["/api/services"],
    });
    // Filter and sort services
    const filteredServices = allServices
        .filter((service) => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
        return matchesSearch && matchesCategory;
    })
        .sort((a, b) => {
        switch (sortBy) {
            case "price-low":
                return a.priceMin - b.priceMin;
            case "price-high":
                return b.priceMin - a.priceMin;
            case "duration":
                return a.duration - b.duration;
            default:
                return a.name.localeCompare(b.name);
        }
    });
    const categories = [
        { value: "all", label: "All Services", count: allServices.length },
        { value: "women", label: "Women's Hair", count: allServices.filter((s) => s.category === "women").length },
        { value: "kids", label: "Kids Hair", count: allServices.filter((s) => s.category === "kids").length },
    ];
    const handleServiceAI = (service) => {
        setShowAIChat(true);
        setAiInitialMessage(`I'm interested in learning more about ${service.name}. Can you tell me more details about this service?`);
    };
    const handleServiceBook = (service) => {
        setLocation("/booking");
    };
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen pt-16 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-32 w-32 border-b-2 border-primary" }), _jsx("p", { className: "mt-4 text-muted-foreground", children: "Loading services..." })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen pt-16 bg-gradient-to-b from-[#fafafa] via-[#f8f6f0] to-[#f5f0e8]", children: [_jsx("section", { className: "py-12 gradient-hero", "data-testid": "services-header", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-4xl lg:text-5xl font-serif font-bold text-[#2c1810] mb-4", children: "Our Premium Services" }), _jsx("p", { className: "text-lg text-[#666666] max-w-2xl mx-auto", children: "Professional beauty treatments for women and children, delivered with care and expertise to your doorstep." })] }) }) }), _jsx("section", { className: "py-8 sticky top-16 z-30 border-b border-[#d4d4d4] bg-white/70 backdrop-blur", "data-testid": "services-filters", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex flex-col lg:flex-row gap-4 items-center justify-between", children: [_jsxs("div", { className: "relative flex-1 max-w-md", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" }), _jsx(Input, { placeholder: "Search services...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10 bg-[#fafafa] placeholder:text-[#999999] focus:border-[#d4af37] focus:ring-[#d4af37]/40", "data-testid": "input-search-services" })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: categories.map((category) => (_jsxs(Button, { variant: selectedCategory === category.value ? "default" : "outline", onClick: () => setSelectedCategory(category.value), className: selectedCategory === category.value ? "btn-primary" : "border-[#d4af37] text-[#8b5a3c] bg-[#fff8dc]", "data-testid": `button-category-${category.value}`, children: [category.label, _jsx(Badge, { variant: "secondary", className: "ml-2", children: category.count })] }, category.value))) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Filter, { className: "h-4 w-4 text-muted-foreground" }), _jsxs(Select, { value: sortBy, onValueChange: setSortBy, children: [_jsx(SelectTrigger, { className: "w-40", "data-testid": "select-sort-services", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "name", children: "Name A-Z" }), _jsx(SelectItem, { value: "price-low", children: "Price: Low to High" }), _jsx(SelectItem, { value: "price-high", children: "Price: High to Low" }), _jsx(SelectItem, { value: "duration", children: "Duration" })] })] })] })] }) }) }), _jsx("section", { className: "py-12", "data-testid": "services-grid", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: filteredServices.length === 0 ? (_jsxs("div", { className: "text-center py-12", "data-testid": "no-services-found", children: [_jsx("div", { className: "text-6xl mb-4", children: "\uD83D\uDC87\u200D\u2640\uFE0F" }), _jsx("h3", { className: "text-2xl font-serif font-semibold mb-2", children: "No services found" }), _jsx("p", { className: "text-muted-foreground mb-6", children: "Try adjusting your search or category filters" }), _jsx(Button, { onClick: () => {
                                    setSearchTerm("");
                                    setSelectedCategory("all");
                                }, className: "btn-primary", "data-testid": "button-clear-filters", children: "Clear Filters" })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "mb-8", children: _jsxs("p", { className: "text-muted-foreground", "data-testid": "services-count", children: ["Showing ", filteredServices.length, " service", filteredServices.length !== 1 ? 's' : '', selectedCategory !== "all" && (_jsxs("span", { children: [" in ", categories.find(c => c.value === selectedCategory)?.label] })), searchTerm && (_jsxs("span", { children: [" matching \"", searchTerm, "\""] }))] }) }), selectedCategory === "all" ? (_jsxs(_Fragment, { children: [allServices.some((s) => s.category === "women") && (_jsxs("div", { className: "mb-16", "data-testid": "women-services-section", children: [_jsxs("h2", { className: "text-3xl font-serif font-semibold text-foreground mb-8 text-center", children: [_jsx("span", { className: "text-primary", children: "\uD83D\uDC69" }), " Women's Hair Services"] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: filteredServices
                                                    .filter((service) => service.category === "women")
                                                    .map((service) => (_jsx(ServiceCard, { service: service, onAskAI: handleServiceAI, onBook: handleServiceBook }, service.id))) })] })), allServices.some((s) => s.category === "kids") && (_jsxs("div", { className: "mb-16", "data-testid": "kids-services-section", children: [_jsxs("h2", { className: "text-3xl font-serif font-semibold text-foreground mb-8 text-center", children: [_jsx("span", { className: "text-primary", children: "\uD83E\uDDD2" }), " Kids Hair Services"] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8", children: filteredServices
                                                    .filter((service) => service.category === "kids")
                                                    .map((service) => (_jsx(ServiceCard, { service: service, onAskAI: handleServiceAI, onBook: handleServiceBook }, service.id))) })] }))] })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: filteredServices.map((service) => (_jsx(ServiceCard, { service: service, onAskAI: handleServiceAI, onBook: handleServiceBook }, service.id))) }))] })) }) }), _jsx("section", { className: "py-16 bg-gradient-to-br from-white via-blue-50 to-blue-100", "data-testid": "services-cta", children: _jsxs("div", { className: "max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8", children: [_jsx("h2", { className: "text-3xl font-serif font-bold text-foreground mb-4", children: "Need Help Choosing the Right Service?" }), _jsx("p", { className: "text-lg text-muted-foreground mb-8", children: "Our AI assistant is here to help you find the perfect beauty treatment for your needs." }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [_jsx(Button, { onClick: () => setShowAIChat(true), className: "btn-primary", "data-testid": "button-ask-ai-assistant", children: "Ask AI Assistant" }), _jsx(Button, { asChild: true, className: "btn-secondary", "data-testid": "button-call-for-advice", children: _jsx("a", { href: "tel:9036626642", children: "Call for Personal Advice" }) })] })] }) }), _jsx(AIChat, { isOpen: showAIChat, onClose: () => setShowAIChat(false), initialMessage: aiInitialMessage })] }));
}
