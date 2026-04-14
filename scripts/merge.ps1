Write-Host "Starting merge process from 'dev-teja' to 'test'..." -ForegroundColor Yellow

git checkout test
git merge origin dev-teja
git push origin test

Write-Host "Merge completed successfully from 'dev-teja' to 'test'" -ForegroundColor Green

Write-Host "Starting merge process from 'test' to 'main'..." -ForegroundColor Yellow

git checkout main
git merge origin test
git push origin main

Write-Host "Merge completed successfully from 'test' to 'main'" -ForegroundColor Green

Write-Host "Checking out 'dev-teja' branch..." -ForegroundColor Yellow
git checkout dev-teja

Write-Host "Merge process completed. You are now on the 'dev-teja' branch." -ForegroundColor Green

