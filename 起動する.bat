@echo off
chcp 65001 > nul
echo ========================================================
echo   CORE CONNECT Academy - ローカルサーバー起動中...
echo ========================================================
echo.
echo ブラウザでローカルサーバー (http://localhost:8080) を起動します。
echo 実機Webカメラ・AI FaceMesh・HRV解析が100%%完全に動作します。
echo.
echo 終了する場合は、この黒いウィンドウを閉じてください。
echo --------------------------------------------------------

start http://localhost:8080/index.html
python -m http.server 8080
