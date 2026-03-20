# AI ITRI NTIC EVENT 2026

A full-stack web application for the AI ITRI NTIC EVENT 2026 in Tanger, Morocco. This platform provides an end-to-end ticketing, seating, and administration solution.

## Tech Stack

- **Backend**: Laravel 10 (PHP)
- **Frontend**: React 18 with Vite
- **Database**: MySQL
- **Styling**: Tailwind CSS
- **Authentication**: Laravel Sanctum

## Features

### User (Attendee) Interface
- Home page with comprehensive event information.
- Speakers catalog dynamically loaded from the database.
- Program/Schedule overview grouped by event days.
- Seat reservation system with interactive seating visualization map.
- Automated email confirmations with generated PDF tickets and QR codes.

### Admin Dashboard (Control Center)
- Secure Admin login with Sanctum authentication.
- Advanced statistics dashboard with charts (Occupancy, Role distribution, Reservations).
- Comprehensive reservation management with search and filters.
- Speaker and Program/Session management (CRUD operations).
- **Scanner d'Entrée (Access Control)**: 
  - Real-time QR Code scanning for ticket validation.
  - **Hardware Support**: Integrated support for physical barcode/QR hardware scanners (e.g., Andowl Q-SM55B) with high-speed automated validation.
- **Email Monitoring**: Dashboard module to track email delivery statuses (Live, Failed, Pending) and retry failed sends.
- Data export to CSV.

## Email Confirmation System

The application features a robust, automated email confirmation system that triggers immediately after a successful seat reservation.

### Features of the Email System

1. **Automated Dispatch**: Once a user reserves a seat, the system automatically dispatches an HTML email containing their booking details.
2. **PDF Ticket Generation**: The email includes a dynamically generated PDF ticket as an attachment (`ticket.pdf`).
3. **QR Code Integration**: Inside the PDF ticket, a unique cryptographic QR code is embedded. This QR code is used by the front-desk Admin QR Scanner (Webcam or USB Scanner) for rapid attendee check-in at the event.
4. **Monitoring & Retries**: Administrators can view the real-time status of all sent emails (Pending, Delivered, Failed) in the **Admin Dashboard > Emails** section. If an email fails to send due to a network or SMTP error, the admin can click "Retry" to attempt sending it again directly from the dashboard.

### SMTP Configuration Details

To enable the email system, you must configure your Mail endpoint in the `backend/.env` file. We recommend using a transactional email service like **Brevo**, **Mailgun**, or **Mailtrap** (for local testing).

Example `.env` configuration for SMTP:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=your_smtp_login
MAIL_PASSWORD=your_smtp_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="contact@itri.ma"
MAIL_FROM_NAME="AI ITRI EVENT 2026"
```

Once configured, the `ReservationController` and automated Jobs will handle the ticket generation and email dispatch gracefully.

## Automation Setup (Windows)

To simplify the development workflow, several batch scripts are included:
- `run.bat`: Automatically starts the Laravel backend and the frontend Vite server simultaneously.
- `push.bat`: Streamlined Git workflow automation for staging, committing, and pushing code to the remote repository.

## Manual Setup Instructions

### Prerequisites
- PHP 8.1+
- Composer
- Node.js 18+
- MySQL

### Backend Setup

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install PHP dependencies:
```bash
composer install
```

3. Copy environment file and configure it:
```bash
cp .env.example .env
```
Update your `.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=itri_event
DB_USERNAME=root
DB_PASSWORD=your_password
```

4. Generate application key, migrate, and seed:
```bash
php artisan key:generate
php artisan migrate
php artisan db:seed
```

5. Create storage link and start the server:
```bash
php artisan storage:link
php artisan serve
```
The backend will run at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```
The frontend will run at `http://localhost:3000`

## Default Admin Credentials

- **Email**: admin@itri.ma
- **Password**: password123

## API Endpoints Overview

### Public Routes
- `GET /api/speakers` - Retrieve speakers
- `GET /api/programs` - Retrieve schedule
- `GET /api/seats?day={day}` - Seat availability
- `POST /api/reservations` - Create reservation
- `GET /api/tickets/{code}/download` - Download PDF

### Protected Routes (Admin)
- `POST /api/admin/login` / `logout` - Authentication
- `GET /api/statistics` - Analytics
- `GET /api/admin/emails` - Email monitoring
- `POST /api/reservations/validate-qr` - Scanner validation
- Full CRUD operations for underlying data models.

## Color Palette

- Primary: `#006AD7`
- Secondary: `#9AD9EA`
- Dark: `#21277B`
- Light: `#FFFFFF`
- Muted: `#5F83B1`

## License

MIT License
