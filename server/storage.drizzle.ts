import { and, desc, eq } from "drizzle-orm";
import { db } from "./db";
import {
  services,
  customers,
  bookings,
  aiConversations,
  contactMessages,
  users,
  type Service,
  type Customer,
  type Booking,
  type AiConversation,
  type ContactMessage,
  type User,
  type InsertService,
  type InsertCustomer,
  type InsertBooking,
  type InsertAiConversation,
  type InsertContactMessage,
  type InsertUser,
} from "@shared/schema";
import { type IStorage } from "./storage";

export class DrizzleStorage implements IStorage {
  // Services
  async getServices(): Promise<Service[]> {
    return db.select().from(services).where(eq(services.isActive, true));
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    return db
      .select()
      .from(services)
      .where(and(eq(services.category, category), eq(services.isActive, true)));
  }

  async getService(id: string): Promise<Service | undefined> {
    const rows = await db.select().from(services).where(eq(services.id, id)).limit(1);
    return rows[0];
  }

  async createService(insert: InsertService): Promise<Service> {
    const rows = await db.insert(services).values(insert).returning();
    return rows[0];
  }

  async updateService(id: string, updateData: Partial<InsertService>): Promise<Service | undefined> {
    const rows = await db
      .update(services)
      .set(updateData)
      .where(eq(services.id, id))
      .returning();
    return rows[0];
  }

  async deleteService(id: string): Promise<boolean> {
    // Soft delete by setting isActive to false
    const rows = await db
      .update(services)
      .set({ isActive: false })
      .where(eq(services.id, id))
      .returning();
    return rows.length > 0;
  }

  // Customers
  async getCustomer(id: string): Promise<Customer | undefined> {
    const rows = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    return rows[0];
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const rows = await db
      .select()
      .from(customers)
      .where(eq(customers.phone, phone))
      .limit(1);
    return rows[0];
  }

  async createCustomer(insert: InsertCustomer): Promise<Customer> {
    const rows = await db.insert(customers).values(insert).returning();
    return rows[0];
  }

  // Bookings
  async getBooking(id: string): Promise<Booking | undefined> {
    const rows = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    return rows[0];
  }

  async getBookingsByCustomer(customerId: string): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.customerId, customerId));
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  async createBooking(insert: InsertBooking): Promise<Booking> {
    const rows = await db.insert(bookings).values(insert).returning();
    return rows[0];
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const rows = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return rows[0];
  }

  async getAllBookings(): Promise<Booking[]> {
    return db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async updateBooking(id: string, bookingData: Partial<InsertBooking>): Promise<Booking | undefined> {
    const rows = await db
      .update(bookings)
      .set(bookingData)
      .where(eq(bookings.id, id))
      .returning();
    return rows[0];
  }

  async deleteBooking(id: string): Promise<boolean> {
    const rows = await db
      .delete(bookings)
      .where(eq(bookings.id, id))
      .returning();
    return rows.length > 0;
  }

  // AI Conversations
  async getConversation(id: string): Promise<AiConversation | undefined> {
    const rows = await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.id, id))
      .limit(1);
    return rows[0];
  }

  async getConversationBySession(sessionId: string): Promise<AiConversation | undefined> {
    const rows = await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.sessionId, sessionId))
      .limit(1);
    return rows[0];
  }

  async createConversation(insert: InsertAiConversation): Promise<AiConversation> {
    const rows = await db.insert(aiConversations).values(insert).returning();
    return rows[0];
  }

  async updateConversation(id: string, messagesVal: any[]): Promise<AiConversation | undefined> {
    const rows = await db
      .update(aiConversations)
      .set({ messages: messagesVal as any })
      .where(eq(aiConversations.id, id))
      .returning();
    return rows[0];
  }

  // Contact Messages
  async getContactMessages(): Promise<ContactMessage[]> {
    return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async getContactMessage(id: string): Promise<ContactMessage | undefined> {
    const rows = await db
      .select()
      .from(contactMessages)
      .where(eq(contactMessages.id, id))
      .limit(1);
    return rows[0];
  }

  async createContactMessage(insert: InsertContactMessage): Promise<ContactMessage> {
    const rows = await db.insert(contactMessages).values(insert).returning();
    return rows[0];
  }

  async updateContactMessageStatus(
    id: string,
    emailSent: boolean,
    excelUpdated: boolean,
  ): Promise<ContactMessage | undefined> {
    const rows = await db
      .update(contactMessages)
      .set({ emailSent, excelUpdated })
      .where(eq(contactMessages.id, id))
      .returning();
    return rows[0];
  }

  // Users (Authentication)
  async getUser(id: string): Promise<User | undefined> {
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return rows[0];
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const rows = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    return rows[0];
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createUserWithOTP(userData: InsertUser & { otp: string; otpExpiry: Date }): Promise<User> {
    const rows = await db.insert(users).values(userData).returning();
    return rows[0];
  }

  async verifyUserOTP(userId: string): Promise<User | undefined> {
    const rows = await db
      .update(users)
      .set({ isVerified: true, otp: null as any, otpExpiry: null as any, otpAttempts: 0 })
      .where(eq(users.id, userId))
      .returning();
    return rows[0];
  }

  async incrementOTPAttempts(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    const attempts = (user?.otpAttempts || 0) + 1;
    await db.update(users).set({ otpAttempts: attempts }).where(eq(users.id, userId));
  }

  async updateUserOTP(userId: string, otp: string, otpExpiry: Date): Promise<void> {
    await db
      .update(users)
      .set({ otp, otpExpiry, otpAttempts: 0 })
      .where(eq(users.id, userId));
  }

  async initializeAdminUser(): Promise<void> {
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
        await db
          .update(users)
          .set({ 
            password: hashedPassword, 
            role: "admin", 
            isVerified: true,
            updatedAt: new Date()
          })
          .where(eq(users.id, existingAdmin.id));
        console.log(`✅ Admin password updated`);
      }
      return;
    }

    // Hash the admin password
    const { hashPassword } = await import("./auth-service");
    const hashedPassword = await hashPassword(adminPassword);
    console.log(`🔐 Admin password hashed successfully`);

    // Create default admin user
    const adminUser = {
      id: "admin-user-001",
      email: adminEmail,
      password: hashedPassword,
      name: "Admin User",
      phone: "9036626642",
      role: "admin",
      isVerified: true,
      otp: null as any,
      otpExpiry: null as any,
      otpAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await db.insert(users).values(adminUser);
    } catch (error: any) {
      // User might already exist, ignore duplicate key error
      if (error?.code !== '23505' && !error?.message?.includes('duplicate')) {
        throw error;
      }
      console.log(`ℹ️ Admin user already exists in database`);
    }
    console.log(`✅ Admin user created: ${adminEmail}`);
    console.log(`🔐 Admin user details - ID: ${adminUser.id}, Role: ${adminUser.role}, Verified: ${adminUser.isVerified}`);
  }
}





