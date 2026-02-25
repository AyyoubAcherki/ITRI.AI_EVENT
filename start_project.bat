@echo off
echo Starting AI ITRI TECKETING Project...

echo Starting Backend Server and Seeding Database...
start cmd /k "cd backend && php artisan db:seed --class=SeatSeeder && php artisan serve"

echo Starting Frontend Server...
start cmd /k "cd frontend && npm run dev"

echo All servers have been launched in separate windows!
