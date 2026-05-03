import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Calendar, Clock, MapPin, User, Phone, Mail, CreditCard, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Service } from "@shared/schema";

const createBookingSchema = (isAuthenticated: boolean) => z.object({
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
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [currentStep, setCurrentStep] = useState<"services" | "details" | "confirmation">("services");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is authenticated
  const token = localStorage.getItem("authToken");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isAuthenticated = token && user && user.isVerified;

  // Create dynamic schema and type based on authentication status
  const bookingSchema = createBookingSchema(isAuthenticated);
  type BookingFormData = z.infer<typeof bookingSchema>;

  const { data: services = [], isLoading } = useQuery<Service[]>({
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
          queryClient.invalidateQueries({ queryKey: ["/api/services"] });
        }
      } catch (_e) {}
    };
    return () => {
      es.close();
    };
  }, [queryClient]);

  const form = useForm<BookingFormData>({
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
    mutationFn: async (customerData: any) => {
      const response = await apiRequest("POST", "/api/customers", customerData);
      return response.json();
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest("POST", "/api/bookings", bookingData);
      return response.json();
    },
    onSuccess: (data) => {
      setBookingId(data.id);
      setCurrentStep("confirmation");
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking Confirmed!",
        description: "Your appointment has been successfully scheduled.Please check your spam mail if its not visible in inbox",
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
    mutationFn: async (bookingData: any) => {
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

  const handleServiceToggle = (service: Service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      } else {
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

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 20; hour++) {
      for (let minute of [0, 30]) {
        if (hour === 20 && minute === 30) break;
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

  const onSubmit = async (data: BookingFormData) => {
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
      } else {
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

    } catch (error) {
      console.error("Booking error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center bg-[#F9F5F0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#C9A58B]"></div>
          <p className="mt-4 text-[#8B7D6B]">Loading booking form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F5F0]">
      {/* Hero Section */}
      <section className="pt-16 bg-gradient-to-b from-[#F5F0E8] to-[#FAF7F2]" data-testid="booking-header">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/")}
              className="mr-4 text-[#8B7D6B] hover:text-[#C9A58B] hover:bg-[#C9A58B]/10 transition-all duration-300"
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-[#6B5D52] mb-3">
              Book Your Appointment
            </h1>
            <p className="text-lg text-black max-w-2xl mx-auto">
              Schedule your premium doorstep beauty service in just a few steps
            </p>
          </div>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="py-8 bg-white border-b border-[#E8DDD0]" data-testid="booking-progress">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-[#E8DDD0] rounded-full p-4 shadow-md">
            <div className="flex items-center justify-center space-x-12">
              {[
                { step: "services", label: "Select Services", icon: CheckCircle },
                { step: "details", label: "Booking Details", icon: User },
                { step: "confirmation", label: "Confirmation", icon: CheckCircle },
              ].map(({ step, label, icon: Icon }, index) => (
                <div key={step} className="flex items-center" data-testid={`step-${step}`}>
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                    currentStep === step 
                      ? "bg-[#8B7D6B] border-[#8B7D6B] text-white shadow-lg" 
                      : index < (currentStep === "details" ? 1 : currentStep === "confirmation" ? 2 : 0)
                      ? "bg-[#C9A58B] border-[#C9A58B] text-white shadow-md"
                      : "border-[#E8DDD0] bg-[#E8DDD0] text-[#A39689]"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`ml-3 font-semibold text-sm transition-colors duration-300 ${
                    currentStep === step ? "text-[#6B5D52]" : index < (currentStep === "details" ? 1 : currentStep === "confirmation" ? 2 : 0) ? "text-[#8B7D6B]" : "text-[#A39689]"
                  }`}>
                    {label}
                  </span>
                  {index < 2 && (
                    <div className={`ml-12 w-12 h-1 rounded-full transition-colors duration-300 ${
                      index < (currentStep === "details" ? 1 : currentStep === "confirmation" ? 2 : 0)
                        ? "bg-[#C9A58B]" 
                        : "bg-[#E8DDD0]"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: Service Selection */}
        {currentStep === "services" && (
          <Card className="bg-white shadow-xl border border-[#E8DDD0] rounded-2xl" data-testid="step-services">
            <CardHeader className="p-10">
              <CardTitle className="text-3xl font-serif font-bold text-[#6B5D52]">
                Select Your Services
                <div className="w-16 h-0.5 bg-[#C9A58B] mt-2 rounded-full"></div>
              </CardTitle>
              <p className="text-black text-base mt-3">Choose from our premium beauty treatments</p>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              {/* Women's Services */}
              <div>
                <div className="bg-[#F5F0E8] border-l-4 border-l-[#C9A58B] px-4 py-3 rounded-lg mb-6">
                  <h3 className="text-xl font-serif font-bold text-[#8B7D6B] flex items-center">
                    <span className="text-2xl mr-3">👩</span>
                    Women's Hair Services
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {services
                    .filter((service: Service) => service.category === "women")
                    .map((service: Service) => (
                      <div
                        key={service.id}
                        onClick={() => handleServiceToggle(service)}
                        className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                          selectedServices.find(s => s.id === service.id)
                            ? "border-[#C9A58B] bg-[#FAF7F2] shadow-lg"
                            : "border-[#E8DDD0] bg-white hover:border-[#C9A58B] hover:shadow-md"
                        }`}
                        data-testid={`service-option-${service.id}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-[#6B5D52] text-lg">{service.name}</h4>
                          <div className="text-xl font-bold text-[#C9A58B]">₹{service.priceMin}</div>
                        </div>
                        <p className="text-sm text-black mb-4 leading-relaxed">{service.description}</p>
                        <div className="flex items-center text-sm text-black">
                          <Clock className="h-4 w-4 mr-2 text-[#C9A58B]" />
                          {formatDuration(service.duration)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Kids Services */}
              <div>
                <div className="bg-[#F5F0E8] border-l-4 border-l-[#C9A58B] px-4 py-3 rounded-lg mb-6">
                  <h3 className="text-xl font-serif font-bold text-[#8B7D6B] flex items-center">
                    <span className="text-2xl mr-3">🧒</span>
                    Kids Hair Services
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {services
                    .filter((service: Service) => service.category === "kids")
                    .map((service: Service) => (
                      <div
                        key={service.id}
                        onClick={() => handleServiceToggle(service)}
                        className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                          selectedServices.find(s => s.id === service.id)
                            ? "border-[#C9A58B] bg-[#FAF7F2] shadow-lg"
                            : "border-[#E8DDD0] bg-white hover:border-[#C9A58B] hover:shadow-md"
                        }`}
                        data-testid={`service-option-${service.id}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-[#6B5D52] text-lg">{service.name}</h4>
                          <div className="text-xl font-bold text-[#C9A58B]">₹{service.priceMin}</div>
                        </div>
                        <p className="text-sm text-black mb-4 leading-relaxed">{service.description}</p>
                        <div className="flex items-center text-sm text-black">
                          <Clock className="h-4 w-4 mr-2 text-[#C9A58B]" />
                          {formatDuration(service.duration)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Selected Services Summary */}
              {selectedServices.length > 0 && (
                <Card className="bg-[#FAF7F2] border-2 border-[#C9A58B] shadow-lg">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4 text-[#6B5D52] text-lg">Selected Services ({selectedServices.length})</h4>
                    <div className="space-y-3 mb-6">
                      {selectedServices.map((service) => (
                        <div key={service.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-[#E8DDD0]">
                          <span className="text-sm font-medium text-black">{service.name}</span>
                          <span className="text-sm font-bold text-[#C9A58B]">₹{service.priceMin}</span>
                        </div>
                      ))}
                    </div>
                    <div className="w-full h-px bg-[#E8DDD0] mb-4"></div>
                    <div className="flex justify-between items-center font-bold mb-2">
                      <span className="text-[#6B5D52]">Total Amount:</span>
                      <span className="text-[#C9A58B] text-xl">₹{calculateTotal()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-[#8B7D6B]">
                      <span>Estimated Duration:</span>
                      <span className="font-medium">{formatDuration(calculateDuration())}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-center mt-8">
                <Button
                  onClick={() => setCurrentStep("details")}
                  disabled={selectedServices.length === 0}
                  className="bg-[#8B7D6B] hover:bg-[#9D8E7C] text-white px-8 py-4 rounded-xl font-bold text-lg tracking-wide shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-continue-to-details"
                >
                  Continue to Booking Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Booking Details */}
        {currentStep === "details" && (
          <Card className="bg-white shadow-xl border border-[#E8DDD0] rounded-2xl" data-testid="step-details">
            <CardHeader className="p-10">
              <CardTitle className="text-3xl font-serif font-bold text-[#6B5D52]">
                Booking Details
                <div className="w-16 h-0.5 bg-[#C9A58B] mt-2 rounded-full"></div>
              </CardTitle>
              <p className="text-black text-base mt-3">Please provide your information and preferred appointment time</p>
            </CardHeader>
            <CardContent className="p-10">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Customer Information */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold flex items-center text-[#6B5D52]">
                      <User className="h-6 w-6 mr-3 text-[#C9A58B]" />
                      {isAuthenticated ? "Your Information" : "Customer Information"}
                    </h3>
                    
                    {isAuthenticated ? (
                      <div className="bg-[#FAF7F2] border-2 border-[#C9A58B] rounded-xl p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#C9A58B] rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#6B5D52] text-lg">{user.name}</p>
                            <p className="text-sm text-black">{user.email}</p>
                            {user.phone && <p className="text-sm text-black">{user.phone}</p>}
                          </div>
                        </div>
                        <p className="text-sm text-black mt-3 flex items-center">
                          <span className="text-[#C9A58B] mr-2">✓</span>
                          Using your account information for booking
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="customerName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your full name" {...field} data-testid="input-customer-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="customerPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number *</FormLabel>
                                <FormControl>
                                  <Input type="tel" placeholder="Enter your phone number" {...field} data-testid="input-customer-phone" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="customerEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Enter your email (optional)" {...field} data-testid="input-customer-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customerAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Complete Address *</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter your complete address for doorstep service" 
                                  className="h-24" 
                                  {...field} 
                                  data-testid="textarea-customer-address"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>

                  <div className="w-full h-px bg-[#E8DDD0]"></div>

                  {/* Appointment Scheduling */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold flex items-center text-[#6B5D52]">
                      <Calendar className="h-6 w-6 mr-3 text-[#C9A58B]" />
                      Appointment Scheduling
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="appointmentDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Date *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-appointment-date">
                                  <SelectValue placeholder="Select appointment date" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {getNextSevenDays().map((date) => (
                                  <SelectItem key={date.value} value={date.value}>
                                    {date.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="appointmentTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Time *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-appointment-time">
                                  <SelectValue placeholder="Select appointment time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {generateTimeSlots().map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Instructions</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any special requirements or notes for the stylist" 
                              className="h-20" 
                              {...field} 
                              data-testid="textarea-booking-notes"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="w-full h-px bg-[#E8DDD0]"></div>

                  {/* Booking Summary */}
                  <Card className="bg-[#FAF7F2] border-2 border-[#C9A58B] shadow-lg">
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-4 text-[#6B5D52] text-lg">Booking Summary</h4>
                      <div className="space-y-3 mb-6">
                        {selectedServices.map((service) => (
                          <div key={service.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-[#E8DDD0]">
                            <span className="text-sm font-medium text-black">{service.name}</span>
                            <span className="text-sm font-bold text-[#C9A58B]">₹{service.priceMin}</span>
                          </div>
                        ))}
                      </div>
                      <div className="w-full h-px bg-[#E8DDD0] mb-4"></div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-[#6B5D52]">Total Amount:</span>
                          <span className="text-[#C9A58B] text-xl">₹{calculateTotal()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-black">
                          <span>Estimated Duration:</span>
                          <span className="font-medium">{formatDuration(calculateDuration())}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-between mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep("services")}
                      className="border-2 border-[#8B7D6B] text-[#8B7D6B] hover:bg-[#8B7D6B] hover:text-white transition-all duration-300 px-6 py-3 rounded-lg"
                      data-testid="button-back-to-services"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Services
                    </Button>
                    <Button
                      type="submit"
                      disabled={createCustomerMutation.isPending || createBookingMutation.isPending}
                      className="bg-[#8B7D6B] hover:bg-[#9D8E7C] text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50"
                      data-testid="button-confirm-booking"
                    >
                      {createCustomerMutation.isPending || createBookingMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirm Booking
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === "confirmation" && bookingId && (
          <Card className="text-center bg-white shadow-xl border border-[#E8DDD0] rounded-2xl" data-testid="step-confirmation">
            <CardContent className="p-10">
              <div className="w-24 h-24 bg-[#A8C9A5] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              
              <h2 className="text-3xl font-serif font-bold text-[#6B5D52] mb-4">
                Booking Confirmed!
              </h2>
              
              <p className="text-lg text-black mb-8 max-w-2xl mx-auto">
                Your appointment has been successfully scheduled. We'll contact you shortly to confirm the details.
              </p>

              <Card className="bg-[#FAF7F2] border-2 border-[#C9A58B] mb-8 shadow-lg">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4 text-[#6B5D52] text-lg">Booking Details</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between p-3 bg-white rounded-lg border border-[#E8DDD0]">
                      <span className="text-black">Booking ID:</span>
                      <span className="font-mono text-[#6B5D52] font-medium">{bookingId}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-white rounded-lg border border-[#E8DDD0]">
                      <span className="text-black">Services:</span>
                      <span className="text-[#6B5D52] font-medium">{selectedServices.length} service(s)</span>
                    </div>
                    <div className="flex justify-between p-3 bg-white rounded-lg border border-[#E8DDD0]">
                      <span className="text-black">Total Amount:</span>
                      <span className="font-bold text-[#C9A58B] text-lg">₹{calculateTotal()}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-white rounded-lg border border-[#E8DDD0]">
                      <span className="text-black">Estimated Duration:</span>
                      <span className="text-[#6B5D52] font-medium">{formatDuration(calculateDuration())}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <div className="flex items-center justify-center text-sm text-black">
                  <Phone className="h-4 w-4 mr-2 text-[#C9A58B]" />
                  <span>We'll call you at the provided number for confirmation</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => setLocation("/")}
                    className="bg-[#8B7D6B] hover:bg-[#9D8E7C] text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300"
                    data-testid="button-back-home"
                  >
                    Back to Home
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-2 border-[#8B7D6B] text-[#8B7D6B] hover:bg-[#8B7D6B] hover:text-white transition-all duration-300"
                    data-testid="button-call-salon"
                  >
                    <a href="tel:9036626642">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Salon
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Section */}
      <section className="py-20 bg-gradient-to-r from-[#F5F0E8] to-[#E8DDD0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-[#6B5D52] mb-4">
            Ready to Experience Beauty at Your Doorstep?
          </h2>
          <p className="text-lg text-black mb-8 max-w-2xl mx-auto">
            Book your appointment today and let our professional stylists bring luxury salon services to your home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setLocation("/")}
              className="bg-[#C9A58B] hover:bg-[#B89479] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02]"
            >
              Explore More Services
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-2 border-[#8B7D6B] text-[#8B7D6B] hover:bg-[#8B7D6B] hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
            >
              <a href="tel:9036626642">
                <Phone className="h-5 w-5 mr-2" />
                Call Us: 9036626642
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
