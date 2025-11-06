@echo off
echo ============================================
echo CosmoStream EC2 Deployment from Windows
echo ============================================
echo.

REM Fix SSH key permissions
echo Fixing SSH key permissions...
icacls "C:\Users\hp\.ssh\cosmostream-key.pem" /inheritance:r
icacls "C:\Users\hp\.ssh\cosmostream-key.pem" /grant:r "hp:(R)"
echo.

echo Copying deployment script to EC2...
scp -i "C:\Users\hp\.ssh\cosmostream-key.pem" "C:\Users\hp\Desktop\CosmoStream\deploy-to-ec2.sh" ubuntu@13.49.245.29:/home/ubuntu/
echo.

echo Connecting to EC2 and running deployment...
ssh -i "C:\Users\hp\.ssh\cosmostream-key.pem" ubuntu@13.49.245.29 "chmod +x /home/ubuntu/deploy-to-ec2.sh && bash /home/ubuntu/deploy-to-ec2.sh"

echo.
echo ============================================
echo Deployment Complete!
echo Your API: http://13.49.245.29:4000/graphql
echo ============================================
pause
