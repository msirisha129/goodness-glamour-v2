import { Clock, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Service } from "@shared/schema";

interface ServiceCardProps {
  service: Service;
  onAskAI: (service: Service) => void;
  onBook: (service: Service) => void;
}

export default function ServiceCard({ service, onAskAI, onBook }: ServiceCardProps) {
  const formatPrice = (min: number, max: number) => {
    if (min === max) return `₹${min}`;
    return `₹${min} - ₹${max}`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Card className="service-card" data-testid={`service-card-${service.id}`}>
      {service.imageUrl && (
        <div className="relative overflow-hidden">
          <img 
            src={service.imageUrl} 
            alt={service.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            data-testid={`service-image-${service.id}`}
          />
        </div>
      )}
      
      <CardContent className="p-6">
        <h4 className="text-xl font-serif font-semibold mb-2" data-testid={`service-name-${service.id}`}>
          {service.name}
        </h4>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3" data-testid={`service-description-${service.id}`}>
          {service.description}
        </p>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-accent font-semibold flex items-center" data-testid={`service-price-${service.id}`}>
            <IndianRupee className="h-4 w-4 mr-1" />
            {formatPrice(service.priceMin, service.priceMax)}
          </span>
          <span className="text-xs text-muted-foreground flex items-center" data-testid={`service-duration-${service.id}`}>
            <Clock className="h-3 w-3 mr-1" />
            {formatDuration(service.duration)}
          </span>
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={() => onAskAI(service)}
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            data-testid={`button-ask-ai-${service.id}`}
          >
            Ask AI About This Service
          </Button>
          
          <Button 
            onClick={() => onBook(service)}
            className="w-full btn-primary hover:bg-primary/90 transition-colors"
            data-testid={`button-book-${service.id}`}
            type="button"
          >
            Book This Service
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
