/**
 * HCM Screenshot Automation Script
 * 
 * This script automatically captures screenshots of all HCM system pages
 * for documentation purposes. It handles authentication and navigates 
 * through all major pages of the application.
 * 
 * Usage:
 * 1. Make sure both frontend and backend servers are running
 * 2. Run: node scripts/capture-screenshots.js
 * 
 * Requirements:
 * - puppeteer (install with: npm install --save-dev puppeteer)
 * - Both servers running (frontend on :5173, backend on :3000)
 * - Admin account exists with credentials: admin@example.com / hashed
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const ADMIN_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'hashed'
};

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Pages to capture with their correct navigation URLs
const PAGES = [
  {
    name: 'login',
    description: 'Login Page',
    requiresAuth: false,
    waitTime: 2000,
    navigate: async (page) => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0', timeout: 30000 });
    }
  },
  {
    name: 'dashboard',
    description: 'Dashboard Overview',
    requiresAuth: true,
    waitTime: 3000,
    navigate: async (page) => {
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0', timeout: 30000 });
    }
  },
  {
    name: 'employees',
    description: 'Employee Management',
    requiresAuth: true,
    waitTime: 3000,
    navigate: async (page) => {
      await page.goto(`${BASE_URL}/dashboard/employees`, { waitUntil: 'networkidle0', timeout: 30000 });
    }
  },
  {
    name: 'teams',
    description: 'Team Management',
    requiresAuth: true,
    waitTime: 3000,
    navigate: async (page) => {
      await page.goto(`${BASE_URL}/dashboard/teams`, { waitUntil: 'networkidle0', timeout: 30000 });
    }
  },
  {
    name: 'attendance',
    description: 'Attendance Tracking',
    requiresAuth: true,
    waitTime: 3000,
    navigate: async (page) => {
      await page.goto(`${BASE_URL}/dashboard/attendance`, { waitUntil: 'networkidle0', timeout: 30000 });
    }
  },
  {
    name: 'leaves',
    description: 'Leave Management',
    requiresAuth: true,
    waitTime: 3000,
    navigate: async (page) => {
      await page.goto(`${BASE_URL}/dashboard/leaves`, { waitUntil: 'networkidle0', timeout: 30000 });
    }
  },
  {
    name: 'internships',
    description: 'Internship Programs',
    requiresAuth: true,
    waitTime: 3000,
    navigate: async (page) => {
      await page.goto(`${BASE_URL}/dashboard/internships`, { waitUntil: 'networkidle0', timeout: 30000 });
    }
  },
  {
    name: 'public-application',
    description: 'Public Application Form',
    requiresAuth: false,
    waitTime: 3000,
    navigate: async (page) => {
      await page.goto(`${BASE_URL}/apply/best-internship-ever-1757552368144`, { waitUntil: 'networkidle0', timeout: 30000 });
    }
  }
];

async function takeScreenshot(page, pageInfo) {
  try {
    console.log(`📸 Capturing ${pageInfo.description}...`);
    
    // Navigate using the custom navigation method
    await pageInfo.navigate(page);
    
    // Wait for page to fully load
    await new Promise(resolve => setTimeout(resolve, pageInfo.waitTime));
    
    // Log current URL for debugging
    const currentUrl = page.url();
    console.log(`   📍 Current URL: ${currentUrl}`);
    
    // Wait for main content to be visible
    try {
      await page.waitForSelector('main, .main-content, [role="main"], .dashboard, .content', { 
        timeout: 10000 
      });
    } catch (e) {
      console.log(`   ⚠️  Main content selector not found for ${pageInfo.name}, proceeding anyway`);
    }
    
    // Wait for any loading states to complete
    try {
      await page.waitForFunction(() => {
        const loadingElements = document.querySelectorAll('[data-loading="true"], .loading, .spinner');
        return loadingElements.length === 0;
      }, { timeout: 5000 });
    } catch (e) {
      console.log(`   ⚠️  Loading elements still present for ${pageInfo.name}`);
    }
    
    // Hide any loading spinners or overlays
    await page.evaluate(() => {
      const selectors = [
        '[data-loading]',
        '.loading',
        '.spinner',
        '.loading-overlay',
        '.skeleton'
      ];
      
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          el.style.display = 'none';
        });
      });
    });
    
    // Wait a bit more for any animations to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Take screenshot
    const screenshotPath = path.join(SCREENSHOT_DIR, `${pageInfo.name}.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
      type: 'png'
    });
    
    console.log(`   ✅ Screenshot saved: ${screenshotPath}`);
    return true;
    
  } catch (error) {
    console.error(`   ❌ Failed to capture ${pageInfo.description}:`, error.message);
    return false;
  }
}

async function loginAsAdmin(page) {
  try {
    console.log('🔐 Logging in as admin...');
    
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for login form
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
    await page.waitForSelector('input[type="password"], input[name="password"]', { timeout: 10000 });
    
    // Fill in credentials
    await page.type('input[type="email"], input[name="email"]', ADMIN_CREDENTIALS.email);
    await page.type('input[type="password"], input[name="password"]', ADMIN_CREDENTIALS.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
    
    console.log('   ✅ Successfully logged in');
    return true;
    
  } catch (error) {
    console.error('   ❌ Login failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting HCM Screenshot Capture');
  console.log('=====================================');
  
  let browser;
  let successCount = 0;
  let totalCount = PAGES.length;
  
  try {
    // Launch browser
    console.log('🌐 Launching browser...');
    browser = await puppeteer.launch({
      headless: false, // Set to true for headless mode
      defaultViewport: {
        width: 1920,
        height: 1080
      },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    let isLoggedIn = false;
    
    // Process each page
    for (const pageInfo of PAGES) {
      console.log(`\n📄 Processing: ${pageInfo.description}`);
      
      // Login if required and not already logged in
      if (pageInfo.requiresAuth && !isLoggedIn) {
        const loginSuccess = await loginAsAdmin(page);
        if (!loginSuccess) {
          console.log('❌ Cannot proceed with authenticated pages - login failed');
          break;
        }
        isLoggedIn = true;
      }
      
      // Take screenshot
      const success = await takeScreenshot(page, pageInfo);
      if (success) {
        successCount++;
      }
    }
    
  } catch (error) {
    console.error('💥 Script failed:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  console.log('\n=====================================');
  console.log('📊 SCREENSHOT CAPTURE COMPLETE');
  console.log(`✅ Successful: ${successCount}/${totalCount}`);
  console.log(`📁 Screenshots saved to: ${SCREENSHOT_DIR}`);
  console.log('=====================================');
}

// Run the script
main().catch(console.error);
