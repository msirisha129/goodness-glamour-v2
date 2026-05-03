#!/usr/bin/env node

/**
 * SMS Testing Script
 * Test your SMS configuration before going live
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🧪 SMS Configuration Test');
console.log('========================\n');

// Check environment variables
console.log('📋 Checking Configuration...\n');

const configs = [
  { name: 'TextLocal API Key', key: 'TEXTLOCAL_API_KEY', required: false },
  { name: 'TextLocal Sender', key: 'TEXTLOCAL_SENDER', required: false },
  { name: 'MSG91 API Key', key: 'MSG91_API_KEY', required: false },
  { name: 'MSG91 Sender ID', key: 'MSG91_SENDER_ID', required: false },
  { name: 'Twilio Account SID', key: 'TWILIO_ACCOUNT_SID', required: false },
  { name: 'Twilio Auth Token', key: 'TWILIO_AUTH_TOKEN', required: false },
  { name: 'Twilio From Number', key: 'TWILIO_FROM_NUMBER', required: false },
];

let configuredProviders = 0;

configs.forEach(config => {
  const value = process.env[config.key];
  const status = value ? '✅ Configured' : '❌ Not configured';
  console.log(`${status} ${config.name}: ${value ? 'Set' : 'Missing'}`);
  
  if (value) {
    configuredProviders++;
  }
});

console.log(`\n📊 Summary: ${configuredProviders} SMS provider(s) configured\n`);

if (configuredProviders === 0) {
  console.log('❌ No SMS providers configured!');
  console.log('📝 Please add at least one SMS provider to your .env file:');
  console.log('   - TEXTLOCAL_API_KEY (Recommended for India)');
  console.log('   - MSG91_API_KEY (Alternative for India)');
  console.log('   - TWILIO_ACCOUNT_SID (Global but expensive)');
  console.log('\n📖 See SMS_SETUP_GUIDE.md for detailed instructions.\n');
  process.exit(1);
}

// Test SMS functionality
console.log('🚀 Testing SMS Functionality...\n');

async function testSMS() {
  try {
    // Dynamic import for ES modules
    const { testSMSConfiguration } = await import('./server/sms-service.js');
    
    // Get test phone number from command line or use default
    const testPhone = process.argv[2] || '+919876543210';
    
    console.log(`📱 Sending test SMS to: ${testPhone}`);
    console.log('⏳ Please wait...\n');
    
    const result = await testSMSConfiguration(testPhone);
    
    if (result.success) {
      console.log('✅ SMS Test Successful!');
      console.log(`📱 Provider: ${result.provider}`);
      console.log(`🆔 Message ID: ${result.messageId}`);
      console.log('\n🎉 Your SMS configuration is working perfectly!');
      console.log('📝 You can now process real bookings with SMS notifications.');
    } else {
      console.log('❌ SMS Test Failed!');
      console.log(`📱 Error: ${result.error}`);
      console.log(`📱 Provider: ${result.provider}`);
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check your API keys in .env file');
      console.log('2. Verify phone number format (+91xxxxxxxxxx)');
      console.log('3. Check provider dashboard for quota/balance');
      console.log('4. Try a different SMS provider');
    }
    
  } catch (error) {
    console.log('❌ Test Script Error:', error.message);
    console.log('\n🔧 Make sure to:');
    console.log('1. Run "npm install" to install dependencies');
    console.log('2. Add SMS provider credentials to .env file');
    console.log('3. Restart your server after configuration');
  }
}

// Run the test
testSMS().catch(console.error);

console.log('\n📖 For more help, see SMS_SETUP_GUIDE.md');
console.log('💡 Usage: node test-sms.js +91xxxxxxxxxx');
