import { ArrowLeft, QrCode, Smartphone, Camera, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

export default function ScanQR() {
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
              How to Scan QR Code
            </h1>
            <p className="text-lg text-muted-foreground">
              Get started with Goodness Glamour in just a few simple steps
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* QR Code Display */}
          <Card className="p-8 text-center">
            <CardContent>
              <div className="flex items-center justify-center mb-6">
                <div className="w-48 h-48 bg-white border-2 border-primary/20 rounded-2xl flex items-center justify-center shadow-xl">
                  <img 
                    src="/qr-code.png" 
                    alt="QR Code to visit Goodness Glamour website"
                    className="w-44 h-44 rounded-xl"
                  />
                </div>
              </div>
              <h3 className="text-2xl font-serif font-semibold mb-3 text-foreground">
                Scan This QR Code
              </h3>
              <p className="text-muted-foreground mb-4">
                Point your phone camera at this QR code to instantly access our website
              </p>
              <Badge className="bg-primary text-primary-foreground px-4 py-2">
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile Friendly
              </Badge>
            </CardContent>
          </Card>

          {/* Instructions */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-2xl font-serif font-semibold mb-4 flex items-center">
                  <Camera className="h-6 w-6 mr-3 text-primary" />
                  How to Scan
                </h3>
                <div className="space-y-4">
                  {[
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
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-foreground font-semibold text-sm">{item.step}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                        <p className="text-muted-foreground text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-serif font-semibold mb-4 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-accent" />
                  What Happens Next?
                </h3>
                <div className="space-y-3">
                  {[
                    "Browse our premium beauty services",
                    "Chat with our AI assistant for recommendations", 
                    "Book appointments with ease",
                    "Get doorstep service at your location"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => setLocation("/services")}
                className="btn-primary flex items-center justify-center flex-1"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Browse Services
              </Button>
              <Button 
                onClick={() => setLocation("/booking")}
                className="btn-accent flex items-center justify-center flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
