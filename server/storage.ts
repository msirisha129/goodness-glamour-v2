import { type Service, type Customer, type Booking, type AiConversation, type ContactMessage, type User, type InsertService, type InsertCustomer, type InsertBooking, type InsertAiConversation, type InsertContactMessage, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Services
  getServices(): Promise<Service[]>;
  getServicesByCategory(category: string): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<boolean>;
  
  // Customers
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  
  // Bookings
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByCustomer(customerId: string): Promise<Booking[]>;
  getBookingsByUser(userId: string): Promise<Booking[]>;
  getAllBookings(): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;
  updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: string): Promise<boolean>;
  
  // AI Conversations
  getConversation(id: string): Promise<AiConversation | undefined>;
  getConversationBySession(sessionId: string): Promise<AiConversation | undefined>;
  createConversation(conversation: InsertAiConversation): Promise<AiConversation>;
  updateConversation(id: string, messages: any[]): Promise<AiConversation | undefined>;
  
  // Contact Messages
  getContactMessages(): Promise<ContactMessage[]>;
  getContactMessage(id: string): Promise<ContactMessage | undefined>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  updateContactMessageStatus(id: string, emailSent: boolean, excelUpdated: boolean): Promise<ContactMessage | undefined>;
  
  // Users (Authentication)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUserWithOTP(userData: InsertUser & { otp: string; otpExpiry: Date }): Promise<User>;
  verifyUserOTP(userId: string): Promise<User | undefined>;
  incrementOTPAttempts(userId: string): Promise<void>;
  updateUserOTP(userId: string, otp: string, otpExpiry: Date): Promise<void>;
}

export class MemStorage implements IStorage {
  private services: Map<string, Service> = new Map();
  private customers: Map<string, Customer> = new Map();
  private bookings: Map<string, Booking> = new Map();
  private aiConversations: Map<string, AiConversation> = new Map();
  private contactMessages: Map<string, ContactMessage> = new Map();
  private users: Map<string, User> = new Map();

  constructor() {
    this.initializeServices();
  }

  async initializeAdminUser() {
    const adminEmail = "2akonsultant@gmail.com";
    const adminPassword = "C@081119892ak";
    
    // Check if admin user already exists
    const existingAdmin = await this.getUserByEmail(adminEmail);
    if (existingAdmin) {
      console.log(`✅ Admin user already exists: ${adminEmail}`);
      console.log(`🔐 Admin user details - ID: ${existingAdmin.id}, Role: ${existingAdmin.role}, Verified: ${existingAdmin.isVerified}`);
      
      // Update password if needed (in case it was changed)
      const { hashPassword, comparePassword } = await import("./auth-service");
      const passwordMatch = await comparePassword(adminPassword, existingAdmin.password);
      if (!passwordMatch) {
        console.log(`🔄 Updating admin password...`);
        const hashedPassword = await hashPassword(adminPassword);
        existingAdmin.password = hashedPassword;
        existingAdmin.role = "admin";
        existingAdmin.isVerified = true;
        existingAdmin.updatedAt = new Date();
        this.users.set(existingAdmin.id, existingAdmin);
        console.log(`✅ Admin password updated`);
      }
      return;
    }

    // Hash the admin password
    const { hashPassword } = await import("./auth-service");
    const hashedPassword = await hashPassword(adminPassword);
    console.log(`🔐 Admin password hashed successfully`);

    // Create default admin user
    const adminUser: User = {
      id: "admin-user-001",
      email: adminEmail,
      password: hashedPassword,
      name: "Admin User",
      phone: "9036626642",
      role: "admin",
      isVerified: true,
      otp: null,
      otpExpiry: null,
      otpAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(adminUser.id, adminUser);
    console.log(`✅ Admin user created: ${adminEmail}`);
    console.log(`🔐 Admin user details - ID: ${adminUser.id}, Role: ${adminUser.role}, Verified: ${adminUser.isVerified}`);
  }

  private initializeServices() {
    const defaultServices: InsertService[] = [
      // Women's Hair Services
      {
        name: "Hair Cut & Styling",
        description: "Professional haircuts, blowdry, and styling at your doorstep for all hair types.",
        category: "women",
        priceMin: 400,
        priceMax: 1200,
        duration: 60,
        imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      },
      {
        name: "Hair Coloring & Highlights",
        description: "Professional hair coloring, highlights, balayage, and ombre treatments at home.",
        category: "women",
        priceMin: 1200,
        priceMax: 3500,
        duration: 120,
        imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      },
      {
        name: "Hair Treatment & Conditioning",
        description: "Deep conditioning, keratin treatment, and nourishing hair masks delivered to your home.",
        category: "women",
        priceMin: 600,
        priceMax: 2000,
        duration: 90,
        imageUrl: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      },
      {
        name: "Bridal & Party Hair Styling",
        description: "Elegant updos, braids, and special occasion hair styling for weddings and events.",
        category: "women",
        priceMin: 800,
        priceMax: 2500,
        duration: 90,
        imageUrl: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      },
      {
        name: "Professional Blowdry & Styling",
        description: "Smooth, voluminous blowdry with heat protection and professional styling.",
        category: "women",
        priceMin: 250,
        priceMax: 600,
        duration: 45,
        imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      },
      {
        name: "Hair Wash & Basic Styling",
        description: "Professional hair washing, conditioning, and basic styling service.",
        category: "women",
        priceMin: 200,
        priceMax: 450,
        duration: 30,
        imageUrl: "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      },
      {
        name: "Hair Consultation & Advice",
        description: "Expert hair analysis, styling tips, and personalized care recommendations.",
        category: "women",
        priceMin: 150,
        priceMax: 300,
        duration: 30,
        imageUrl: "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      },
      // Kids Hair Services
      {
        name: "Kids Haircuts & Styling",
        description: "Fun and comfortable haircuts for children with patient, child-friendly stylists.",
        category: "kids",
        priceMin: 150,
        priceMax: 500,
        duration: 30,
        imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      },
      {
        name: "Kids Party & Special Occasion Styling",
        description: "Special occasion hairstyles with fun braids, curls, and accessories for parties.",
        category: "kids",
        priceMin: 200,
        priceMax: 600,
        duration: 45,
        imageUrl: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      },
      {
        name: "Kids Hair Wash & Conditioning",
        description: "Gentle hair washing and conditioning service specifically for children's delicate hair.",
        category: "kids",
        priceMin: 100,
        priceMax: 300,
        duration: 20,
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      },
      {
        name: "Creative Braiding & Fun Styles",
        description: "Creative braids, ponytails, and fun hairstyles perfect for school and daily wear.",
        category: "kids",
        priceMin: 150,
        priceMax: 400,
        duration: 30,
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      }
    ];

    defaultServices.forEach(service => {
      const id = randomUUID();
      this.services.set(id, { ...service, id, isActive: true, imageUrl: service.imageUrl || null });
    });
  }

  // Services
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values()).filter(s => s.isActive);
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    return Array.from(this.services.values()).filter(s => s.category === category && s.isActive);
  }

  async getService(id: string): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = randomUUID();
    const service: Service = { ...insertService, id, isActive: true, imageUrl: insertService.imageUrl || null };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: string, updateData: Partial<InsertService>): Promise<Service | undefined> {
    const existingService = this.services.get(id);
    if (!existingService) {
      console.error(`❌ Service ${id} not found in storage`);
      return undefined;
    }
    const updatedService: Service = { ...existingService, ...updateData };
    this.services.set(id, updatedService);
    console.log(`✅ Service ${id} updated in storage. New data:`, updatedService);
    return updatedService;
  }

  async deleteService(id: string): Promise<boolean> {
    // Soft delete by setting isActive to false
    const service = this.services.get(id);
    if (service) {
      service.isActive = false;
      this.services.set(id, service);
      return true;
    }
    return false;
  }

  // Customers
  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(c => c.phone === phone);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = { 
      ...insertCustomer, 
      id, 
      email: insertCustomer.email || null,
      createdAt: new Date() 
    };
    this.customers.set(id, customer);
    return customer;
  }

  // Bookings
  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByCustomer(customerId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(b => b.customerId === customerId);
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(b => b.userId === userId);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = { 
      ...insertBooking,
      id, 
      status: "pending",
      totalAmount: insertBooking.totalAmount || null,
      notes: insertBooking.notes || null,
      customerId: insertBooking.customerId || null,
      userId: insertBooking.userId || null,
      createdAt: new Date() 
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (booking) {
      booking.status = status;
      this.bookings.set(id, booking);
      return booking;
    }
    return undefined;
  }

  async updateBooking(id: string, bookingData: Partial<InsertBooking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) {
      console.error(`❌ Booking ${id} not found in storage`);
      return undefined;
    }
    
    // Handle date conversion if appointmentDate is provided
    let updatedData = { ...bookingData };
    if (bookingData.appointmentDate) {
      updatedData.appointmentDate = bookingData.appointmentDate instanceof Date 
        ? bookingData.appointmentDate 
        : new Date(bookingData.appointmentDate);
    }
    
    const updatedBooking: Booking = { 
      ...booking, 
      ...updatedData
    };
    this.bookings.set(id, updatedBooking);
    console.log(`✅ Booking ${id} updated in storage. New data:`, updatedBooking);
    return updatedBooking;
  }

  async deleteBooking(id: string): Promise<boolean> {
    return this.bookings.delete(id);
  }

  // AI Conversations
  async getConversation(id: string): Promise<AiConversation | undefined> {
    return this.aiConversations.get(id);
  }

  async getConversationBySession(sessionId: string): Promise<AiConversation | undefined> {
    return Array.from(this.aiConversations.values()).find(c => c.sessionId === sessionId);
  }

  async createConversation(insertConversation: InsertAiConversation): Promise<AiConversation> {
    const id = randomUUID();
    const conversation: AiConversation = { 
      ...insertConversation, 
      id, 
      customerId: insertConversation.customerId || null,
      bookingId: insertConversation.bookingId || null,
      createdAt: new Date() 
    };
    this.aiConversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: string, messages: any[]): Promise<AiConversation | undefined> {
    const conversation = this.aiConversations.get(id);
    if (conversation) {
      conversation.messages = messages;
      this.aiConversations.set(id, conversation);
      return conversation;
    }
    return undefined;
  }

  // Contact Messages
  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getContactMessage(id: string): Promise<ContactMessage | undefined> {
    return this.contactMessages.get(id);
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const id = randomUUID();
    const contactMessage: ContactMessage = { 
      ...insertMessage, 
      id, 
      emailSent: false,
      excelUpdated: false,
      createdAt: new Date() 
    };
    this.contactMessages.set(id, contactMessage);
    return contactMessage;
  }

  async updateContactMessageStatus(id: string, emailSent: boolean, excelUpdated: boolean): Promise<ContactMessage | undefined> {
    const message = this.contactMessages.get(id);
    if (message) {
      message.emailSent = emailSent;
      message.excelUpdated = excelUpdated;
      this.contactMessages.set(id, message);
      return message;
    }
    return undefined;
  }

  // User methods for authentication
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.phone === phone);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUserWithOTP(userData: InsertUser & { otp: string; otpExpiry: Date }): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      ...userData,
      role: userData.role || null,
      phone: userData.phone || null,
      isVerified: false,
      otpAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async verifyUserOTP(userId: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      user.isVerified = true;
      user.otp = null;
      user.otpExpiry = null;
      user.otpAttempts = 0;
      user.updatedAt = new Date();
      this.users.set(userId, user);
      return user;
    }
    return undefined;
  }

  async incrementOTPAttempts(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      this.users.set(userId, user);
    }
  }

  async updateUserOTP(userId: string, otp: string, otpExpiry: Date): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      user.otpAttempts = 0;
      user.updatedAt = new Date();
      this.users.set(userId, user);
    }
  }
}

let selectedStorage: IStorage;
if (process.env.DATABASE_URL) {
  try {
    const { DrizzleStorage } = await import("./storage.drizzle");
    selectedStorage = new DrizzleStorage();
    console.log("✅ Using DrizzleStorage (PostgreSQL)");
  } catch (e) {
    console.error("❌ Failed to initialize DrizzleStorage, falling back to memory:", e);
    selectedStorage = new MemStorage();
  }
} else {
  selectedStorage = new MemStorage();
}

export const storage = selectedStorage as MemStorage | IStorage;

if (storage instanceof MemStorage) {
  // Initialize admin user after storage is created (memory only)
  storage.initializeAdminUser?.().catch?.(console.error);
}
