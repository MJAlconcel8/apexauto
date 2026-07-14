# ApexAuto Gemini Chatbot

## Overview

The chatbot uses a small frontend-to-backend flow:

```text
React chatbot page
    -> POST /api/chatbot/messages
Spring Boot chatbot service
    -> ApexAuto knowledge file
Gemini API
    -> response shown in React
```

The Gemini key stays in the backend. Never place it in React or commit it to Git.

## Chatbot files

Backend:

```text
apexauto/src/main/java/com/example/apexauto/chatbot/
apexauto/src/main/resources/chatbot/apexauto-site-knowledge.txt
```

Frontend:

```text
frontend/src/pages/ChatbotPage.tsx
frontend/src/pages/ChatbotPage.css
frontend/src/services/chatbotApi.ts
```

Integration points:

```text
apexauto/src/main/java/com/example/apexauto/configs/SecurityConfiguration.java
apexauto/src/main/resources/application.properties
frontend/src/App.tsx
frontend/src/components/Nav.tsx
frontend/src/pages/ApexAutoLanding.tsx
```

## Requirements

- Java 21
- Node.js and npm
- MySQL 8+
- A Gemini API key from Google AI Studio

## 1. Configure MySQL

```powershell
mysql -u root -p
```

```sql
CREATE DATABASE apexauto_test;
CREATE USER 'apexauto_user'@'localhost' IDENTIFIED BY 'apexauto_password';
GRANT ALL PRIVILEGES ON apexauto_test.* TO 'apexauto_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

If the user already exists:

```sql
ALTER USER 'apexauto_user'@'localhost' IDENTIFIED BY 'apexauto_password';
GRANT ALL PRIVILEGES ON apexauto_test.* TO 'apexauto_user'@'localhost';
FLUSH PRIVILEGES;
```

## 2. Configure the backend

Run these commands from the `apexauto` folder:

```powershell
Copy-Item env.example .env
notepad .env
```

Fill in the values:

```text
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/apexauto_test?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=apexauto_user
SPRING_DATASOURCE_PASSWORD=apexauto_password

JWT_SECRET_KEY=YOUR_BASE64_SECRET
JWT_EXPIRATION_TIME=3600000

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=YOUR_EMAIL
MAIL_PASSWORD=YOUR_MAIL_APP_PASSWORD

GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-3.1-flash-lite
CHATBOT_MAX_OUTPUT_TOKENS=300
```

Generate the JWT secret:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

The mail settings belong to the existing account features, not the chatbot, but the main application expects them during startup.

## 3. Test and run the backend

```powershell
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```

A successful start includes:

```text
Started ApexautoApplication
```

Check the backend from another PowerShell window:

```powershell
Invoke-RestMethod http://localhost:8080/health
```

Test the chatbot endpoint:

```powershell
$body = @{
  message = "What can I do on the ApexAuto website?"
  history = @()
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:8080/api/chatbot/messages" `
  -ContentType "application/json" `
  -Body $body
```

Expected response shape:

```json
{
  "message": "..."
}
```

## 4. Test and run the frontend

Open another PowerShell window in the `frontend` folder:

```powershell
npm ci
npm run lint
npm run build
npm run dev
```

Open the Vite address, normally:

```text
http://localhost:5173
```

The chatbot page is:

```text
http://localhost:5173/chatbot
```

For a different backend address, copy `frontend/.env.example` to `frontend/.env` and change `VITE_API_BASE_URL`.

## 5. Browser checks

1. Open the landing page.
2. Click **Chat with Amp** and confirm `/chatbot` opens.
3. Click a suggested question and confirm it sends once.
4. Ask `What can I do on the ApexAuto website?`.
5. Ask `Can you see my cart or payment information?`.
6. Confirm Amp does not claim access to accounts, carts, payments, or database records.
7. Clear the conversation and send another message.

## Expected errors

- Blank or overlong message: HTTP `400`
- Missing Gemini key: HTTP `503`
- Invalid key or model: HTTP `502`
- Gemini quota reached: HTTP `503`

Restart Spring Boot after changing `.env`.

## Update project knowledge

Edit:

```text
apexauto/src/main/resources/chatbot/apexauto-site-knowledge.txt
```

Keep the file short and factual. Only describe features that exist in the code, then restart the backend.

Never add passwords, API keys, tokens, customer information, payment information, or database credentials.

## Scope

This school-project integration intentionally avoids streaming, vector databases, tool calls, account access, database access, and automatic actions. It sends a short project knowledge file with each request so the code remains easy to explain and maintain.
