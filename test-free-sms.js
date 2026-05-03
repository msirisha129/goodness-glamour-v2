#!/usr/bin/env node

/**
 * FREE SMS Testing Script
 * Test your FREE SMS configuration
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🆓 FREE SMS Configuration Test');
console.log('=============================\n');

// Check which free services are configured
console.log('📋 Checking FREE SMS Providers...\n');

const freeProviders = [
  { 
    name: 'Twilio Free Trial', 
    keys: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM_NUMBER'],
    cost: '$15 FREE credits (~2000 SMS)',
    setup: 'https://www.twilio.com/try-twilio'
  },
  { 
    name: 'TextLocal Free Credits', 
    keys: ['TEXTLOCAL_API_KEY'],
    cost: '₹100 FREE credits (~500 SMS)',
    setup: 'https://www.textlocal.in/'
  },
  { 
    name: 'MSG91 Free Trial', 
    keys: ['MSG91_API_KEY', 'MSG91_SENDER_ID'],
    cost: '100 FREE SMS messages',
    setup: 'https://msg91.com/'
  }
];

let configuredProviders = [];

freeProviders.forEach(provider => {
  const configured = provider.keys.every(key => process.env[key]);
  const status = configured ? '✅ Ready' : '❌ Not configured';
  console.log(`${status} ${provider.name}`);
  console.log(`   💰 ${provider.cost}`);
  console.log(`   🔗 Setup: ${provider.setup}`);
  console.log('');
  
  if (configured) {
    configuredProviders.push(provider);
  }
});

if (configuredProviders.length === 0) {
  console.log('❌ No FREE SMS providers configured!');
  console.log('\n🚀 Quick Setup Options:\n');
  
  console.log('1️⃣ TWILIO (Recommended - Most Reliable):');
  console.log('   • Sign up: https://www.twilio.com/try-twilio');
  console.log('   • Get $15 FREE credits (2000+ SMS)');
  console.log('   • No credit card required');
  console.log('   • Add to .env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER\n');
  
  console.log('2️⃣ TextLocal (India Focus):');
  console.log('   • Sign up: https://www.textlocal.in/');
  console.log('   • Get ₹100 FREE credits (500+ SMS)');
  console.log('   • Perfect for Indian customers');
  console.log('   • Add to .env: TEXTLOCAL_API_KEY\n');
  
  console.log('3️⃣ MSG91 (Alternative):');
  console.log('   • Sign up: https://msg91.com/');
  console.log('   • Get 100 FREE SMS messages');
  console.log('   • Good for testing');
  console.log('   • Add to .env: MSG91_API_KEY, MSG91_SENDER_ID\n');
  
  console.log('📖 See FREE_SMS_SETUP.md for detailed instructions.\n');
  process.exit(1);
}

// Test SMS functionality
console.log('🧪 Testing FREE SMS...\n');

async function testFreeSMS() {
  try {
    // Dynamic import for ES modules
    const { testSMSConfiguration } = await import('./server/sms-service.js');
    
    // Get test phone number from command line or use default
    const testPhone = process.argv[2] || '+919876543210';
    
    console.log(`📱 Sending test SMS to: ${testPhone}`);
    console.log('⏳ Please wait...\n');
    
    const result = await testSMSConfiguration(testPhone);
    
    if (result.success) {
      console.log('🎉 FREE SMS Test Successful!');
      console.log(`📱 Provider: ${result.provider}`);
      console.log(`🆔 Message ID: ${result.messageId}`);
      console.log('\n✅ Your FREE SMS setup is working perfectly!');
      console.log('🚀 You can now process real bookings with SMS notifications.');
      console.log('\n💰 Cost: $0 (using free trial credits)');
    } else {
      console.log('❌ FREE SMS Test Failed!');
      console.log(`📱 Error: ${result.error}`);
      console.log(`📱 Provider: ${result.provider}`);
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check your API keys in .env file');
      console.log('2. Verify phone number format (+91xxxxxxxxxx)');
      console.log('3. Check if free credits are available');
      console.log('4. Try a different provider');
    }
    
  } catch (error) {
    console.log('❌ Test Error:', error.message);
    console.log('\n🔧 Make sure to:');
    console.log('1. Run "npm install" first');
    console.log('2. Add FREE provider credentials to .env');
    console.log('3. Restart server after configuration');
  }
}

// Show usage instructions
console.log('💡 Usage Examples:');
console.log('   node test-free-sms.js +919876543210');
console.log('   node test-free-sms.js +1234567890');
console.log('');

// Run the test
testFreeSMS().catch(console.error);

console.log('\n📖 For detailed setup: FREE_SMS_SETUP.md');
console.log('🆓 Remember: This is completely FREE for trial!');
