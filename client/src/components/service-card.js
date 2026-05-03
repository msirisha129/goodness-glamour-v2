import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Clock, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
export default function ServiceCard({ service, onAskAI, onBook }) {
    const formatPrice = (min, max) => {
        if (min === max)
            return `₹${min}`;
        return `₹${min} - ₹${max}`;
    };
    const formatDuration = (minutes) => {
        if (minutes < 60)
            return `${minutes} mins`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };
    return (_jsxs(Card, { className: "service-card", "data-testid": `service-card-${service.id}`, children: [service.imageUrl && (_jsx("div", { className: "relative overflow-hidden", children: _jsx("img", { src: service.imageUrl, alt: service.name, className: "w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300", "data-testid": `service-image-${service.id}` }) })), _jsxs(CardContent, { className: "p-6", children: [_jsx("h4", { className: "text-xl font-serif font-semibold mb-2", "data-testid": `service-name-${service.id}`, children: service.name }), _jsx("p", { className: "text-muted-foreground text-sm mb-4 line-clamp-3", "data-testid": `service-description-${service.id}`, children: service.description }), _jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsxs("span", { className: "text-accent font-semibold flex items-center", "data-testid": `service-price-${service.id}`, children: [_jsx(IndianRupee, { className: "h-4 w-4 mr-1" }), formatPrice(service.priceMin, service.priceMax)] }), _jsxs("span", { className: "text-xs text-muted-foreground flex items-center", "data-testid": `service-duration-${service.id}`, children: [_jsx(Clock, { className: "h-3 w-3 mr-1" }), formatDuration(service.duration)] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Button, { onClick: () => onAskAI(service), variant: "outline", className: "w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground", "data-testid": `button-ask-ai-${service.id}`, children: "Ask AI About This Service" }), _jsx(Button, { onClick: () => onBook(service), className: "w-full btn-primary hover:bg-primary/90 transition-colors", "data-testid": `button-book-${service.id}`, type: "button", children: "Book This Service" })] })] })] }));
}
