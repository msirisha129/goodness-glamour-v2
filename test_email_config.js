// Quick test to verify email configuration
require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
  const user = process.env.EMAIL_USER || '2akonsultant@gmail.com';
  const pass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || '';

  console.log('🧪 Testing Email Configuration...');
  console.log(`📧 Email User: ${user}`);
  console.log(`🔑 Password Length: ${pass.length} chars`);
  console.log(`✓ Password Set: ${pass ? 'YES' : 'NO'}`);

  if (!pass) {
    console.error('❌ ERROR: EMAIL_PASSWORD not set in .env file!');
    console.error('Please add EMAIL_PASSWORD to .env and restart server');
    process.exit(1);
  }

  try {
    console.log('\n📧 Creating SMTP transporter...');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: user,
        pass: pass
      },
      requireTLS: true,
      connectionTimeout: 30000,
      socketTimeout: 30000
    });

    console.log('🔗 Verifying connection...');
    await transporter.verify();
    console.log('✅ SUCCESS! Email configuration is valid!');
    console.log('📧 You can now send emails.');

  } catch (error) {
    console.error('❌ FAILED! Email configuration error:');
    console.error('Error:', error.message);

    if (error.message.includes('Invalid login')) {
      console.error('\n🔑 FIX: Wrong Gmail App Password');
      console.error('   1. Go to: https://myaccount.google.com/apppasswords');
      console.error('   2. Generate new App Password');
      console.error('   3. Update EMAIL_PASSWORD in .env');
      console.error('   4. Restart server');
    }

    if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      console.error('\n🌐 FIX: Network/Firewall issue');
      console.error('   • Check internet connection');
      console.error('   • Firewall might block SMTP port 587');
      console.error('   • Try VPN if on restricted network');
    }

    process.exit(1);
  }
};

(async () => {
  await testEmail();
})();

