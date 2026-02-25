import { Resend } from 'resend';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function runTests() {
  console.log('=============================================');
  console.log('🧪 RUNNING RESEND EMAIL DIAGNOSTIC TESTS 🧪');
  console.log('=============================================');
  console.log(`API Key configured: ${process.env.RESEND_API_KEY ? '✅ YES' : '❌ NO'}`);
  
  if (!process.env.RESEND_API_KEY) {
    console.error('Test Aborted: RESEND_API_KEY is not defined in the environment.');
    return;
  }

  // 1. Test sending a verified domain email to catching any configuration errors
  console.log('\n[Test 1] Attempting to send an email using noreply@withrin.co...');
  try {
    const { data, error } = await resend.emails.send({
      from: 'RIN Security <noreply@withrin.co>',
      to: 'delivered@resend.dev', // Resend's testing sink address
      subject: 'Test Email Configuration',
      html: '<p>Testing Resend configuration.</p>'
    });

    if (error) {
      console.error('❌ Test 1 Failed! The API rejected the request.');
      console.error('Error Details:', JSON.stringify(error, null, 2));
      console.log('\n🔍 Hypothesis:');
      if (error.message && error.message.toLowerCase().includes('domain')) {
         console.log('- The domain "withrin.co" might not be fully verified in the Resend dashboard.');
         console.log('- DNS records (TXT/MX) may still be propagating.');
      }
    } else {
      console.log('✅ Test 1 Passed! Email request was accepted by Resend.');
      console.log('Response Data:', data);
    }
  } catch (err: any) {
    console.error('🚨 Unexpected Error during Test 1:', err.message);
  }

  // 2. Test database connection check to ensure it's not a Better Auth DB failure
  console.log('\n[Test 2] Database Connection Sanity Check...');
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ Test 2 Failed! DATABASE_URL is missing.');
  } else {
    // Basic format check to confirm valid connection string
    if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
      console.log('✅ Test 2 Passed! Database connection string is present and correctly formatted.');
    } else {
      console.error('❌ Test 2 Failed! Database connection string seems malformed.');
    }
  }

  console.log('\n=============================================');
  console.log('🏁 TESTS COMPLETE 🏁');
  console.log('=============================================');
}

runTests();
