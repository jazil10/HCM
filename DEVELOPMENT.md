# Development Guide

## Quick Commands Summary

### 🚀 Start Everything
```bash
npm run dev          # Start both backend and frontend
```

### 📦 Install Dependencies  
```bash
npm run install:all  # Install for root, backend, and frontend
```

### 🗄️ Database Operations
```bash
npm run seed         # Seed database with sample data
npm run migrate      # Run database migrations
```

### 🔧 Individual Services
```bash
npm run dev:backend    # Backend only (http://localhost:3001)
npm run dev:frontend   # Frontend only (http://localhost:5173)
```

### 🏗️ Production Build
```bash
npm run build        # Build both for production
npm run start        # Run production builds
```

## Default URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Public Application Form**: http://localhost:5173/apply/{program-slug}

## Development Workflow

1. **Start Development**
   ```bash
   npm run dev
   ```

2. **Access Application**
   - Frontend: http://localhost:5173
   - Login with seeded admin account or create new user
   
3. **Create Internship Program**
   - Login as HR/Admin
   - Go to Dashboard → Internships → Create Program
   - Set program to "Active" status
   - Note the public URL slug

4. **Test Public Application**
   - Visit http://localhost:5173/apply/{your-program-slug}
   - Submit a test application

5. **Review Applications**
   - Go to Dashboard → Applications
   - View submitted applications and test the review features

## Common Issues & Solutions

### Port Already in Use
If ports 3001 or 5173 are in use:
```bash
# Kill processes on these ports (Windows)
netstat -ano | findstr :3001
netstat -ano | findstr :5173
taskkill /PID <process_id> /F
```

### Database Connection Issues
- Make sure MongoDB is running
- Check your `.env` file in the backend folder
- Verify `MONGODB_URI` is correct

### Build Issues
```bash
# Clean and reinstall
npm run clean
npm run install:all
```

## File Structure After Setup

```
HCM/
├── package.json              # Root workspace config
├── node_modules/            # Root dependencies (concurrently)
├── backend/
│   ├── package.json         # Backend dependencies
│   ├── src/                 # Source code
│   └── uploads/            # File uploads
├── frontend/
│   ├── package.json         # Frontend dependencies
│   ├── src/                 # React components
│   └── dist/               # Built assets (after build)
└── README.md               # This file
```
