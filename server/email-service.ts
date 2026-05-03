import nodemailer from 'nodemailer';
import XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { sendBookingConfirmationSMS } from './sms-service';
import { sendBookingConfirmationWhatsApp } from './whatsapp-service';

export interface ContactMessage {
  name: string;
  phone: string;
  serviceInterest: string;
  address: string;
  message: string;
  timestamp: string;
}

export interface BookingData {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  appointmentDate: string;
  appointmentTime: string;
  services: string[];
  totalAmount: number;
  notes: string;
  timestamp: string;
}

// Email configuration - supports both EMAIL_PASSWORD and EMAIL_PASS
const getEmailPassword = () => process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || '';

// Create transporter with fallback configurations
const createTransporter = () => {
  const user = process.env.EMAIL_USER || '2akonsultant@gmail.com';
  const pass = getEmailPassword();

  if (!pass || pass.trim() === '') {
    console.error('❌ EMAIL_PASSWORD (or EMAIL_PASS) is not set. Booking emails will not be sent.');
    console.error('   → Add: EMAIL_USER=your-email@gmail.com');
    console.error('   → Add: EMAIL_PASSWORD=your-16-char-app-password');
    console.error('   → Generate App Password at: https://myaccount.google.com/apppasswords');
  } else {
    console.log(`✅ Email configuration found: USER=${user}, PASSWORD=${pass.length} chars`);
  }

  const usePort465 = process.env.SMTP_PORT === '465' || process.env.EMAIL_USE_PORT_465 === 'true';

  if (usePort465) {
    console.log('📧 Using SMTP port 465 (SSL)');
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
      tls: { rejectUnauthorized: true },
      pool: false,
    } as nodemailer.TransportOptions);
  }

  console.log('📧 Using SMTP port 587 (STARTTLS)');
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user, pass },
    requireTLS: true,
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    tls: { rejectUnauthorized: true },
    pool: false,
  } as nodemailer.TransportOptions);
};

// ✅ FIXED: Added TextPart to avoid spam
const sendCustomerEmailViaMailjet = async (booking: BookingData): Promise<boolean> => {
  const apiKey = process.env.MAILJET_API_KEY || '';
  const apiSecret = process.env.MAILJET_API_SECRET || '';

  if (!apiKey.trim() || !apiSecret.trim()) {
    console.error('❌ Mailjet is not configured: MAILJET_API_KEY/MAILJET_API_SECRET missing');
    return false;
  }

  // ✅ FIXED: Use correct email with proper fallback
  const fromEmail = process.env.MAILJET_FROM_EMAIL || process.env.EMAIL_USER || '2akonsultant@gmail.com';
  const fromName = process.env.MAILJET_FROM_NAME || 'Goodness Glamour';

  const formattedDate = new Date(booking.appointmentDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subject = `💐 Booking Confirmed | ${booking.customerName} | Goodness Glamour Salon`;

  // ✅ FIXED: Plain text version to avoid spam
  const textPart = `Hi ${booking.customerName}!

Your booking is confirmed at Goodness Glamour Salon.

Booking ID: ${booking.id}
Date: ${formattedDate}
Time: ${booking.appointmentTime}
Services: ${booking.services.join(', ')}
Total Amount: Rs.${booking.totalAmount}
Address: ${booking.customerAddress}

Need help? Call us: 9036626642

Thank you for choosing Goodness Glamour!`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:linear-gradient(135deg,#fef5f1,#fef9f5,#f5f3f9);font-family:Georgia,serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
        <tr><td align="center">
          <table width="620" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:24px;box-shadow:0 8px 32px rgba(0,0,0,0.08);overflow:hidden;">
            <tr><td style="background:linear-gradient(135deg,#ffeef5,#fff0f3,#f9f0ff);padding:50px 40px;text-align:center;">
              <h1 style="margin:0;color:#d4a5a5;font-size:36px;font-weight:300;letter-spacing:3px;">Goodness Glamour</h1>
              <p style="margin:8px 0;color:#b8a0a0;letter-spacing:2px;">Ladies & Kids Salon</p>
              <div style="margin-top:25px;padding:10px 30px;background:rgba(255,255,255,0.7);border-radius:20px;display:inline-block;border:1px solid rgba(212,165,165,0.2);">
                <p style="margin:0;color:#c9a0a0;font-size:13px;font-weight:500;">✅ Your Booking is Confirmed</p>
              </div>
            </td></tr>
            <tr><td style="padding:40px;">
              <div style="background:linear-gradient(135deg,#fff5f0,#fff8f5);padding:25px 30px;border-radius:18px;margin-bottom:30px;border:1px solid #ffe8e0;">
                <h2 style="margin:0;color:#c88080;font-size:26px;font-weight:400;">Hi ${booking.customerName}!</h2>
                <p style="margin:5px 0 0;color:#d4a5a5;font-size:14px;">Thank you for booking with us.</p>
              </div>
              <div style="background:linear-gradient(135deg,#f8f5ff,#faf7ff);padding:30px;border-radius:18px;margin-bottom:30px;border:1px solid #f0e8ff;">
                <h3 style="margin:0 0 25px;color:#a88cb8;font-size:16px;">Booking Details</h3>
                <p style="margin:0 0 12px;color:#9880a8;"><strong>Booking ID:</strong> ${booking.id}</p>
                <p style="margin:0 0 12px;color:#9880a8;"><strong>Date:</strong> ${formattedDate}</p>
                <p style="margin:0 0 12px;color:#9880a8;"><strong>Time:</strong> ${booking.appointmentTime}</p>
                <p style="margin:0 0 12px;color:#9880a8;"><strong>Services:</strong> ${booking.services.join(', ')}</p>
                <p style="margin:0 0 12px;color:#9880a8;"><strong>Total Amount:</strong> ₹${booking.totalAmount}</p>
                <p style="margin:0;color:#9880a8;"><strong>Address:</strong> ${booking.customerAddress}</p>
              </div>
              <p style="text-align:center;color:#98b8a8;">Need help? Call us: 9036626642</p>
              <p style="text-align:center;color:#c0c0c0;font-size:12px;margin-top:10px;">Thank you for choosing Goodness Glamour! 🌸</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  try {
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const response = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Messages: [
          {
            From: { Email: fromEmail, Name: fromName },
            To: [{ Email: booking.customerEmail, Name: booking.customerName }],
            Subject: subject,
            TextPart: textPart, // ✅ FIXED: Added plain text
            HTMLPart: html,
          },
        ],
      }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      console.error('❌ Mailjet send failed:', response.status, data);
      return false;
    }

    console.log('✅ Customer confirmation sent via Mailjet to', booking.customerEmail);
    return true;
  } catch (error) {
    logEmailError('Error sending via Mailjet', error);
    return false;
  }
};

// ✅ FIXED: Added TextPart to admin email to avoid spam
const sendAdminBookingEmailViaMailjet = async (mailOptions: {
  fromEmail: string;
  fromName: string;
  toEmail: string;
  toName: string;
  subject: string;
  html: string;
  textPart?: string;
}): Promise<boolean> => {
  const apiKey = process.env.MAILJET_API_KEY || '';
  const apiSecret = process.env.MAILJET_API_SECRET || '';

  if (!apiKey.trim() || !apiSecret.trim()) {
    console.error('❌ Mailjet is not configured: MAILJET_API_KEY/MAILJET_API_SECRET missing');
    return false;
  }

  try {
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const response = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Messages: [
          {
            From: { Email: mailOptions.fromEmail, Name: mailOptions.fromName },
            To: [{ Email: mailOptions.toEmail, Name: mailOptions.toName }],
            Subject: mailOptions.subject,
            TextPart: mailOptions.textPart || 'New booking received at Goodness Glamour Salon. Please check your admin panel for details.', // ✅ FIXED: Added plain text
            HTMLPart: mailOptions.html,
          },
        ],
      }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      console.error('❌ Mailjet send failed:', response.status, data);
      return false;
    }

    console.log('✅ Admin booking email sent via Mailjet to', mailOptions.toEmail);
    return true;
  } catch (error) {
    logEmailError('Error sending admin email via Mailjet', error);
    return false;
  }
};

// Create transporter for specific port
const createTransporterForPort = (port: 465 | 587): nodemailer.Transporter => {
  const user = process.env.EMAIL_USER || '2akonsultant@gmail.com';
  const pass = getEmailPassword();

  if (port === 465) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
      tls: { rejectUnauthorized: true },
      pool: false,
    } as nodemailer.TransportOptions);
  } else {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user, pass },
      requireTLS: true,
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
      tls: { rejectUnauthorized: true },
      pool: false,
    } as nodemailer.TransportOptions);
  }
};

// Send email notification
export async function sendContactEmail(contact: ContactMessage): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || '2akonsultant@gmail.com',
      to: '2akonsultant@gmail.com',
      subject: `💐 New Inquiry from ${contact.name} | Goodness Glamour Salon`,
      text: `New inquiry from ${contact.name}. Phone: ${contact.phone}. Service: ${contact.serviceInterest}. Address: ${contact.address}. Message: ${contact.message}.`, // ✅ FIXED: Added plain text
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #fef5f1 0%, #fef9f5 50%, #f5f3f9 100%); font-family: 'Georgia', 'Times New Roman', serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fef5f1 0%, #fef9f5 50%, #f5f3f9 100%); padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="620" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #ffeef5 0%, #fff0f3 50%, #f9f0ff 100%); padding: 50px 40px 40px 40px; text-align: center; position: relative;">
                      <h1 style="margin: 0; color: #d4a5a5; font-size: 36px; font-weight: 300; letter-spacing: 3px; font-family: 'Georgia', serif;">Goodness Glamour</h1>
                      <p style="margin: 8px 0 0 0; color: #b8a0a0; font-size: 15px; letter-spacing: 2px;">Ladies & Kids Salon</p>
                      <div style="margin-top: 25px; padding: 10px 30px; background-color: rgba(255,255,255,0.7); border-radius: 20px; display: inline-block;">
                        <p style="margin: 0; color: #c9a0a0; font-size: 13px; font-weight: 500;">💐 New Customer Inquiry</p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <div style="background: linear-gradient(135deg, #fff5f0 0%, #fff8f5 100%); padding: 25px 30px; border-radius: 18px; margin-bottom: 30px; border: 1px solid #ffe8e0;">
                        <h2 style="margin: 0; color: #c88080; font-size: 26px; font-weight: 400;">${contact.name}</h2>
                        <p style="margin: 5px 0 0 0; color: #d4a5a5; font-size: 14px;">New Inquiry Received</p>
                      </div>
                      <div style="background: linear-gradient(135deg, #f8f5ff 0%, #faf7ff 100%); padding: 30px; border-radius: 18px; margin-bottom: 30px; border: 1px solid #f0e8ff;">
                        <h3 style="margin: 0 0 25px 0; color: #a88cb8; font-size: 16px;">Contact Details</h3>
                        <p style="margin: 0 0 12px; color: #9880a8;"><strong>📱 Phone:</strong> <a href="tel:${contact.phone}" style="color: #c88080;">${contact.phone}</a></p>
                        <p style="margin: 0 0 12px; color: #9880a8;"><strong>💇‍♀️ Service:</strong> ${contact.serviceInterest}</p>
                        <p style="margin: 0; color: #9880a8;"><strong>📍 Address:</strong> ${contact.address}</p>
                      </div>
                      <div style="background: linear-gradient(135deg, #f0f9f8 0%, #f5faf9 100%); padding: 30px; border-radius: 18px; margin-bottom: 30px; border: 1px solid #e0f0ed;">
                        <h3 style="margin: 0 0 18px 0; color: #88b8a8; font-size: 16px;">Customer Message</h3>
                        <p style="margin: 0; color: #687878; font-size: 15px; line-height: 1.8;">${contact.message}</p>
                      </div>
                      <div style="text-align: center; padding: 30px;">
                        <a href="tel:${contact.phone}" style="display: inline-block; background: linear-gradient(135deg, #b8d4c8 0%, #a8c8b8 100%); color: #ffffff; padding: 16px 45px; border-radius: 25px; text-decoration: none; font-size: 17px; font-weight: 500;">
                          📞 Call ${contact.name}
                        </a>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="background: #fafafa; padding: 30px 40px; text-align: center; border-top: 1px solid #f0f0f0;">
                      <p style="margin: 0; color: #c0c0c0; font-size: 11px;">Automated notification • Goodness Glamour Salon</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    await retryEmailSend(
        async () => {
          return await sendEmailWithPortFallback(mailOptions, 'contact email');
        },
        'contact email',
        2
    );

    console.log('✅ Email sent successfully to 2akonsultant@gmail.com');
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    logEmailError('Error sending contact email', error);
    return false;
  }
}

// Update Excel file with new contact message
export async function updateExcelFile(contact: ContactMessage): Promise<boolean> {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const excelPath = path.join(dataDir, 'contact-messages.xlsx');

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    let workbook: XLSX.WorkBook;
    let worksheet: XLSX.WorkSheet;
    let existingData: any[] = [];

    if (fs.existsSync(excelPath)) {
      workbook = XLSX.readFile(excelPath);
      worksheet = workbook.Sheets['Contact Messages'];
      if (worksheet) {
        existingData = XLSX.utils.sheet_to_json(worksheet);
      }
    } else {
      workbook = XLSX.utils.book_new();
    }

    const newRow = {
      'Submission Date': new Date(contact.timestamp).toLocaleString('en-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      }),
      'Name': contact.name,
      'Phone Number': contact.phone,
      'Service Interest': contact.serviceInterest,
      'Address': contact.address,
      'Message': contact.message,
    };

    existingData.push(newRow);

    const newWorksheet = XLSX.utils.json_to_sheet(existingData);
    newWorksheet['!cols'] = [
      { wch: 20 }, { wch: 25 }, { wch: 15 },
      { wch: 25 }, { wch: 35 }, { wch: 50 },
    ];

    if (workbook.Sheets['Contact Messages']) {
      workbook.Sheets['Contact Messages'] = newWorksheet;
    } else {
      XLSX.utils.book_append_sheet(workbook, newWorksheet, 'Contact Messages');
    }

    XLSX.writeFile(workbook, excelPath);
    console.log(`✅ Excel file updated: ${excelPath}`);
    console.log(`📊 Total contact messages: ${existingData.length}`);
    return true;
  } catch (error) {
    console.error('❌ Error updating Excel file:', error);
    return false;
  }
}

// Process contact form submission
export async function processContactMessage(contact: ContactMessage): Promise<{
  success: boolean;
  emailSent: boolean;
  excelUpdated: boolean;
}> {
  console.log('📧 Processing contact message from:', contact.name);
  const emailSent = await sendContactEmail(contact);
  const excelUpdated = await updateExcelFile(contact);
  return {
    success: emailSent || excelUpdated,
    emailSent,
    excelUpdated,
  };
}

// Helper to log email errors with actionable hints
const logEmailError = (context: string, error: unknown) => {
  const err = error instanceof Error ? error : new Error(String(error));
  const msg = err.message || '';
  const errCode = (err as any).code || '';

  console.error(`❌ ${context}:`, msg);

  if (msg.includes('timeout') || msg.includes('Timeout') || msg.includes('ETIMEDOUT') || errCode === 'ETIMEDOUT') {
    console.error('   → Connection timeout. Check internet connection or firewall settings.');
  }
  if (msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND') || errCode === 'ECONNREFUSED' || errCode === 'ENOTFOUND') {
    console.error('   → Connection refused. Check internet connectivity and firewall.');
  }
  if (msg.includes('Invalid login') || msg.includes('EAUTH') || msg.includes('authentication') || errCode === 'EAUTH') {
    console.error('   → Gmail auth failed. Use App Password: https://myaccount.google.com/apppasswords');
  }
};

// Helper function to send email with port fallback
const sendEmailWithPortFallback = async (
    mailOptions: nodemailer.SendMailOptions,
    context: string
): Promise<nodemailer.SentMessageInfo> => {
  const ports: Array<{ port: 465 | 587; name: string }> = [
    { port: 587, name: '587 (STARTTLS)' },
    { port: 465, name: '465 (SSL)' }
  ];

  let lastError: any;

  for (const { port, name } of ports) {
    try {
      console.log(`📧 Attempting to send ${context} via port ${name}...`);
      const transporter = createTransporterForPort(port);
      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully via port ${name}`);
      return result;
    } catch (error: any) {
      lastError = error;
      const err = error instanceof Error ? error : new Error(String(error));
      const msg = err.message || '';
      const errCode = error?.code || '';

      const isTimeout =
          msg.includes('timeout') || msg.includes('Timeout') ||
          msg.includes('ETIMEDOUT') || errCode === 'ETIMEDOUT';

      if (isTimeout && port === 587) {
        console.log(`⚠️ Port ${name} timed out, trying alternative port...`);
        continue;
      }

      if (port === 465) throw error;
    }
  }

  throw lastError || new Error(`Failed to send ${context} on all ports`);
};

// Helper function to retry email sending with exponential backoff
const retryEmailSend = async <T>(
    emailFunction: () => Promise<T>,
    context: string,
    maxRetries: number = 2
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await emailFunction();
    } catch (error: any) {
      lastError = error;
      const err = error instanceof Error ? error : new Error(String(error));
      const msg = err.message || '';
      const errCode = error?.code || '';

      const isRetryable =
          msg.includes('timeout') || msg.includes('Timeout') ||
          msg.includes('ETIMEDOUT') || errCode === 'ETIMEDOUT' ||
          msg.includes('ECONNREFUSED') || errCode === 'ECONNREFUSED' ||
          msg.includes('ENOTFOUND') || errCode === 'ENOTFOUND';

      if (isRetryable && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`   ⏳ Retrying ${context} (attempt ${attempt + 1}/${maxRetries}) after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error(`Failed to send ${context} after ${maxRetries} attempts`);
};

const isGmailAPIConfigured = () =>
    Boolean(
        process.env.GOOGLE_CLIENT_ID?.trim() &&
        process.env.GOOGLE_CLIENT_SECRET?.trim() &&
        process.env.GOOGLE_REFRESH_TOKEN?.trim()
    );

const isMailjetConfigured = () =>
    Boolean(
        process.env.MAILJET_API_KEY?.trim() &&
        process.env.MAILJET_API_SECRET?.trim()
    );

const createSimpleGmailTransporter = () => {
  const user = process.env.EMAIL_USER || '2akonsultant@gmail.com';
  const pass = getEmailPassword();
  return nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
};

const sendCustomerEmailViaGmailAPI = async (booking: BookingData): Promise<boolean> => {
  const emailUser = process.env.EMAIL_USER || '2akonsultant@gmail.com';
  const formattedDate = new Date(booking.appointmentDate).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const subject = `💐 Booking Confirmed | ${booking.customerName} | Goodness Glamour Salon`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:linear-gradient(135deg,#fef5f1,#fef9f5,#f5f3f9);font-family:Georgia,serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
        <tr><td align="center">
          <table width="620" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:24px;box-shadow:0 8px 32px rgba(0,0,0,0.08);">
            <tr><td style="background:linear-gradient(135deg,#ffeef5,#fff0f3,#f9f0ff);padding:50px 40px;text-align:center;">
              <h1 style="margin:0;color:#d4a5a5;font-size:36px;font-weight:300;">Goodness Glamour</h1>
              <p style="margin:8px 0;color:#b8a0a0;">Ladies & Kids Salon</p>
              <p style="margin:20px 0 0;padding:10px 30px;background:rgba(255,255,255,0.7);border-radius:20px;display:inline-block;">✅ Your Booking is Confirmed</p>
            </td></tr>
            <tr><td style="padding:40px;">
              <div style="background:linear-gradient(135deg,#fff5f0,#fff8f5);padding:25px 30px;border-radius:18px;margin-bottom:30px;">
                <h2 style="margin:0;color:#c88080;font-size:26px;">Hi ${booking.customerName}!</h2>
                <p style="margin:5px 0 0;color:#d4a5a5;">Thank you for booking with us.</p>
              </div>
              <div style="background:linear-gradient(135deg,#f8f5ff,#faf7ff);padding:30px;border-radius:18px;margin-bottom:30px;">
                <h3 style="margin:0 0 25px;color:#a88cb8;">Booking Details</h3>
                <p style="margin:0 0 12px;color:#9880a8;"><strong>Booking ID:</strong> ${booking.id}</p>
                <p style="margin:0 0 12px;color:#9880a8;"><strong>Date:</strong> ${formattedDate}</p>
                <p style="margin:0 0 12px;color:#9880a8;"><strong>Time:</strong> ${booking.appointmentTime}</p>
                <p style="margin:0 0 12px;color:#9880a8;"><strong>Services:</strong> ${booking.services.join(', ')}</p>
                <p style="margin:0 0 12px;color:#9880a8;"><strong>Total Amount:</strong> ₹${booking.totalAmount}</p>
                <p style="margin:0;color:#9880a8;"><strong>Address:</strong> ${booking.customerAddress}</p>
              </div>
              <p style="text-align:center;color:#98b8a8;">Need help? Call us: 9036626642</p>
              <p style="text-align:center;color:#c0c0c0;font-size:12px;margin-top:10px;">Thank you for choosing Goodness Glamour! 🌸</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  try {
    const { google } = await import('googleapis');
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'urn:ietf:wg:oauth:2.0:oob'
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const transporter = nodemailer.createTransport({ streamTransport: true, buffer: true });
    const info = await transporter.sendMail({
      from: `Goodness Glamour <${emailUser}>`,
      to: booking.customerEmail,
      subject,
      html,
    });
    const raw = Buffer.from(info.message?.toString() || '')
        .toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
    console.log('✅ Customer confirmation sent via Gmail API from', emailUser);
    return true;
  } catch (error) {
    logEmailError('Error sending via Gmail API', error);
    return false;
  }
};

const sendCustomerEmailViaSMTP = async (booking: BookingData): Promise<boolean> => {
  if (isGmailAPIConfigured()) {
    return sendCustomerEmailViaGmailAPI(booking);
  }

  const emailPassword = getEmailPassword();
  const emailUser = process.env.EMAIL_USER || '2akonsultant@gmail.com';

  if (!emailPassword?.trim()) {
    console.error('❌ Customer email: Set GOOGLE_* (Render) or EMAIL_PASSWORD (localhost)');
    return false;
  }

  const formattedDate = new Date(booking.appointmentDate).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const mailOptions = {
    from: emailUser,
    to: booking.customerEmail,
    subject: `💐 Booking Confirmed | ${booking.customerName} | Goodness Glamour Salon`,
    // ✅ FIXED: Added plain text
    text: `Hi ${booking.customerName}! Your booking is confirmed at Goodness Glamour Salon. Date: ${formattedDate} at ${booking.appointmentTime}. Services: ${booking.services.join(', ')}. Total: Rs.${booking.totalAmount}. Need help? Call: 9036626642`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #fef5f1, #fef9f5, #f5f3f9); font-family: Georgia, serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
          <tr><td align="center">
            <table width="620" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08);">
              <tr><td style="background: linear-gradient(135deg, #ffeef5, #fff0f3, #f9f0ff); padding: 50px 40px; text-align: center;">
                <h1 style="margin: 0; color: #d4a5a5; font-size: 36px; font-weight: 300; letter-spacing: 3px;">Goodness Glamour</h1>
                <p style="margin: 8px 0 0; color: #b8a0a0; letter-spacing: 2px;">Ladies & Kids Salon</p>
                <div style="margin-top: 25px; padding: 10px 30px; background: rgba(255,255,255,0.7); border-radius: 20px; display: inline-block;">
                  <p style="margin: 0; color: #c9a0a0; font-size: 13px; font-weight: 500;">✅ Your Booking is Confirmed</p>
                </div>
              </td></tr>
              <tr><td style="padding: 40px;">
                <div style="background: linear-gradient(135deg, #fff5f0, #fff8f5); padding: 25px 30px; border-radius: 18px; margin-bottom: 30px; border: 1px solid #ffe8e0;">
                  <h2 style="margin: 0; color: #c88080; font-size: 26px; font-weight: 400;">Hi ${booking.customerName}!</h2>
                  <p style="margin: 5px 0 0; color: #d4a5a5; font-size: 14px;">Thank you for booking with us.</p>
                </div>
                <div style="background: linear-gradient(135deg, #f8f5ff, #faf7ff); padding: 30px; border-radius: 18px; margin-bottom: 30px; border: 1px solid #f0e8ff;">
                  <h3 style="margin: 0 0 25px; color: #a88cb8; font-size: 16px;">Booking Details</h3>
                  <p style="margin: 0 0 12px; color: #9880a8;"><strong>Booking ID:</strong> ${booking.id}</p>
                  <p style="margin: 0 0 12px; color: #9880a8;"><strong>Date:</strong> ${formattedDate}</p>
                  <p style="margin: 0 0 12px; color: #9880a8;"><strong>Time:</strong> ${booking.appointmentTime}</p>
                  <p style="margin: 0 0 12px; color: #9880a8;"><strong>Services:</strong> ${booking.services.join(', ')}</p>
                  <p style="margin: 0 0 12px; color: #9880a8;"><strong>Total Amount:</strong> ₹${booking.totalAmount}</p>
                  <p style="margin: 0; color: #9880a8;"><strong>Address:</strong> ${booking.customerAddress}</p>
                </div>
                <p style="text-align: center; color: #98b8a8;">Need help? Call us: 9036626642</p>
                <p style="text-align: center; color: #c0c0c0; font-size: 12px; margin-top: 10px;">Thank you for choosing Goodness Glamour! 🌸</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    console.log('📧 Sending customer confirmation directly to:', booking.customerEmail);
    const transporter = createSimpleGmailTransporter();
    await transporter.sendMail(mailOptions);
    console.log('✅ Customer confirmation email sent successfully');
    return true;
  } catch (error) {
    logEmailError('Error sending customer booking confirmation', error);
    return false;
  }
};

// Send booking confirmation email to admin
export async function sendBookingEmail(booking: BookingData): Promise<boolean> {
  try {
    const emailPassword = getEmailPassword();
    const emailUser = process.env.EMAIL_USER || '2akonsultant@gmail.com';
    const adminToEmail = process.env.ADMIN_EMAIL || '2akonsultant@gmail.com';

    console.log('📧 sendBookingEmail called');
    console.log(`📧 EMAIL_USER: ${emailUser}`);
    console.log(`📧 EMAIL_PASSWORD: ${emailPassword ? 'SET (length: ' + emailPassword.length + ')' : 'NOT SET'}`);
    console.log(`📧 EMAIL_PASS (alt): ${process.env.EMAIL_PASS ? 'SET' : 'NOT SET'}`);

    const subject = `💐 New Booking Confirmation | ${booking.customerName} | Goodness Glamour Salon`;

    // ✅ FIXED: Plain text for admin email
    const adminTextPart = `New booking received!

Customer: ${booking.customerName}
Phone: ${booking.customerPhone}
Email: ${booking.customerEmail}
Date: ${new Date(booking.appointmentDate).toLocaleDateString('en-IN')} at ${booking.appointmentTime}
Services: ${booking.services.join(', ')}
Total: Rs.${booking.totalAmount}
Address: ${booking.customerAddress}
Booking ID: ${booking.id}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #fef5f1, #fef9f5, #f5f3f9); font-family: Georgia, serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
          <tr><td align="center">
            <table width="620" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08);">
              <tr><td style="background: linear-gradient(135deg, #ffeef5, #fff0f3, #f9f0ff); padding: 50px 40px; text-align: center;">
                <h1 style="margin: 0; color: #d4a5a5; font-size: 36px; font-weight: 300; letter-spacing: 3px;">Goodness Glamour</h1>
                <p style="margin: 8px 0 0; color: #b8a0a0; letter-spacing: 2px;">Ladies & Kids Salon</p>
                <div style="margin-top: 25px; padding: 10px 30px; background: rgba(255,255,255,0.7); border-radius: 20px; display: inline-block;">
                  <p style="margin: 0; color: #c9a0a0; font-size: 13px; font-weight: 500;">💐 New Booking Confirmation</p>
                </div>
              </td></tr>
              <tr><td style="padding: 40px;">
                <div style="background: linear-gradient(135deg, #fff5f0, #fff8f5); padding: 25px 30px; border-radius: 18px; margin-bottom: 30px; border: 1px solid #ffe8e0;">
                  <h2 style="margin: 0; color: #c88080; font-size: 26px; font-weight: 400;">${booking.customerName}</h2>
                  <p style="margin: 5px 0 0; color: #d4a5a5; font-size: 14px;">New Booking Confirmed</p>
                </div>
                <div style="background: linear-gradient(135deg, #f8f5ff, #faf7ff); padding: 30px; border-radius: 18px; margin-bottom: 30px; border: 1px solid #f0e8ff;">
                  <h3 style="margin: 0 0 25px; color: #a88cb8; font-size: 16px;">Booking Details</h3>
                  <p style="margin: 0 0 12px; color: #9880a8;"><strong>Booking ID:</strong> ${booking.id}</p>
                  <p style="margin: 0 0 12px; color: #9880a8;"><strong>Date:</strong> ${new Date(booking.appointmentDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${booking.appointmentTime}</p>
                  <p style="margin: 0 0 12px; color: #9880a8;"><strong>Services:</strong> ${booking.services.join(', ')}</p>
                  <p style="margin: 0 0 12px; color: #9880a8;"><strong>Total Amount:</strong> ₹${booking.totalAmount}</p>
                  <p style="margin: 0 0 12px; color: #9880a8;"><strong>Phone:</strong> <a href="tel:${booking.customerPhone}" style="color: #c88080;">${booking.customerPhone}</a></p>
                  <p style="margin: 0 0 12px; color: #9880a8;"><strong>Email:</strong> ${booking.customerEmail}</p>
                  <p style="margin: 0; color: #9880a8;"><strong>Address:</strong> ${booking.customerAddress}</p>
                </div>
                <div style="text-align: center; padding: 30px;">
                  <a href="tel:${booking.customerPhone}" style="display: inline-block; background: linear-gradient(135deg, #b8d4c8, #a8c8b8); color: #fff; padding: 16px 45px; border-radius: 25px; text-decoration: none; font-size: 17px; font-weight: 500;">
                    📞 Call ${booking.customerName}
                  </a>
                </div>
              </td></tr>
              <tr><td style="background: #fafafa; padding: 30px 40px; text-align: center; border-top: 1px solid #f0f0f0;">
                <p style="margin: 0; color: #c0c0c0; font-size: 11px;">Automated booking confirmation • Goodness Glamour Salon</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `;

    if (isMailjetConfigured()) {
      const fromEmail = process.env.MAILJET_FROM_EMAIL || emailUser;
      const fromName = process.env.MAILJET_FROM_NAME || 'Goodness Glamour';
      return await sendAdminBookingEmailViaMailjet({
        fromEmail,
        fromName,
        toEmail: adminToEmail,
        toName: 'Admin',
        subject,
        html,
        textPart: adminTextPart, // ✅ FIXED: Pass plain text
      });
    }

    if (!emailPassword?.trim()) {
      console.error('❌ Skipping admin booking email: MAILJET is not configured and EMAIL_PASSWORD is missing');
      return false;
    }

    const mailOptions: nodemailer.SendMailOptions = {
      from: emailUser,
      to: adminToEmail,
      subject,
      text: adminTextPart, // ✅ FIXED: Added plain text
      html,
    };

    await retryEmailSend(
        async () => { return await sendEmailWithPortFallback(mailOptions, 'admin booking email'); },
        'admin booking email',
        2
    );

    console.log('✅ Booking confirmation email sent successfully to', adminToEmail);
    return true;
  } catch (error) {
    logEmailError('Error sending admin booking email', error);
    return false;
  }
}

// Send booking confirmation email to customer
export async function sendCustomerBookingConfirmation(booking: BookingData): Promise<boolean> {
  try {
    console.log(`📧 Sending customer confirmation to: ${booking.customerEmail}`);

    if (!booking.customerEmail || booking.customerEmail.trim() === '') {
      console.log('❌ No customer email provided, skipping customer confirmation');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(booking.customerEmail)) {
      console.log(`❌ Invalid email format: "${booking.customerEmail}", skipping customer confirmation`);
      return false;
    }

    const success = isMailjetConfigured()
        ? await sendCustomerEmailViaMailjet(booking)
        : await sendCustomerEmailViaSMTP(booking);
    console.log(`📧 Customer booking confirmation result: ${success}`);
    return success;
  } catch (error) {
    logEmailError('Error sending customer booking confirmation', error);
    return false;
  }
}

// Update Excel file with booking data
export async function updateBookingExcelFile(booking: BookingData): Promise<boolean> {
  try {
    const dataDir = path.join(process.cwd(), 'data');

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const filePath = path.join(dataDir, 'bookings.xlsx');
    let workbook;
    let worksheet;
    let bookings: any[] = [];

    if (fs.existsSync(filePath)) {
      workbook = XLSX.readFile(filePath);
      worksheet = workbook.Sheets['Bookings'];
      if (worksheet) {
        bookings = XLSX.utils.sheet_to_json(worksheet);
      }
    } else {
      workbook = XLSX.utils.book_new();
    }

    const newBooking = {
      'Booking ID': booking.id,
      'Name': booking.customerName,
      'Email': booking.customerEmail || '',
      'Phone': booking.customerPhone,
      'Date': new Date(booking.appointmentDate).toLocaleDateString('en-IN'),
      'Time': booking.appointmentTime,
      'Services': booking.services.join(', '),
      'Location': booking.customerAddress,
      'Total Amount': booking.totalAmount,
      'Notes': booking.notes || '',
      'Timestamp': new Date(booking.timestamp).toLocaleString('en-IN')
    };

    bookings.push(newBooking);
    worksheet = XLSX.utils.json_to_sheet(bookings);
    workbook.Sheets['Bookings'] = worksheet;
    XLSX.writeFile(workbook, filePath);

    console.log(`✅ Excel file updated: ${filePath}`);
    console.log(`📊 Total bookings: ${bookings.length}`);
    return true;
  } catch (error) {
    console.error('❌ Error updating booking Excel file:', error);
    return false;
  }
}

// Test email configuration
export async function testEmailConfiguration(): Promise<boolean> {
  try {
    console.log('🧪 Testing email configuration...');
    const testMailOptions = {
      from: process.env.EMAIL_USER || '2akonsultant@gmail.com',
      to: process.env.EMAIL_USER || '2akonsultant@gmail.com',
      subject: 'Test Email - Goodness Glamour Configuration Check',
      text: 'This is a test email to verify email configuration is working.',
      html: '<p>This is a test email to verify email configuration is working.</p>'
    };
    const result = await sendEmailWithPortFallback(testMailOptions, 'test email');
    console.log('✅ Test email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ Test email failed:', error);
    logEmailError('Test email failed', error);
    return false;
  }
}

// Process booking (save to Excel, send emails, and send SMS)
export async function processBooking(booking: BookingData): Promise<{
  emailSent: boolean;
  excelUpdated: boolean;
  customerEmailSent: boolean;
  smsSent: boolean;
  smsProvider?: string;
}> {
  try {
    console.log(`📧 Processing booking from: ${booking.customerName}`);

    let excelUpdated = false;
    try {
      excelUpdated = await updateBookingExcelFile(booking);
    } catch (excelErr) {
      console.error('❌ Excel update failed (emails will still be sent):', excelErr);
    }

    const adminEmailSent = await sendBookingEmail(booking);

    console.log(`📧 Attempting to send customer email to: ${booking.customerEmail}`);
    const customerEmailSent = await sendCustomerBookingConfirmation(booking);
    console.log(`📧 Customer email result: ${customerEmailSent}`);

    console.log(`📱 Attempting to send SMS to: ${booking.customerPhone}`);
    const smsResult = await sendBookingConfirmationSMS({
      id: booking.id,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      appointmentDate: booking.appointmentDate,
      appointmentTime: booking.appointmentTime,
      services: booking.services,
      totalAmount: booking.totalAmount,
      customerAddress: booking.customerAddress
    });
    console.log(`📱 SMS result: ${smsResult.success} via ${smsResult.provider}`);

    const emailSent = adminEmailSent;
    console.log(`✅ Booking processed: Admin Email=${adminEmailSent}, Customer Email=${customerEmailSent}, SMS=${smsResult.success} (${smsResult.provider}), Excel=${excelUpdated}`);

    return {
      emailSent,
      excelUpdated,
      customerEmailSent,
      smsSent: smsResult.success,
      smsProvider: smsResult.provider
    };
  } catch (error) {
    console.error('❌ Error processing booking:', error);
    return {
      emailSent: false,
      excelUpdated: false,
      customerEmailSent: false,
      smsSent: false
    };
  }
}

// Send OTP verification email
export async function sendOTPEmail(email: string, name: string, otp: string): Promise<boolean> {
  try {
    console.log(`📧 Sending OTP to: ${email}`);

    const mailOptions = {
      from: process.env.EMAIL_USER || '2akonsultant@gmail.com',
      to: email,
      subject: '🔐 Verify Your Email - Goodness Glamour Salon',
      // ✅ FIXED: Added plain text for OTP email
      text: `Hi ${name}! Your verification code for Goodness Glamour Salon is: ${otp}. This code expires in 10 minutes. Never share this code with anyone.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #fef5f1, #fef9f5, #f5f3f9); font-family: Georgia, serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
            <tr><td align="center">
              <table width="620" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08);">
                <tr><td style="background: linear-gradient(135deg, #ffeef5, #fff0f3, #f9f0ff); padding: 50px 40px; text-align: center;">
                  <h1 style="margin: 0; color: #d4a5a5; font-size: 36px; font-weight: 300; letter-spacing: 3px;">Goodness Glamour</h1>
                  <p style="margin: 8px 0 0; color: #b8a0a0; letter-spacing: 2px;">Ladies & Kids Salon</p>
                  <div style="margin-top: 25px; padding: 10px 30px; background: rgba(255,255,255,0.7); border-radius: 20px; display: inline-block;">
                    <p style="margin: 0; color: #c9a0a0; font-size: 13px; font-weight: 500;">🔐 Email Verification</p>
                  </div>
                </td></tr>
                <tr><td style="padding: 40px;">
                  <div style="background: linear-gradient(135deg, #fff5f0, #fff8f5); padding: 25px 30px; border-radius: 18px; margin-bottom: 30px; border: 1px solid #ffe8e0; text-align: center;">
                    <h2 style="margin: 0 0 10px; color: #c88080; font-size: 24px; font-weight: 400;">Welcome, ${name}! 💐</h2>
                    <p style="margin: 0; color: #d4a5a5; font-size: 16px; line-height: 1.6;">Please verify your email address to complete your registration.</p>
                  </div>
                  <div style="background: linear-gradient(135deg, #f8f5ff, #faf7ff); padding: 40px 30px; border-radius: 18px; margin-bottom: 30px; border: 1px solid #f0e8ff; text-align: center;">
                    <p style="margin: 0 0 20px; color: #a88cb8; font-size: 14px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">Your Verification Code</p>
                    <div style="background: #fff; padding: 25px; border-radius: 14px; border: 2px solid #d4b5d4; margin-bottom: 20px;">
                      <p style="margin: 0; font-size: 48px; font-weight: 700; color: #8080c0; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</p>
                    </div>
                    <p style="margin: 0; color: #b8a0b8; font-size: 14px;">This code will expire in <strong style="color: #8080c0;">10 minutes</strong></p>
                  </div>
                  <div style="background: linear-gradient(135deg, #f0f8ff, #f5faff); padding: 20px 25px; border-radius: 18px; border: 1px solid #e0e8ff;">
                    <p style="margin: 0; color: #8080c0; font-size: 13px; line-height: 1.6; text-align: center;">
                      🔒 <strong>Security Tip:</strong> Never share this code with anyone.
                    </p>
                  </div>
                </td></tr>
                <tr><td style="background: linear-gradient(135deg, #f8f5f0, #faf7f5); padding: 30px 40px; text-align: center; border-top: 1px solid rgba(212,165,165,0.1);">
                  <p style="margin: 0; color: #d4a5a5; font-size: 14px; line-height: 1.6;">
                    If you didn't sign up for <strong style="color: #c88080;">Goodness Glamour Salon</strong>, please ignore this email.
                  </p>
                  <p style="margin: 20px 0 0; color: #c0c0c0; font-size: 11px;">Need help? Contact us: 9036626642 | 2akonsultant@gmail.com</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    };

    await sendEmailWithPortFallback(mailOptions, 'OTP email');
    console.log(`✅ OTP email sent successfully to ${email}`);
    return true;
  } catch (error: any) {
    console.error('❌ Error sending OTP email:', error.message);
    logEmailError('Error sending OTP email', error);
    return false;
  }
}