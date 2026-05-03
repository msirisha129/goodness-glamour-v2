import type { Handler } from "@netlify/functions";
import nodemailer from "nodemailer";
import { db } from "./_db";
import { customers, bookings, services as servicesTable } from "../../shared/schema";
import { eq } from "drizzle-orm";

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASSWORD || '',
    },
  });
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { name, email, phone, address, services, appointmentDate, appointmentTime, notes } = body;

    if (!name || !phone || !Array.isArray(services) || services.length === 0 || !appointmentDate) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Missing required fields' }) };
    }

    // Ensure customer exists (by phone)
    let customerId: string;
    const existing = await db.select().from(customers).where(eq(customers.phone, phone)).limit(1);
    if (existing[0]) {
      customerId = existing[0].id;
    } else {
      const inserted = await db.insert(customers).values({ name, email: email || null, phone, address: address || '' }).returning();
      customerId = inserted[0].id;
    }

    // Compute total based on min price of services
    const dbServices = await db.select().from(servicesTable);
    const nameById = new Map(dbServices.map(s => [s.id, s] as const));
    const selected = services.map((id: string) => nameById.get(id)).filter(Boolean) as typeof dbServices;
    const totalAmount = selected.reduce((sum, s: any) => sum + (s.priceMin || 0), 0);
    const serviceNames = selected.map((s: any) => s.name);

    // Create booking
    const insertedBooking = await db.insert(bookings).values({
      customerId,
      serviceIds: services,
      appointmentDate: new Date(appointmentDate) as any,
      totalAmount,
      notes: notes || null,
    }).returning();
    const booking = insertedBooking[0];

    const id = booking.id;
    const timestamp = new Date().toISOString();

    // Send admin email
    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: process.env.EMAIL_USER || '',
        to: process.env.EMAIL_USER || '',
        subject: `New Booking: ${name}`,
        text: `Booking ID: ${id}\nName: ${name}\nPhone: ${phone}\nEmail: ${email || ''}\nServices: ${serviceNames.join(', ')}\nDate: ${appointmentDate} ${appointmentTime || ''}\nAddress: ${address || ''}\nNotes: ${notes || ''}`,
      });
    } catch (_) {}

    // Optional customer email
    if (email) {
      try {
        const transporter = createTransporter();
        await transporter.sendMail({
          from: process.env.EMAIL_USER || '',
          to: email,
          subject: `Booking Confirmed - Goodness Glamour`,
          text: `Hello ${name}, your booking has been received. We'll contact you to confirm timing. Booking ID: ${id}`,
        });
      } catch (_) {}
    }

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        customerName: name,
        customerEmail: email || '',
        customerPhone: phone,
        customerAddress: address || '',
        appointmentDate,
        appointmentTime: appointmentTime || '',
        services: serviceNames,
        totalAmount,
        notes: notes || '',
        timestamp,
        status: 'pending',
      }),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Failed to create booking' }) };
  }
};


