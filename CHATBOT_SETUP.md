# Gemini Chatbot Setup

Amp sends chat messages from the React frontend to the Spring Boot backend. The backend adds the ApexAuto project notes and calls Gemini. The Gemini API key is only used by the backend.

## Files used by the chatbot

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

The route and navigation link are added in:

```text
frontend/src/App.tsx
frontend/src/components/Nav.tsx
frontend/src/pages/ApexAutoLanding.tsx
```

## Before starting

Make sure the existing ApexAuto backend and frontend can run normally. The database, JWT, and email settings are unchanged; use the main `README.md` for those values.

You also need a Gemini API key from Google AI Studio.

## Backend configuration

From the `apexauto` folder, copy the example environment file if you do not already have a local `.env`:

```powershell
Copy-Item env.example .env
```

Add the chatbot values to `.env`:

```text
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-3.1-flash-lite
CHATBOT_MAX_OUTPUT_TOKENS=300
```

Do not add the real API key to `env.example`, the frontend environment file, or Git.

Run the backend tests and start the application:

```powershell
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```

The chatbot endpoint is:

```text
POST http://localhost:8080/api/chatbot/messages
```

Example request from PowerShell:

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

A successful request returns:

```json
{
  "message": "..."
}
```

## Frontend configuration

The frontend uses `http://localhost:8080` by default. From the `frontend` folder, copy the example file if you need to use another backend address:

```powershell
Copy-Item .env.example .env
```

Then update:

```text
VITE_API_BASE_URL=http://localhost:8080
```

Install the frontend dependencies and run the checks:

```powershell
npm ci
npm run lint
npm run build
npm run dev
```

Open the Vite address shown in the terminal, then go to `/chatbot` or use the **Chat with Amp** link.

## Manual checks

1. Open the chatbot from the landing page and navigation menu.
2. Send a suggested question and confirm that only one message is submitted.
3. Ask a follow-up question to confirm that recent chat history is included.
4. Clear the conversation and send a new message.
5. Ask whether Amp can see a cart, payment, password, or account details. It should explain that it has no access to private or live data.
6. Stop the backend and confirm that the frontend shows an error instead of failing silently.

## Common errors

| Result | Likely cause |
|---|---|
| HTTP `400` | The message is blank or longer than 1,000 characters. |
| HTTP `503` | The Gemini key is missing or the API quota has been reached. |
| HTTP `502` | Gemini rejected the key/model, could not be reached, or returned an invalid response. |

Restart Spring Boot after changing `.env`.

## Deployment note

`/api/chatbot/messages` currently allows requests without signing in. This is convenient for the project demo, but a public deployment should add login protection or a simple request limit so the Gemini quota cannot be used freely.

## Updating ApexAuto information

Amp reads its project information from:

```text
apexauto/src/main/resources/chatbot/apexauto-site-knowledge.txt
```

Update this file when a route or feature changes. Keep it limited to information that is already implemented, and restart the backend after editing it. Do not put secrets, credentials, payment data, or user information in this file.
