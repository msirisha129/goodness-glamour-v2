/**
 * COMPREHENSIVE NOTIFICATION DIAGNOSTIC TEST
 * Tests Email, SMS, and WhatsApp notifications
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

console.log(`
╔══════════════════════════════════════════════════════════════════╗
║     🧪 GOODNESS GLAMOUR - NOTIFICATION SYSTEM DIAGNOSTIC         ║
╚══════════════════════════════════════════════════════════════════╝
`);

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(type, message) {
  const timestamp = new Date().toLocaleTimeString();
  switch(type) {
    case 'success':
      console.log(`${colors.green}✅ [${timestamp}] ${message}${colors.reset}`);
      break;
    case 'error':
      console.log(`${colors.red}❌ [${timestamp}] ${message}${colors.reset}`);
      break;
    case 'info':
      console.log(`${colors.blue}ℹ️  [${timestamp}] ${message}${colors.reset}`);
      break;
    case 'warning':
      console.log(`${colors.yellow}⚠️  [${timestamp}] ${message}${colors.reset}`);
      break;
    case 'config':
      console.log(`${colors.cyan}📋 [${timestamp}] ${message}${colors.reset}`);
      break;
  }
}

async function testEmailNotifications() {
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}📧 TESTING EMAIL NOTIFICATIONS${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════════════${colors.reset}\n`);

  const emailUser = process.env.EMAIL_USER || '2akonsultant@gmail.com';
  const emailPassword = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || '';

  log('config', `Email User: ${emailUser}`);
  log('config', `Email Password Set: ${emailPassword ? 'YES ✓' : 'NO ✗'}`);
  log('config', `Password Length: ${emailPassword.length} characters`);

  if (!emailPassword) {
    log('error', 'EMAIL_PASSWORD not configured in .env file');
    log('error', 'Booking emails will NOT be sent');
    return false;
  }

  try {
    log('info', 'Creating SMTP transporter...');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPassword
      },
      requireTLS: true,
      connectionTimeout: 30000,
      socketTimeout: 30000,
      pool: false
    });

    log('info', 'Verifying email connection...');
    await transporter.verify();
    log('success', 'EMAIL SERVICE: ✅ WORKING - Connection verified!');

    // Test send
    log('info', 'Sending test email...');
    const testResult = await transporter.sendMail({
      from: emailUser,
      to: emailUser,
      subject: '🧪 Goodness Glamour - Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d4a080;">✅ Email Service is Working!</h2>
          <p>This is a test email from Goodness Glamour Salon booking system.</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p style="color: #666;">You will receive:</p>
          <ul>
            <li>📧 Admin booking notifications</li>
            <li>📧 Customer confirmation emails</li>
            <li>📧 Appointment reminders</li>
          </ul>
          <p style="color: #d4a080; font-weight: bold;">Email notifications are ACTIVE! 🎉</p>
        </div>
      `
    });

    log('success', `Test email sent! Message ID: ${testResult.messageId}`);
    log('success', '📧 EMAIL NOTIFICATIONS: ✅ FULLY WORKING');
    return true;

  } catch (error) {
    log('error', `Email test failed: ${error.message}`);

    if (error.message.includes('Invalid login')) {
      log('error', '🔑 Authentication failed - Wrong Gmail App Password');
      log('error', 'FIX: Generate new App Password from https://myaccount.google.com/apppasswords');
    } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      log('error', '🌐 Network timeout - SMTP server unreachable');
      log('error', 'FIX: Check internet connection or firewall settings');
    }

    log('error', '📧 EMAIL NOTIFICATIONS: ❌ NOT WORKING');
    return false;
  }
}

async function testSMSConfiguration() {
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}📱 TESTING SMS NOTIFICATIONS${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════════════${colors.reset}\n`);

  const textlocalKey = process.env.TEXTLOCAL_API_KEY || '';
  const msg91Key = process.env.MSG91_API_KEY || '';
  const smsGatewayKey = process.env.SMS_GATEWAY_API_KEY || '';

  log('config', `TextLocal API Key: ${textlocalKey ? 'SET' : 'NOT SET'}`);
  log('config', `MSG91 API Key: ${msg91Key ? 'SET' : 'NOT SET'}`);
  log('config', `SMS Gateway Key: ${smsGatewayKey ? 'SET' : 'NOT SET'}`);

  if (!textlocalKey && !msg91Key && !smsGatewayKey) {
    log('warning', 'No SMS providers configured');
    log('warning', 'SMS notifications will NOT be sent to customers');
    log('info', 'To enable SMS:\n   • Get API key from TextLocal or MSG91\n   • Add to .env: TEXTLOCAL_API_KEY or MSG91_API_KEY\n   • Restart server');
    return false;
  }

  log('success', '📱 SMS CONFIGURATION: ⚠️  PARTIALLY CONFIGURED');
  log('info', 'SMS will attempt to send via available providers');
  return true;
}

async function testWhatsAppConfiguration() {
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}💬 TESTING WHATSAPP NOTIFICATIONS${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════════════${colors.reset}\n`);

  const whatsappBusinessKey = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '';
  const whatsappAccessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
  const whatsappPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

  log('config', `WhatsApp Business Account ID: ${whatsappBusinessKey ? 'SET' : 'NOT SET'}`);
  log('config', `WhatsApp Access Token: ${whatsappAccessToken ? 'SET' : 'NOT SET'}`);
  log('config', `WhatsApp Phone Number ID: ${whatsappPhoneId ? 'SET' : 'NOT SET'}`);

  if (!whatsappBusinessKey || !whatsappAccessToken || !whatsappPhoneId) {
    log('warning', 'WhatsApp Business API not fully configured');
    log('warning', 'WhatsApp notifications will NOT be sent');
    log('info', 'To enable WhatsApp:\n   • Set up WhatsApp Business API account\n   • Get credentials from Meta Developer Portal\n   • Add to .env: WHATSAPP_BUSINESS_ACCOUNT_ID, WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID\n   • Restart server');
    return false;
  }

  log('success', '💬 WHATSAPP CONFIGURATION: ✅ CONFIGURED');
  return true;
}

async function showBookingSimulation() {
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}📋 BOOKING NOTIFICATION FLOW${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════════════${colors.reset}\n`);

  log('info', 'When a customer books an appointment, here\'s what happens:');

  console.log(`
${colors.blue}1. CUSTOMER SUBMITS BOOKING${colors.reset}
   ✓ Customer fills booking form with details
   ✓ Data sent to server

${colors.blue}2. ADMIN NOTIFICATIONS${colors.reset}
   📧 Admin email sent to: 2akonsultant@gmail.com
   📝 Contains: Customer details, service, booking ID, amount
   
${colors.blue}3. CUSTOMER CONFIRMATIONS${colors.reset}
   📧 Email sent to: customer@email.com
   📱 SMS sent to: customer phone
   💬 WhatsApp sent to: customer WhatsApp (if configured)
   
${colors.blue}4. DATA STORAGE${colors.reset}
   📊 Excel file: data/contact-messages.xlsx
   🗄️  Database records

${colors.blue}5. STATUS${colors.reset}
   ✓ Booking appears in dashboard
   ✓ Customer journey tracked
`);
}

async function showCurrentStatus() {
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}📊 CURRENT SYSTEM STATUS${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════════════${colors.reset}\n`);

  let emailWorking = false;
  let smsConfigured = false;
  let whatsappConfigured = false;

  try {
    const emailPassword = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
    if (emailPassword) {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER || '2akonsultant@gmail.com',
          pass: emailPassword
        },
        requireTLS: true,
        connectionTimeout: 10000,
        socketTimeout: 10000,
        pool: false
      });
      await transporter.verify();
      emailWorking = true;
    }
  } catch (e) {}

  smsConfigured = !!( process.env.TEXTLOCAL_API_KEY || process.env.MSG91_API_KEY || process.env.SMS_GATEWAY_API_KEY);
  whatsappConfigured = !!(process.env.WHATSAPP_BUSINESS_ACCOUNT_ID && process.env.WHATSAPP_ACCESS_TOKEN);

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    NOTIFICATION STATUS                         ║
╠════════════════════════════════════════════════════════════════╣
║  📧 EMAIL NOTIFICATIONS:     ${emailWorking ? '✅ WORKING' : '❌ NOT WORKING        '}║
║  📱 SMS NOTIFICATIONS:       ${smsConfigured ? '✅ CONFIGURED' : '❌ NOT CONFIGURED    '}║
║  💬 WHATSAPP NOTIFICATIONS:  ${whatsappConfigured ? '✅ CONFIGURED' : '❌ NOT CONFIGURED    '}║
╚════════════════════════════════════════════════════════════════╝
`);

  if (!emailWorking) {
    console.log(`${colors.red}
⚠️  ISSUE DETECTED: Email notifications are not working!

${colors.reset}${colors.yellow}FIXES TO TRY:${colors.reset}
1. Check .env file has EMAIL_PASSWORD set
2. Verify Gmail App Password is correct (16 chars, no spaces)
3. Generate new App Password from: https://myaccount.google.com/apppasswords
4. Restart server after updating .env
5. Run this test again
${colors.reset}`);
  }
}

async function main() {
  try {
    await testEmailNotifications();
    await testSMSConfiguration();
    await testWhatsAppConfiguration();
    await showBookingSimulation();
    await showCurrentStatus();

    console.log(`
${colors.green}═══════════════════════════════════════════════════════════════════${colors.reset}
${colors.green}DIAGNOSTIC TEST COMPLETE${colors.reset}
${colors.green}═══════════════════════════════════════════════════════════════════${colors.reset}

${colors.yellow}📋 SUMMARY:${colors.reset}
• Check results above for each notification type
• Fix any ❌ issues shown above
• Restart server after making changes
• Test by making a booking at http://localhost:5000

${colors.yellow}📞 FOR HELP:${colors.reset}
• Email issues: See EMAIL_SETUP_GUIDE.md
• SMS issues: Check SMS provider configuration
• General help: See SETUP_INSTRUCTIONS.txt
${colors.reset}
`);

  } catch (error) {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

main().catch(console.error);

