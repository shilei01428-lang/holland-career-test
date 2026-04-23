@echo off
chcp 65001 > nul
echo ==========================================
echo  霍兰德测评网站 - GitHub Pages 部署脚本
echo ==========================================
echo.
echo 请确保你已经：
echo 1. 在 github.com 注册了账号
echo 2. 创建了名为 holland-career-test 的公开仓库
echo.
set /p username=请输入你的 GitHub 用户名：

git remote remove origin 2> nul
git remote add origin https://github.com/%username%/holland-career-test.git
git branch -M main
git push -u origin main

if %errorlevel% == 0 (
    echo.
    echo ✅ 代码推送成功！
    echo.
    echo 接下来请手动操作：
    echo 1. 打开 https://github.com/%username%/holland-career-test/settings/pages
echo 2. Source 选择 Deploy from a branch
echo 3. Branch 选择 main / (root)
echo 4. 点击 Save
echo.
    echo 1-2 分钟后访问：
    echo https://%username%.github.io/holland-career-test/
) else (
    echo ❌ 推送失败，请检查用户名和仓库名是否正确
)

pause
