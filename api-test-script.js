/**
 * Comprehensive API Testing Script
 * Tests all frontend APIs and generates a detailed report
 */

const axios = require('axios');
const fs = require('fs');

// API Configuration
const PRODUCTION_BASE_URL = 'https://eventmarketersbackend.onrender.com';
const LOCAL_BASE_URL = 'http://192.168.1.22:3001';

// Use production URL for testing
const BASE_URL = PRODUCTION_BASE_URL;

// Test data - Using actual token from app logs
let authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZ2V4ZnpwZzAwMDBnandkOTdhenNzOHYiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJ1c2VyVHlwZSI6Ik1PQklMRV9VU0VSIiwiaWF0IjoxNzYwMzQ4OTA4LCJleHAiOjE3NjA5NTM3MDh9.WdMvqkqmtiWP8uP8Le2uCP1HaXoWfyYfQgE4NlMiyXU';
let testUserId = 'cmgexfzpg0000gjwd97azss8v';

// Results storage
const results = {
  working: [],
  nonWorking: [],
  total: 0,
  workingCount: 0,
  nonWorkingCount: 0
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

// Helper function to log with color
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function to test an API endpoint
async function testEndpoint(name, method, endpoint, data = null, requiresAuth = false, category = 'General') {
  results.total++;
  
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      timeout: 10000,
    };

    if (requiresAuth && authToken) {
      config.headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      };
    } else {
      config.headers = {
        'Content-Type': 'application/json'
      };
    }

    if (data) {
      if (method.toLowerCase() === 'get') {
        config.params = data;
      } else {
        config.data = data;
      }
    }

    const response = await axios(config);
    
    if (response.status >= 200 && response.status < 300) {
      results.working.push({
        name,
        method,
        endpoint,
        category,
        status: response.status,
        requiresAuth
      });
      results.workingCount++;
      log(`✅ PASS: ${name}`, 'green');
      return { success: true, data: response.data };
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    const errorDetails = error.response ? {
      status: error.response.status,
      message: error.response.data?.message || error.message
    } : {
      status: 'Network Error',
      message: error.message
    };

    results.nonWorking.push({
      name,
      method,
      endpoint,
      category,
      error: errorDetails,
      requiresAuth
    });
    results.nonWorkingCount++;
    log(`❌ FAIL: ${name} - ${errorDetails.message}`, 'red');
    return { success: false, error: errorDetails };
  }
}

// Test functions organized by category

async function testAuthenticationAPIs() {
  log('\n' + '='.repeat(60), 'blue');
  log('TESTING AUTHENTICATION APIs', 'bold');
  log('='.repeat(60), 'blue');
  log('🔑 Using auth token from app logs', 'yellow');

  // Test Get Profile
  await testEndpoint(
    'Get User Profile',
    'GET',
    '/api/auth/profile',
    null,
    true,
    'Authentication'
  );

  // Note: Skipping registration/login tests as we have a valid token
  // These endpoints may require different paths or may not be publicly exposed
}

async function testSubscriptionAPIs() {
  log('\n' + '='.repeat(60), 'blue');
  log('TESTING SUBSCRIPTION APIs', 'bold');
  log('='.repeat(60), 'blue');

  await testEndpoint(
    'Get Subscription Plans',
    'GET',
    '/api/mobile/subscriptions/plans',
    null,
    false,
    'Subscription'
  );

  await testEndpoint(
    'Get Subscription Status',
    'GET',
    '/api/mobile/subscriptions/status',
    null,
    true,
    'Subscription'
  );

  await testEndpoint(
    'Get Subscription History',
    'GET',
    '/api/mobile/subscriptions/history',
    null,
    true,
    'Subscription'
  );

  await testEndpoint(
    'Subscribe to Plan',
    'POST',
    '/api/mobile/subscriptions/subscribe',
    {
      planId: 'quarterly_pro',
      paymentMethod: 'razorpay',
      autoRenew: true
    },
    true,
    'Subscription'
  );

  await testEndpoint(
    'Cancel Subscription',
    'POST',
    '/api/mobile/subscriptions/cancel',
    null,
    true,
    'Subscription'
  );
}

async function testTransactionAPIs() {
  log('\n' + '='.repeat(60), 'blue');
  log('TESTING TRANSACTION APIs', 'bold');
  log('='.repeat(60), 'blue');

  await testEndpoint(
    'Get Transactions',
    'GET',
    '/api/mobile/transactions',
    null,
    true,
    'Transaction'
  );

  await testEndpoint(
    'Add Transaction',
    'POST',
    '/api/mobile/transactions',
    {
      transactionId: `txn_${Date.now()}`,
      orderId: `order_${Date.now()}`,
      amount: 499,
      currency: 'INR',
      status: 'success',
      plan: 'quarterly_pro',
      planName: 'Quarterly Pro',
      description: 'Test transaction',
      paymentMethod: 'razorpay',
      paymentId: `pay_${Date.now()}`
    },
    true,
    'Transaction'
  );

  await testEndpoint(
    'Get Transaction Summary',
    'GET',
    '/api/mobile/transactions/summary',
    null,
    true,
    'Transaction'
  );
}

async function testGreetingAPIs() {
  log('\n' + '='.repeat(60), 'blue');
  log('TESTING GREETING APIs', 'bold');
  log('='.repeat(60), 'blue');

  await testEndpoint(
    'Get Greeting Categories',
    'GET',
    '/api/mobile/greetings/categories',
    null,
    true,
    'Greeting'
  );

  await testEndpoint(
    'Get Greeting Templates',
    'GET',
    '/api/mobile/greetings/templates',
    { category: 'birthday' },
    true,
    'Greeting'
  );

  await testEndpoint(
    'Search Greeting Templates',
    'GET',
    '/api/mobile/greetings/templates/search',
    { q: 'happy' },
    true,
    'Greeting'
  );

  await testEndpoint(
    'Get Stickers',
    'GET',
    '/api/mobile/greetings/stickers',
    null,
    true,
    'Greeting'
  );

  await testEndpoint(
    'Get Emojis',
    'GET',
    '/api/mobile/greetings/emojis',
    null,
    true,
    'Greeting'
  );
}

async function testHomeAPIs() {
  log('\n' + '='.repeat(60), 'blue');
  log('TESTING HOME SCREEN APIs', 'bold');
  log('='.repeat(60), 'blue');

  await testEndpoint(
    'Get Featured Content',
    'GET',
    '/api/mobile/home/featured',
    { limit: 10 },
    true,
    'Home'
  );

  await testEndpoint(
    'Get Upcoming Events',
    'GET',
    '/api/mobile/home/upcoming-events',
    { limit: 20 },
    true,
    'Home'
  );

  await testEndpoint(
    'Get Professional Templates',
    'GET',
    '/api/mobile/home/templates',
    { limit: 20, sortBy: 'popular' },
    true,
    'Home'
  );

  await testEndpoint(
    'Get Video Content',
    'GET',
    '/api/mobile/home/video-content',
    { limit: 20 },
    true,
    'Home'
  );

  await testEndpoint(
    'Search Home Content',
    'GET',
    '/api/mobile/home/search',
    { q: 'business', type: 'all' },
    true,
    'Home'
  );
}

async function testTemplateAPIs() {
  log('\n' + '='.repeat(60), 'blue');
  log('TESTING TEMPLATE APIs', 'bold');
  log('='.repeat(60), 'blue');

  await testEndpoint(
    'Get Templates',
    'GET',
    '/api/mobile/templates',
    { category: 'free', limit: 20 },
    true,
    'Template'
  );

  await testEndpoint(
    'Get Template by ID',
    'GET',
    '/api/mobile/templates/test-id',
    null,
    true,
    'Template'
  );

  await testEndpoint(
    'Get Languages',
    'GET',
    '/api/mobile/templates/languages',
    null,
    true,
    'Template'
  );
}

async function testBusinessProfileAPIs() {
  log('\n' + '='.repeat(60), 'blue');
  log('TESTING BUSINESS PROFILE APIs', 'bold');
  log('='.repeat(60), 'blue');

  await testEndpoint(
    'Get Business Categories',
    'GET',
    '/api/mobile/business-categories',
    null,
    true,
    'Business Profile'
  );

  await testEndpoint(
    'Create Business Profile',
    'POST',
    '/api/business-profile/profile',
    {
      businessName: 'Test Business',
      businessEmail: 'business@test.com',
      businessPhone: '+1234567890',
      businessCategory: 'retail',
      businessAddress: '123 Test St',
      businessDescription: 'Test business description'
    },
    true,
    'Business Profile'
  );
}

async function testHealthAPI() {
  log('\n' + '='.repeat(60), 'blue');
  log('TESTING HEALTH CHECK API', 'bold');
  log('='.repeat(60), 'blue');

  await testEndpoint(
    'Health Check',
    'GET',
    '/health',
    null,
    false,
    'Health'
  );
}

async function testPaymentAPIs() {
  log('\n' + '='.repeat(60), 'blue');
  log('TESTING PAYMENT APIs', 'bold');
  log('='.repeat(60), 'blue');

  await testEndpoint(
    'Create Razorpay Order',
    'POST',
    '/api/mobile/payment/create-order',
    {
      amount: 499,
      currency: 'INR',
      planId: 'quarterly_pro'
    },
    true,
    'Payment'
  );

  await testEndpoint(
    'Verify Payment',
    'POST',
    '/api/mobile/payment/verify',
    {
      razorpay_order_id: 'order_test',
      razorpay_payment_id: 'pay_test',
      razorpay_signature: 'sig_test'
    },
    true,
    'Payment'
  );
}

async function testFestivalAPIs() {
  log('\n' + '='.repeat(60), 'blue');
  log('TESTING FESTIVAL APIs', 'bold');
  log('='.repeat(60), 'blue');

  await testEndpoint(
    'Get Festivals',
    'GET',
    '/api/mobile/festivals',
    { month: new Date().getMonth() + 1, year: new Date().getFullYear() },
    true,
    'Festival'
  );

  await testEndpoint(
    'Get Festival Categories',
    'GET',
    '/api/mobile/festivals/categories',
    null,
    true,
    'Festival'
  );
}

async function testBannerAPIs() {
  log('\n' + '='.repeat(60), 'blue');
  log('TESTING BANNER APIs', 'bold');
  log('='.repeat(60), 'blue');

  await testEndpoint(
    'Get Banners',
    'GET',
    '/api/mobile/banners',
    { category: 'featured' },
    true,
    'Banner'
  );

  await testEndpoint(
    'Get Active Banners',
    'GET',
    '/api/mobile/banners/active',
    null,
    true,
    'Banner'
  );
}

async function testMediaAPIs() {
  log('\n' + '='.repeat(60), 'blue');
  log('TESTING MEDIA APIs', 'bold');
  log('='.repeat(60), 'blue');

  await testEndpoint(
    'Get Images',
    'GET',
    '/api/mobile/media/images',
    { category: 'all', limit: 20 },
    true,
    'Media'
  );

  await testEndpoint(
    'Get Videos',
    'GET',
    '/api/mobile/media/videos',
    { category: 'all', limit: 20 },
    true,
    'Media'
  );
}

// Generate detailed report
function generateReport() {
  log('\n' + '='.repeat(60), 'blue');
  log('API TEST SUMMARY', 'bold');
  log('='.repeat(60), 'blue');
  
  log(`\n📊 Total APIs Tested: ${results.total}`, 'yellow');
  log(`✅ Working: ${results.workingCount} (${((results.workingCount/results.total)*100).toFixed(1)}%)`, 'green');
  log(`❌ Not Working: ${results.nonWorkingCount} (${((results.nonWorkingCount/results.total)*100).toFixed(1)}%)`, 'red');

  // Group by category
  const categorizedWorking = {};
  const categorizedNonWorking = {};

  results.working.forEach(api => {
    if (!categorizedWorking[api.category]) {
      categorizedWorking[api.category] = [];
    }
    categorizedWorking[api.category].push(api);
  });

  results.nonWorking.forEach(api => {
    if (!categorizedNonWorking[api.category]) {
      categorizedNonWorking[api.category] = [];
    }
    categorizedNonWorking[api.category].push(api);
  });

  // Working APIs by category
  log('\n' + '='.repeat(60), 'green');
  log('✅ WORKING APIs BY CATEGORY', 'bold');
  log('='.repeat(60), 'green');
  
  Object.keys(categorizedWorking).sort().forEach(category => {
    log(`\n${category} (${categorizedWorking[category].length})`, 'yellow');
    categorizedWorking[category].forEach(api => {
      log(`  ✅ ${api.method} ${api.endpoint}`, 'green');
      log(`     Name: ${api.name}`, 'reset');
      log(`     Status: ${api.status}`, 'reset');
      log(`     Requires Auth: ${api.requiresAuth ? 'Yes' : 'No'}`, 'reset');
    });
  });

  // Non-working APIs by category
  log('\n' + '='.repeat(60), 'red');
  log('❌ NON-WORKING APIs BY CATEGORY', 'bold');
  log('='.repeat(60), 'red');
  
  Object.keys(categorizedNonWorking).sort().forEach(category => {
    log(`\n${category} (${categorizedNonWorking[category].length})`, 'yellow');
    categorizedNonWorking[category].forEach(api => {
      log(`  ❌ ${api.method} ${api.endpoint}`, 'red');
      log(`     Name: ${api.name}`, 'reset');
      log(`     Error: ${api.error.status} - ${api.error.message}`, 'reset');
      log(`     Requires Auth: ${api.requiresAuth ? 'Yes' : 'No'}`, 'reset');
    });
  });

  // Save detailed report to file
  const reportData = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      total: results.total,
      working: results.workingCount,
      nonWorking: results.nonWorkingCount,
      successRate: `${((results.workingCount/results.total)*100).toFixed(1)}%`
    },
    workingAPIs: categorizedWorking,
    nonWorkingAPIs: categorizedNonWorking
  };

  fs.writeFileSync('api-test-report.json', JSON.stringify(reportData, null, 2));
  log('\n📄 Detailed report saved to: api-test-report.json', 'yellow');

  // Generate markdown report
  let markdown = `# API Test Report\n\n`;
  markdown += `**Generated:** ${new Date().toISOString()}\n`;
  markdown += `**Base URL:** ${BASE_URL}\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `- **Total APIs Tested:** ${results.total}\n`;
  markdown += `- **Working:** ${results.workingCount} (${((results.workingCount/results.total)*100).toFixed(1)}%)\n`;
  markdown += `- **Not Working:** ${results.nonWorkingCount} (${((results.nonWorkingCount/results.total)*100).toFixed(1)}%)\n\n`;

  markdown += `## ✅ Working APIs\n\n`;
  Object.keys(categorizedWorking).sort().forEach(category => {
    markdown += `### ${category}\n\n`;
    categorizedWorking[category].forEach(api => {
      markdown += `- **${api.name}**\n`;
      markdown += `  - Method: \`${api.method}\`\n`;
      markdown += `  - Endpoint: \`${api.endpoint}\`\n`;
      markdown += `  - Status: ${api.status}\n`;
      markdown += `  - Requires Auth: ${api.requiresAuth ? 'Yes' : 'No'}\n\n`;
    });
  });

  markdown += `## ❌ Non-Working APIs\n\n`;
  Object.keys(categorizedNonWorking).sort().forEach(category => {
    markdown += `### ${category}\n\n`;
    categorizedNonWorking[category].forEach(api => {
      markdown += `- **${api.name}**\n`;
      markdown += `  - Method: \`${api.method}\`\n`;
      markdown += `  - Endpoint: \`${api.endpoint}\`\n`;
      markdown += `  - Error: ${api.error.status} - ${api.error.message}\n`;
      markdown += `  - Requires Auth: ${api.requiresAuth ? 'Yes' : 'No'}\n\n`;
    });
  });

  fs.writeFileSync('api-test-report.md', markdown);
  log('📄 Markdown report saved to: api-test-report.md', 'yellow');
}

// Main test execution
async function runAllTests() {
  log('\n' + '='.repeat(60), 'blue');
  log('🚀 STARTING COMPREHENSIVE API TESTS', 'bold');
  log('='.repeat(60), 'blue');
  log(`Testing against: ${BASE_URL}`, 'yellow');
  log(`Using valid auth token from app\n`, 'green');

  try {
    await testHealthAPI();
    await testAuthenticationAPIs();
    await testSubscriptionAPIs();
    await testTransactionAPIs();
    await testGreetingAPIs();
    await testHomeAPIs();
    await testTemplateAPIs();
    await testBusinessProfileAPIs();
    await testPaymentAPIs();
    await testFestivalAPIs();
    await testBannerAPIs();
    await testMediaAPIs();

    generateReport();
    
    log('\n' + '='.repeat(60), 'blue');
    log('🎉 API TESTING COMPLETED', 'bold');
    log('='.repeat(60), 'blue');
    
  } catch (error) {
    log(`\n❌ Fatal error during testing: ${error.message}`, 'red');
    console.error(error);
  }
}

// Run tests
runAllTests();

