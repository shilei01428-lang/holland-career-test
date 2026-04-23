@echo off
chcp 65001 > nul
echo ==========================================
echo  霍兰德测评 - 本地服务器启动器
echo ==========================================
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
    set ip=%%a
    goto :found
)

:found
set ip=%ip: =%

echo 正在启动服务器...
start /min cmd /c "node server.js"
timeout /t 2 > nul

echo.
echo ✅ 服务器已启动！
echo.
echo ==========================================
echo  请确保手机和电脑连接同一个 WiFi
echo ==========================================
echo.
echo 📱 手机浏览器输入：
echo    http://%ip%:8080/index.html
echo.
echo 💻 电脑浏览器输入：
echo    http://localhost:8080/index.html
echo.
echo ⚠️ 按 Ctrl+C 关闭服务器
echo.
pause
