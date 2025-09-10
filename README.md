# HCM System - Human Capital Management

A comprehensive Human Resources Management System with advanced Internship Management features built with React, TypeScript, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js (>=16.0.0)
- npm (>=8.0.0)  
- MongoDB (local or cloud instance)

### One-Command Setup
```bash
# Clone and install everything
git clone https://github.com/jazil10/HCM.git
cd HCM
npm run install:all

# Start both backend and frontend
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend development server on http://localhost:5173

### Environment Setup
Create `backend/.env` with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/hcm_system
JWT_SECRET=your-super-secret-jwt-key
PORT=3001
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 📋 Available Commands

### Main Commands
- `npm run dev` - Start both backend and frontend in development
- `npm run start` - Start both in production mode  
- `npm run build` - Build both for production
- `npm run seed` - Seed database with sample data
- `npm run migrate` - Run database migrations

### Individual Commands  
- `npm run dev:backend` - Start only backend
- `npm run dev:frontend` - Start only frontend
- `npm run install:all` - Install all dependencies

## ✨ Features

### Core HR Features
- **Employee Management** - Add, edit, and manage employee records
- **Team Management** - Organize employees into teams with managers  
- **Attendance Tracking** - Monitor employee attendance and work hours
- **Leave Management** - Handle leave requests, approvals, and balance tracking
- **Dashboard & Analytics** - Comprehensive insights into HR metrics

### 🎓 Internship Management System
- **Program Creation** - HR/Admin can create detailed internship programs
- **Public Application Forms** - Students can apply through public URLs
- **Application Review** - Comprehensive dashboard to review applications
- **Status Tracking** - Track applications through various stages
- **Communication** - Email notifications and internal notes
- **File Management** - Resume uploads and document handling

## 🛠 Tech Stack

**Backend:** Node.js, Express, TypeScript, MongoDB, JWT, Multer, Nodemailer  
**Frontend:** React 18, TypeScript, Vite, React Router, Tailwind CSS, Headless UI
- Modern UI with React and Tailwind CSS

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE) 