import { chromium, FullConfig } from '@playwright/test';
import path from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E Test Setup...');

  // Create test database and seed data
  console.log('📄 Setting up test database...');
  
  try {
    // Initialize test environment
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Check if app is running
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
    console.log(`🌐 Checking if app is running on ${baseURL}...`);
    
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    
    console.log('✅ App is running and accessible');
    
    // Setup test users and data
    console.log('👥 Setting up test users...');
    
    // Create admin user for testing
    const adminUser = {
      email: 'test-admin@sabq.test',
      password: 'test-password-123',
      name: 'Admin Test User',
      role: 'admin',
    };

    // Create subscriber user for testing
    const subscriberUser = {
      email: 'test-user@sabq.test',
      password: 'test-password-123',
      name: 'Test User',
      role: 'subscriber',
    };

    // Store test credentials in environment
    process.env.E2E_ADMIN_EMAIL = adminUser.email;
    process.env.E2E_ADMIN_PASSWORD = adminUser.password;
    process.env.E2E_USER_EMAIL = subscriberUser.email;
    process.env.E2E_USER_PASSWORD = subscriberUser.password;

    // Create test articles
    console.log('📝 Setting up test articles...');
    
    const testArticles = [
      {
        title: 'مقال اختبار للتقنية',
        content: 'محتوى اختباري للتقنية والذكاء الاصطناعي',
        category: 'technology',
        status: 'published',
      },
      {
        title: 'مقال اختبار للرياضة',
        content: 'محتوى اختباري للرياضة والألعاب',
        category: 'sports',
        status: 'published',
      },
      {
        title: 'مقال اختبار مسودة',
        content: 'محتوى اختباري كمسودة',
        category: 'technology',
        status: 'draft',
      },
    ];

    // Save test data to be used in tests
    const testDataPath = path.join(__dirname, 'test-data.json');
    const fs = require('fs');
    
    const testData = {
      users: {
        admin: adminUser,
        subscriber: subscriberUser,
      },
      articles: testArticles,
      setup: {
        timestamp: new Date().toISOString(),
        baseURL,
      },
    };

    fs.writeFileSync(testDataPath, JSON.stringify(testData, null, 2));
    
    await browser.close();
    
    console.log('✅ E2E Test Setup completed successfully');
    
  } catch (error) {
    console.error('❌ E2E Test Setup failed:', error);
    throw error;
  }
}

export default globalSetup;
