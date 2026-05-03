import axios from 'axios';

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  apiVersion: string;
}

export interface WhatsAppMessage {
  to: string;
  message: string;
  bookingId?: string;
  customerName?: string;
}

export interface WhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class WhatsAppService {
  private config: WhatsAppConfig;
  private baseUrl: string;

  constructor(config: WhatsAppConfig) {
    this.config = config;
    this.baseUrl = `https://graph.facebook.com/${this.config.apiVersion}`;
  }

  /**
   * Send WhatsApp message
   */
  async sendMessage(whatsappMessage: WhatsAppMessage): Promise<WhatsAppResult> {
    try {
      console.log(`📱 Sending WhatsApp message to: ${whatsappMessage.to}`);

      const response = await axios.post(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: whatsappMessage.to.replace(/^\+91/, '91'), // Ensure proper format
          type: 'text',
          text: {
            body: whatsappMessage.message
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.messages && response.data.messages[0]) {
        console.log(`✅ WhatsApp message sent successfully`);
        return {
          success: true,
          messageId: response.data.messages[0].id
        };
      } else {
        throw new Error('Invalid response from WhatsApp API');
      }
    } catch (error: any) {
      console.error('❌ WhatsApp message failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Send booking confirmation WhatsApp message
   */
  async sendBookingConfirmationMessage(booking: {
    id: string;
    customerName: string;
    customerPhone: string;
    appointmentDate: string;
    appointmentTime: string;
    services: string[];
    totalAmount: number;
    customerAddress: string;
  }): Promise<WhatsAppResult> {
    const message = this.formatBookingConfirmationMessage(booking);

    return this.sendMessage({
      to: booking.customerPhone,
      message: message,
      bookingId: booking.id,
      customerName: booking.customerName
    });
  }

  /**
   * Format booking confirmation message
   */
  private formatBookingConfirmationMessage(booking: {
    customerName: string;
    appointmentDate: string;
    appointmentTime: string;
    services: string[];
    totalAmount: number;
    customerAddress: string;
    id: string;
  }): string {
    const date = new Date(booking.appointmentDate).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });

    const serviceList = booking.services.length > 2
      ? `${booking.services.slice(0, 2).join(', ')} & ${booking.services.length - 2} more`
      : booking.services.join(', ');

    return `💐 *Goodness Glamour Salon*

Hi ${booking.customerName}!

✅ Your booking is *confirmed*!

📅 ${date} at ${booking.appointmentTime}
💇‍♀️ ${serviceList}
💰 ₹${booking.totalAmount}
📍 ${booking.customerAddress}

🆔 Booking ID: ${booking.id}

📞 Need help? Call: 9036626642

Thank you for choosing us! 🌸`;
  }

  /**
   * Send appointment reminder WhatsApp message
   */
  async sendAppointmentReminderMessage(booking: {
    customerName: string;
    customerPhone: string;
    appointmentDate: string;
    appointmentTime: string;
    services: string[];
  }): Promise<WhatsAppResult> {
    const message = `💐 *Goodness Glamour Salon*

Hi ${booking.customerName}!

⏰ *Reminder*: Your appointment is tomorrow at ${booking.appointmentTime}
💇‍♀️ Services: ${booking.services.join(', ')}

📍 Please be ready at your specified address.

📞 Any changes? Call: 9036626642

See you soon! 🌸`;

    return this.sendMessage({
      to: booking.customerPhone,
      message: message,
      customerName: booking.customerName
    });
  }

  /**
   * Test WhatsApp configuration
   */
  async testWhatsAppConfig(testPhoneNumber: string): Promise<WhatsAppResult> {
    const testMessage = `💐 *Goodness Glamour Salon*

🧪 *Test Message* - WhatsApp configuration working!

If you received this, WhatsApp notifications are properly set up.

📞 Contact: 9036626642`;

    return this.sendMessage({
      to: testPhoneNumber,
      message: testMessage
    });
  }
}

// Create and export WhatsApp service instance
const createWhatsAppService = (): WhatsAppService | null => {
  const config: WhatsAppConfig = {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v18.0'
  };

  // Only create service if all required config is present
  if (!config.accessToken || !config.phoneNumberId) {
    console.log('⚠️ WhatsApp not configured - missing access token or phone number ID');
    return null;
  }

  return new WhatsAppService(config);
};

export const whatsappService = createWhatsAppService();

// Export individual functions for easy use
export const sendBookingConfirmationWhatsApp = (booking: any) => whatsappService?.sendBookingConfirmationMessage(booking);
export const sendAppointmentReminderWhatsApp = (booking: any) => whatsappService?.sendAppointmentReminderMessage(booking);
export const testWhatsAppConfiguration = (phoneNumber: string) => whatsappService?.testWhatsAppConfig(phoneNumber);
export const sendCustomWhatsApp = (to: string, message: string) => whatsappService?.sendMessage({ to, message });
