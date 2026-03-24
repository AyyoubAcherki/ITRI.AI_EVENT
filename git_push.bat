@echo off
chcp 65001 >nul
echo ---------------------------------------------------
echo 🚀 Enregistrement des modifications sur GitHub...
echo ---------------------------------------------------
echo.

:: 4) تحضّر الملفات
echo [1/3] Preparation des fichiers (git add .)
git add .
echo.

:: 5) تسجّل الخدمة
set /p commit_msg="9oli chno 3mlti (wla khalliha khawya bach ydir 'Mise a jour'): "
if "%commit_msg%"=="" set commit_msg=Mise a jour
echo [2/3] Enregistrement (git commit -m "%commit_msg%")
git commit -m "%commit_msg%"
echo.

:: 6) تصيفط الخدمة
echo [3/3] Envoi vers GitHub (https://github.com/AyyoubAcherki/ITRI.AI_EVENT.git)
git remote set-url origin https://github.com/AyyoubAcherki/ITRI.AI_EVENT.git
git push origin main
echo.

echo ---------------------------------------------------
echo ✅ Termine ! Verifiez s'il y a des erreurs ci-dessus.
echo ---------------------------------------------------
pause
