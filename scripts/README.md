# HCM Scripts

This folder contains utility scripts for the HCM project. Each script serves a specific purpose to help with development, testing, and documentation.

## 📸 Screenshot Automation

### `capture-screenshots.js`

**Purpose:** Automated screenshot capture for documentation

**What it does:**
- Automatically logs into the HCM system using admin credentials
- Navigates through all major pages of the application
- Captures high-quality screenshots (1920x1080 resolution)
- Saves screenshots to the `screenshots/` folder
- Updates documentation with visual examples

**Pages Captured:**
1. Login Page (`/login`)
2. Dashboard Overview (`/dashboard`)
3. Employee Management (`/dashboard/employees`)
4. Team Management (`/dashboard/teams`)
5. Attendance Tracking (`/dashboard/attendance`)
6. Leave Management (`/dashboard/leaves`)
7. Internship Programs (`/dashboard/internships`)
8. Public Application Form (`/apply/best-internship-ever-1757552368144`)

**Prerequisites:**
- Frontend server running on `http://localhost:5173`
- Backend server running on `http://localhost:3000`
- Admin account exists: `admin@example.com` / `hashed`
- Puppeteer installed: `npm install --save-dev puppeteer`

**Usage:**
```bash
# From project root
node scripts/capture-screenshots.js
```

**Features:**
- ✅ Automatic authentication handling
- ✅ Smart page loading detection
- ✅ Loading spinner removal
- ✅ Full-page screenshots
- ✅ Error handling and reporting
- ✅ Progress tracking

## 🔧 Development Scripts

### Backend Scripts (in `backend/src/scripts/`)

These scripts are located in the backend and handle database operations:

- **`updateInternshipPrograms.ts`** - Updates internship program data

### Frontend Scripts

Configuration and build scripts are handled by Vite and are in the `frontend/` directory.

## 📋 Usage Guidelines

### Running Screenshot Script

1. **Start Development Servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend  
   cd frontend
   npm run dev
   ```

2. **Run Screenshot Automation:**
   ```bash
   # From project root
   node scripts/capture-screenshots.js
   ```

3. **Expected Output:**
   ```
   🚀 Starting HCM Screenshot Capture
   =====================================
   🌐 Launching browser...
   📄 Processing: Login Page
   📸 Capturing Login Page...
   ✅ Screenshot saved: screenshots/login.png
   ...
   📊 SCREENSHOT CAPTURE COMPLETE
   ✅ Successful: 8/8
   ```

### Troubleshooting

**Common Issues:**

1. **"Cannot connect" errors:**
   - Ensure both frontend and backend servers are running
   - Check if ports 3000 and 5173 are available

2. **"Login failed" errors:**
   - Verify admin account exists in database
   - Run `npm run seed` in backend to create sample data

3. **Screenshot quality issues:**
   - Script uses 1920x1080 resolution by default
   - Modify viewport settings in script if needed

4. **Timeout errors:**
   - Increase timeout values in script
   - Check for slow network or database responses

## 🛠 Customization

### Modifying Screenshot Script

**Change Resolution:**
```javascript
defaultViewport: {
  width: 1366,  // Change width
  height: 768   // Change height
}
```

**Add New Pages:**
```javascript
{
  name: 'new-page',
  description: 'New Page Description',
  requiresAuth: true,
  waitTime: 3000,
  navigate: async (page) => {
    await page.goto(`${BASE_URL}/new-route`, { waitUntil: 'networkidle0', timeout: 30000 });
  }
}
```

**Change Credentials:**
```javascript
const ADMIN_CREDENTIALS = {
  email: 'your-admin@example.com',
  password: 'your-password'
};
```

## 📝 Adding New Scripts

When adding new utility scripts to this folder:

1. **Create the script file** with descriptive name
2. **Add comprehensive documentation** at the top
3. **Update this README** with script description
4. **Include usage examples** and prerequisites
5. **Add error handling** and logging
6. **Test thoroughly** before committing

## 🤝 Contributing

When modifying scripts:
- Follow existing code style
- Add proper error handling
- Include console logging for debugging
- Test with different scenarios
- Update documentation accordingly
