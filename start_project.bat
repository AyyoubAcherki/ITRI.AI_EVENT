@echo off
color 0B
echo ===================================================
echo     Starting AI ITRI TECKETING Project...
echo ===================================================
echo.

echo [1/3] Preparing Backend Environment...
cd backend

IF NOT EXIST "database\database.sqlite" (
    echo Creating database.sqlite...
    type nul > "database\database.sqlite"
)

echo Clearing config/cache...
call php artisan config:clear
call php artisan cache:clear

echo Running database migrations...
call php artisan migrate --force

echo Starting Laravel Server...
start "AI ITRI Backend" cmd /k "php artisan serve"

echo Starting Queue Worker...
start "AI ITRI Queue Worker" cmd /k "php artisan queue:work"

cd ..
echo.

echo [2/3] Installing Frontend Dependencies (if any)...
cd frontend
call npm install

echo.
echo [3/3] Starting Frontend Development Server...
start "AI ITRI Frontend" cmd /k "npm run dev"

cd ..

echo.
echo ===================================================
echo   All servers have been launched in separate windows!
echo   - Backend: http://localhost:8000
echo   - Frontend: http://localhost:3000
echo ===================================================
pause
