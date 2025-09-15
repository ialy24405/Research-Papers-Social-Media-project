@echo off
echo Testing Papers Project Setup...
echo.

REM Test if containers are running
echo Checking running containers...
docker compose ps

echo.
echo Testing frontend (should return 200):
powershell -Command "try { $response = Invoke-WebRequest -Uri http://localhost:3000 -Method GET -UseBasicParsing; Write-Host 'Frontend Status:' $response.StatusCode } catch { Write-Host 'Frontend Error:' $_.Exception.Message }"

echo.
echo Testing API (should return 500 - expected for empty database):
powershell -Command "try { $response = Invoke-WebRequest -Uri http://localhost:3000/api/papers -Method GET -UseBasicParsing; Write-Host 'API Status:' $response.StatusCode } catch { Write-Host 'API Status:' $_.Exception.Response.StatusCode '(Expected 500)' }"

echo.
echo If you see Frontend Status: 200 and API Status: 500, everything is working!
echo.
echo Access your application at: http://localhost:3000
pause