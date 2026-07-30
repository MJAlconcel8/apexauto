# Amp Chatbot Setup

Amp is the customer-facing chatbot in ApexAuto. The React frontend sends a question and recent chat history to the Spring Boot backend. The backend adds the ApexAuto customer guide, calls Google Gemini, and returns the answer to the browser. The Gemini API key is never sent to the frontend.

## Implementation files

Backend:

```text
apexauto/src/main/java/com/example/apexauto/chatbot/
apexauto/src/main/resources/chatbot/apexauto-site-knowledge.txt
```

Frontend:

```text
frontend/src/pages/ChatbotPage.tsx
frontend/src/services/chatbotApi.ts
```

Routing and entry points:

```text
frontend/src/App.tsx
frontend/src/components/Nav.tsx
frontend/src/pages/ApexAutoLanding.tsx
```

## How the request flows

1. The user enters a question in the Amp interface.
2. `ChatbotPage.tsx` sends the question and up to six recent messages to `POST /api/chatbot/messages`.
3. `ChatbotService` validates the message and cleans the history.
4. `SiteKnowledgeService` loads `apexauto-site-knowledge.txt` from the application classpath.
5. `GeminiChatClient` combines the conversation, project guide, and chatbot instructions, then calls Gemini over HTTPS.
6. The backend returns a `ChatbotResponseDTO`, and the frontend displays the answer.

The endpoint returns `Cache-Control: no-store`. Amp can explain customer features, visible buttons, the project architecture, and general EV topics. It cannot access accounts, carts, orders, payments, or live database records.

## Requirements

Before testing Amp, complete the backend and frontend setup in the main `README.md`. You also need a Gemini API key from Google AI Studio.

## Backend configuration

From the `apexauto` directory, create a local environment file if one does not already exist.

### PowerShell

```powershell
Copy-Item env.example .env
```

### macOS or Linux

```bash
cp env.example .env
```

Add the chatbot settings to `.env`:

```text
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-3.1-flash-lite
CHATBOT_MAX_OUTPUT_TOKENS=300
```

`GEMINI_API_KEY` is required to receive answers. The model and output-token settings are optional. Output tokens are limited to a value between 50 and 500 by the backend.

Do not place the real API key in `env.example`, a frontend environment file, or Git.

Run the backend tests and start Spring Boot:

### PowerShell

```powershell
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```

### macOS or Linux

```bash
./mvnw test
./mvnw spring-boot:run
```

The local endpoint is:

```text
POST http://localhost:8080/api/chatbot/messages
```

Example PowerShell request:

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

A successful response has this form:

```json
{
  "message": "..."
}
```

## Frontend configuration

The frontend uses `http://localhost:8080` during local development. To set the backend address explicitly, create `frontend/.env.local`.

### PowerShell

```powershell
cd frontend
Copy-Item .env.example .env.local
```

### macOS or Linux

```bash
cd frontend
cp .env.example .env.local
```

Set:

```text
VITE_API_BASE_URL=http://localhost:8080
```

Install dependencies, run the checks, and start Vite:

```bash
npm ci
npm run lint
npm run build
npm run dev
```

Open the Vite address shown in the terminal. Amp is available from the **Chat with Amp** button on the landing page, the Amp icon in the main navigation, or the `/chatbot` route.

## Request limits and error handling

- User messages are limited to 1,000 characters.
- The frontend and backend keep up to six recent history messages.
- Individual history entries are trimmed to 2,000 characters by the backend.
- Gemini uses a 10-second connection timeout and a 30-second read timeout.
- The default output limit is 300 tokens.

| Result | Meaning |
|---|---|
| HTTP `400` | The message is missing or longer than 1,000 characters. |
| HTTP `503` | The Gemini key is missing or the API quota has been reached. |
| HTTP `502` | Gemini rejected the request, could not be reached, timed out, or returned an invalid response. |

Restart Spring Boot after changing backend environment variables or the knowledge file.

## Manual checks

1. Open Amp from the landing page or main navigation.
2. Send one of the suggested questions and confirm that only one request is submitted.
3. Ask a follow-up question and confirm that the earlier conversation is understood.
4. Select **Clear** and confirm that the conversation resets.
5. Ask how to save a vehicle and confirm that Amp refers to the heart button and **Favorites**.
6. Ask how **Compare**, **Loan Calc**, **Finance**, and **Add to Cart** work.
7. Ask whether checkout is real and confirm that Amp identifies payments, financing, orders, stock, and delivery as simulations.
8. Ask about the project stack and confirm that Amp explains React, TypeScript, Vite, Spring Boot, MySQL, Vercel, Railway, and Gemini.
9. Ask Amp to view an account or change a cart. It should explain that it cannot access private or live data.
10. Stop the backend and confirm that the frontend displays an error instead of failing silently.

## Railway deployment

Add these variables to the Railway backend service:

```text
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-3.1-flash-lite
CHATBOT_MAX_OUTPUT_TOKENS=300
```

The endpoint is currently public so guests can use Amp during the project demo. A production system should add rate limiting or require authentication to protect the Gemini quota.

## Updating the ApexAuto guide

Amp reads project information from:

```text
apexauto/src/main/resources/chatbot/apexauto-site-knowledge.txt
```

Update this file when a customer-facing feature, visible label, or technology changes. Use the labels shown in the interface, such as **Catalogue**, **Favorites**, **Compare**, **Loan Calc**, **Finance**, **Add to Cart**, and **Place Order**. Keep administrator instructions, credentials, private user information, and payment data out of the guide.
