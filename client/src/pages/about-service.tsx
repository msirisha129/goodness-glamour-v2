import { ArrowLeft, Home, Clock, Shield, Star, CheckCircle, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

export default function AboutService() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen pt-16 bg-background">
      {/* Header */}
      <section className="py-8 gradient-hero">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/")}
              className="mr-4"
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
              Doorstep Service Experience
            </h1>
            <p className="text-lg text-muted-foreground">
              Experience luxury salon services in the comfort of your own home
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Home className="h-12 w-12 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
            Premium Beauty Services at Your Doorstep
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our professional stylists bring the complete salon experience to your home with all necessary equipment, 
            premium products, and personalized attention for you and your family.
          </p>
        </div>

        {/* Service Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {[
            {
              icon: Clock,
              title: "Flexible Timing",
              description: "Book appointments at your convenience, including evenings and weekends",
              color: "bg-primary"
            },
            {
              icon: Shield,
              title: "Safe & Hygienic",
              description: "All equipment is sanitized and our stylists follow strict hygiene protocols",
              color: "bg-accent"
            },
            {
              icon: Star,
              title: "Premium Experience",
              description: "Professional-grade products and equipment for salon-quality results",
              color: "bg-primary"
            }
          ].map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-serif font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* What to Expect */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <h3 className="text-2xl font-serif font-semibold mb-6 text-center">
              What to Expect During Your Service
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Before We Arrive
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Confirmation call 30 minutes before arrival</li>
                  <li>• Professional stylist with full equipment setup</li>
                  <li>• All necessary products and tools brought to your home</li>
                  <li>• Clean, organized workspace preparation</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 mr-2" />
                  During Your Service
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Personalized consultation and service</li>
                  <li>• Professional techniques and premium products</li>
                  <li>• Comfortable home environment</li>
                  <li>• Family-friendly atmosphere for kids' services</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Areas */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <h3 className="text-2xl font-serif font-semibold mb-6 text-center">
              Service Areas & Coverage
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4">We Serve Across the City</h4>
                <div className="space-y-2 text-muted-foreground">
                  <p>• Home visits within city limits</p>
                  <p>• Flexible timing to suit your schedule</p>
                  <p>• Minimum 2-hour advance booking required</p>
                  <p>• Emergency services available on request</p>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Service Requirements</h4>
                <div className="space-y-2 text-muted-foreground">
                  <p>• Access to power outlet for equipment</p>
                  <p>• Adequate lighting and space</p>
                  <p>• Water access for hair washing services</p>
                  <p>• Comfortable seating arrangement</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testimonials */}
        <div className="mb-12">
          <h3 className="text-2xl font-serif font-semibold mb-8 text-center">
            What Our Customers Say
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Priya Sharma",
                service: "Hair Spa & Kids Haircut",
                rating: 5,
                review: "Amazing service! The stylist was so professional and my daughter loved her haircut. The convenience of home service is unbeatable!"
              },
              {
                name: "Anita Desai",
                service: "Bridal Hair Styling",
                rating: 5,
                review: "Perfect for my wedding day! The stylist arrived on time with everything needed. I felt like a princess in my own home."
              },
              {
                name: "Rashmi Patel",
                service: "Hair Treatment",
                rating: 5,
                review: "Professional service and great results. The stylist explained everything and used premium products. Highly recommended!"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-accent">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.review}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                      <span className="text-primary-foreground font-semibold text-sm">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{testimonial.name}</h4>
                      <p className="text-xs text-muted-foreground">{testimonial.service}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <Card className="text-center">
          <CardContent className="p-8">
            <h3 className="text-2xl font-serif font-semibold mb-4">
              Ready to Experience Doorstep Beauty Service?
            </h3>
            <p className="text-muted-foreground mb-6">
              Book your appointment today and enjoy professional salon services in the comfort of your home
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setLocation("/booking")}
                className="btn-primary flex items-center"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book Your Service
              </Button>
              <Button 
                asChild
                variant="outline"
                className="flex items-center"
              >
                <a href="tel:9036626642">
                  <Phone className="h-4 w-4 mr-2" />
                  Call: 9036626642
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
