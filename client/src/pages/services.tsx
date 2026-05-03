import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ServiceCard from "@/components/service-card";
import AIChat from "@/components/ai-chat";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Service } from "@shared/schema";

export default function Services() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(params.category || "all");
  const [sortBy, setSortBy] = useState("name");
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiInitialMessage, setAiInitialMessage] = useState("");

  const { data: allServices = [], isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
    refetchInterval: 5000, // Refetch every 5 seconds to get updates
  });

  // Subscribe to realtime service updates
  useEffect(() => {
    const es = new EventSource(`/api/events`);
    es.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data || '{}');
        if (data?.type === 'service_created' || data?.type === 'service_updated' || data?.type === 'service_deleted') {
          console.log('🔄 Service update detected:', data.type);
          queryClient.invalidateQueries({ queryKey: ["/api/services"] });
        }
      } catch (_e) {}
    };
    return () => {
      es.close();
    };
  }, [queryClient]);

  // Filter and sort services
  const filteredServices = allServices
    .filter((service: Service) => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a: Service, b: Service) => {
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
    { value: "women", label: "Women's Hair", count: allServices.filter((s: Service) => s.category === "women").length },
    { value: "kids", label: "Kids Hair", count: allServices.filter((s: Service) => s.category === "kids").length },
  ];

  const handleServiceAI = (service: Service) => {
    setShowAIChat(true);
    setAiInitialMessage(`I'm interested in learning more about ${service.name}. Can you tell me more details about this service?`);
  };

  const handleServiceBook = (service: Service) => {
    setLocation("/booking");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-[#fafafa] via-[#f8f6f0] to-[#f5f0e8]">
      {/* Header */}
      <section className="py-12 gradient-hero" data-testid="services-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-[#2c1810] mb-4">
              Our Premium Services
            </h1>
            <p className="text-lg text-[#666666] max-w-2xl mx-auto">
              Professional beauty treatments for women and children, delivered with care and expertise to your doorstep.
            </p>
            
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 sticky top-16 z-30 border-b border-[#d4d4d4] bg-white/70 backdrop-blur" data-testid="services-filters">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#fafafa] placeholder:text-[#999999] focus:border-[#d4af37] focus:ring-[#d4af37]/40"
                data-testid="input-search-services"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.value)}
                  className={selectedCategory === category.value ? "btn-primary" : "border-[#d4af37] text-[#8b5a3c] bg-[#fff8dc]"}
                  data-testid={`button-category-${category.value}`}
                >
                  {category.label}
                  <Badge variant="secondary" className="ml-2">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40" data-testid="select-sort-services">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12" data-testid="services-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredServices.length === 0 ? (
            <div className="text-center py-12" data-testid="no-services-found">
              <div className="text-6xl mb-4">💇‍♀️</div>
              <h3 className="text-2xl font-serif font-semibold mb-2">No services found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or category filters
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="btn-primary"
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              {/* Results count */}
              <div className="mb-8">
                <p className="text-muted-foreground" data-testid="services-count">
                  Showing {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
                  {selectedCategory !== "all" && (
                    <span> in {categories.find(c => c.value === selectedCategory)?.label}</span>
                  )}
                  {searchTerm && (
                    <span> matching "{searchTerm}"</span>
                  )}
                </p>
              </div>

              {/* Services by category */}
              {selectedCategory === "all" ? (
                <>
                  {/* Women's Services */}
                  {allServices.some((s: Service) => s.category === "women") && (
                    <div className="mb-16" data-testid="women-services-section">
                      <h2 className="text-3xl font-serif font-semibold text-foreground mb-8 text-center">
                        <span className="text-primary">👩</span> Women's Hair Services
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredServices
                          .filter((service: Service) => service.category === "women")
                          .map((service: Service) => (
                            <ServiceCard
                              key={service.id}
                              service={service}
                              onAskAI={handleServiceAI}
                              onBook={handleServiceBook}
                            />
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Kids Services */}
                  {allServices.some((s: Service) => s.category === "kids") && (
                    <div className="mb-16" data-testid="kids-services-section">
                      <h2 className="text-3xl font-serif font-semibold text-foreground mb-8 text-center">
                        <span className="text-primary">🧒</span> Kids Hair Services
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredServices
                          .filter((service: Service) => service.category === "kids")
                          .map((service: Service) => (
                            <ServiceCard
                              key={service.id}
                              service={service}
                              onAskAI={handleServiceAI}
                              onBook={handleServiceBook}
                            />
                          ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredServices.map((service: Service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onAskAI={handleServiceAI}
                      onBook={handleServiceBook}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-white via-blue-50 to-blue-100" data-testid="services-cta">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
            Need Help Choosing the Right Service?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Our AI assistant is here to help you find the perfect beauty treatment for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setShowAIChat(true)}
              className="btn-primary"
              data-testid="button-ask-ai-assistant"
            >
              Ask AI Assistant
            </Button>
            <Button 
              asChild
              className="btn-secondary"
              data-testid="button-call-for-advice"
            >
              <a href="tel:9036626642">Call for Personal Advice</a>
            </Button>
          </div>
        </div>
      </section>

      {/* AI Chat Modal */}
      <AIChat
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        initialMessage={aiInitialMessage}
      />
    </div>
  );
}
