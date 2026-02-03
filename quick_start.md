# Quick Start Guide - AI ITRI NTIC EVENT 2026

This guide will help you get the AI ITRI NTIC EVENT 2026 application running locally in under 10 minutes.

## Prerequisites Check
Before starting, ensure you have:
- ✅ PHP 8.1 or higher
- ✅ Node.js 16+ and npm
- ✅ MySQL 8.0 or MariaDB
- ✅ Composer (PHP package manager)
- ✅ Git

## 🚀 Quick Setup (5 Steps)

### Step 1: Clone the Repository
```bash
git clone https://github.com/amghar855/AI.ITRI.TECKETING.git
cd itri_event
```

### Step 2: Backend Setup (Laravel)
```bash
# Navigate to backend directory
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure your database in .env file
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=Db_name
# DB_USERNAME=Username
# DB_PASSWORD=your_password

# Create database
mysql -u root -p -e "CREATE DATABASE itri_event_2026;"

# Run migrations and seeders
php artisan migrate
php artisan db:seed

# Start Laravel server
php artisan serve
```


### Step 3: Frontend Setup (React)
```bash
# Open new terminal and navigate to frontend
cd frontend

# Install Node.js dependencies
npm install

# Start development server
npm run dev
```


### Step 4: Verify Installation
- ✅ Visit http://localhost:5173 - Should show event homepage
- ✅ Visit http://localhost:5173/admin/login - Should show admin login
- ✅ Visit http://localhost:8000/api/speakers - Should return JSON data

### Step 5: Admin Access
Default admin credentials:
- **Email**: admin@itri.ma
- **Password**: password123

## 🎯 Quick Test Checklist

### Public Features Test
1. **Homepage**: Visit http://localhost:5173
2. **Speakers Page**: Click "Speakers" in navigation
3. **Program Schedule**: Click "Program" in navigation  
4. **Make Reservation**: Click "Reserve Your Seat" and complete form

### Admin Features Test
1. **Login**: Go to http://localhost:5173/admin/login
2. **Dashboard**: Check statistics and charts
3. **Reservations**: View reservation list
4. **QR Scanner**: Test camera access (requires HTTPS in production)
5. **Scan Statistics**: View analytics dashboard

## 🔧 Configuration

### Database Configuration
Edit `backend/.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=itri_event_2026
DB_USERNAME=root
DB_PASSWORD=your_password
```

### Frontend API Configuration
The frontend is configured to use `http://localhost:8000` for API calls. No changes needed for local development.

## 🚨 Troubleshooting

### Common Issues & Solutions

#### "php artisan serve" fails
```bash
# Check PHP version
php --version
# Should be 8.1+

# Check if port 8000 is available
netstat -an | find "8000"
```

#### Database connection errors
```bash
# Test MySQL connection
mysql -u root -p

# Verify database exists
SHOW DATABASES;

# Check Laravel can connect
php artisan migrate:status
```

#### Frontend build errors
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version
# Should be 16+
```

#### QR Scanner not working
- **Chrome/Firefox**: Allow camera permissions
- **HTTPS Required**: Use ngrok or similar for HTTPS in development
- **Camera Access**: Ensure camera is not used by other applications

## 📱 Development Commands

### Backend Commands
```bash
# Run migrations
php artisan migrate

# Seed database with test data
php artisan db:seed

# Clear application cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Generate new admin user
php artisan tinker
> Admin::create(['email' => 'test@admin.com', 'password' => Hash::make('password'), 'name' => 'Test Admin']);

# View routes
php artisan route:list

# Check logs
tail -f storage/logs/laravel.log
```

### Frontend Commands
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🌐 API Testing

### Test API endpoints with curl:
```bash
# Get speakers
curl http://localhost:8000/api/speakers

# Admin login
curl -X POST http://localhost:8000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@itri.ma","password":"password123"}'

# Get reservations (with token)
curl http://localhost:8000/api/reservations \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📊 Default Data

The application comes with sample data:
- **3 Speakers**: Pre-configured with bios and images
- **6 Programs**: Sample sessions across 3 days
- **1 Admin User**: admin@itri.ma / password123
- **120 Seats**: 40 seats per day (configurable)

## 🔄 Development Workflow

1. **Make Changes**: Edit files in `backend/` or `frontend/`
2. **Test Locally**: Both servers auto-reload on changes
3. **Database Changes**: Create migrations for schema changes
4. **API Changes**: Update routes in `backend/routes/api.php`
5. **Frontend Changes**: Components auto-reload with Vite

## 📞 Need Help?

If you encounter issues:
1. Check the `documentation.md` for detailed information
2. Review the `required.md` for system requirements
3. Check Laravel logs: `backend/storage/logs/laravel.log`
4. Check browser console for frontend errors
5. Verify database connection and data

## 🎉 Success!

You should now have:
- ✅ Backend API running on port 8000
- ✅ Frontend app running on port 5173
- ✅ Database with sample data
- ✅ Admin access to management features
- ✅ QR code system functional

**Next Steps**: Explore the admin dashboard, create test reservations, and try the QR scanner!