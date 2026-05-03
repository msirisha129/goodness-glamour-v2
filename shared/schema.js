import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export const services = pgTable("services", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    name: text("name").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(), // 'women' | 'kids' | 'home' | 'products'
    priceMin: integer("price_min").notNull(),
    priceMax: integer("price_max").notNull(),
    duration: integer("duration").notNull(), // in minutes
    imageUrl: text("image_url"),
    isActive: boolean("is_active").default(true),
});
export const customers = pgTable("customers", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    address: text("address").notNull(),
    createdAt: timestamp("created_at").default(sql `now()`),
});
export const bookings = pgTable("bookings", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    customerId: varchar("customer_id").references(() => customers.id), // Optional for backward compatibility
    userId: varchar("user_id").references(() => users.id), // Link to authenticated users
    serviceIds: jsonb("service_ids").notNull(), // array of service IDs
    appointmentDate: timestamp("appointment_date").notNull(),
    status: text("status").default("pending"), // 'pending' | 'confirmed' | 'completed' | 'cancelled'
    totalAmount: integer("total_amount"),
    notes: text("notes"),
    createdAt: timestamp("created_at").default(sql `now()`),
});
export const aiConversations = pgTable("ai_conversations", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    sessionId: text("session_id").notNull(),
    messages: jsonb("messages").notNull(), // array of {role, content, timestamp}
    customerId: varchar("customer_id").references(() => customers.id),
    bookingId: varchar("booking_id").references(() => bookings.id),
    createdAt: timestamp("created_at").default(sql `now()`),
});
export const contactMessages = pgTable("contact_messages", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    serviceInterest: text("service_interest").notNull(),
    address: text("address").notNull(),
    message: text("message").notNull(),
    emailSent: boolean("email_sent").default(false),
    excelUpdated: boolean("excel_updated").default(false),
    createdAt: timestamp("created_at").default(sql `now()`),
});
// Users table for authentication with OTP
export const users = pgTable("users", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    email: text("email").notNull().unique(),
    password: text("password").notNull(), // Hashed password
    name: text("name").notNull(),
    phone: text("phone"),
    role: text("role").default("customer"), // "customer" or "admin"
    // OTP Verification fields
    isVerified: boolean("is_verified").default(false),
    otp: text("otp"), // 6-digit OTP
    otpExpiry: timestamp("otp_expiry"), // When OTP expires
    otpAttempts: integer("otp_attempts").default(0), // Track failed attempts
    createdAt: timestamp("created_at").default(sql `now()`),
    updatedAt: timestamp("updated_at").default(sql `now()`),
});
export const insertServiceSchema = createInsertSchema(services).omit({
    id: true,
    isActive: true,
});
export const insertCustomerSchema = createInsertSchema(customers).omit({
    id: true,
    createdAt: true,
});
export const insertBookingSchema = createInsertSchema(bookings).omit({
    id: true,
    createdAt: true,
    status: true,
}).extend({
    appointmentDate: z.string().or(z.date()).transform((val) => {
        if (typeof val === 'string') {
            return new Date(val);
        }
        return val;
    }),
    customerId: z.string().optional(),
    userId: z.string().optional(),
});
export const insertAiConversationSchema = createInsertSchema(aiConversations).omit({
    id: true,
    createdAt: true,
});
export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
    id: true,
    createdAt: true,
    emailSent: true,
    excelUpdated: true,
});
export const insertUserSchema = createInsertSchema(users).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    isVerified: true,
    otp: true,
    otpExpiry: true,
    otpAttempts: true,
});
