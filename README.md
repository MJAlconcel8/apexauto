# ApexAuto

ApexAuto is a full-stack educational vehicle marketplace. It provides public vehicle browsing and a simulated customer purchase flow, including account registration, favorites, comparison, financing estimates, cart management, checkout, orders, reviews with 1–5 star ratings, and the Amp chatbot.

> **Simulation notice:** ApexAuto is a project demonstration. Vehicle inventory, financing, checkout, payment fields, orders, delivery estimates, and payment records are simulated. Do not enter real payment-card information.

## Current Features

### Public features

- Landing page and guest vehicle catalogue
- Vehicle search, category filters, price filters, and sorting
- Vehicle details, reviews, star-rating averages, and vehicle-history notes
- Account registration, email verification, login, logout, and password reset
- Amp chatbot powered by Google Gemini

### Registered customer features

- Save and remove favorite vehicles
- View a dedicated Favorites page
- Compare two or three vehicles
- Estimate financing with adjustable down payment, term, and annual rate
- Add cash or financed vehicle lines to a cart
- Complete simulated checkout and view orders
- Create, edit, and delete reviews with 1–5 star ratings
- Update account details and password

### Administrator features

- Dashboard and payment summary
- Vehicle inventory creation, editing, and deletion
- Vehicle-history management
- User role and restriction management
- Order and order-status management
- Review moderation

## Technology Stack

### Frontend

- React 19
- TypeScript 6
- Vite 8
- React Router 7
- Tailwind CSS 4
- Lucide React icons

### Backend

- Java 21
- Spring Boot 4.1
- Spring MVC
- Spring Security
- Spring Data JPA and Hibernate
- MySQL
- JWT authentication
- Spring Mail
- Google Gemini REST API integration

### Deployment

- Frontend: Vercel
- Backend: Railway Docker service
- Database: Railway-managed MySQL
- Source collaboration: shared team GitHub repository
- Deployment: personal GitHub fork and `deploy/vercel-railway` branch
- Live frontend: `https://apexauto-beta.vercel.app`

## Repository Structure

```text
apexauto/
├── apexauto/                 Spring Boot backend
│   ├── src/main/java/
│   ├── src/main/resources/
│   ├── src/test/java/
│   ├── Dockerfile
│   ├── env.example
│   ├── mvnw
│   ├── mvnw.cmd
│   └── pom.xml
├── frontend/                 React frontend
│   ├── src/
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── vercel.json
├── projectdocs/
├── CHATBOT_SETUP.md
├── railway.json
└── README.md
```

# ApexAuto Backend Local Development

The Spring Boot backend is located in the `apexauto/` directory.

## Prerequisites

- Java 21
- MySQL 8+
- Maven is optional because the Maven wrapper is included
- A valid SMTP account for registration verification and password-reset emails
- A Gemini API key only when testing Amp

## 1) Create a local `.env`

Place the backend `.env` next to `pom.xml`.

### PowerShell

```powershell
cd apexauto
Copy-Item env.example .env
```

### macOS or Linux

```bash
cd apexauto
cp env.example .env
```

Update `.env` for your local database and services.

### Backend environment variables

| Variable | Required | Purpose |
|---|---:|---|
| `SPRING_DATASOURCE_URL` | Yes | JDBC connection string for MySQL |
| `SPRING_DATASOURCE_USERNAME` | Yes | MySQL username |
| `SPRING_DATASOURCE_PASSWORD` | Yes | MySQL password |
| `JPA_DDL_AUTO` | No | Hibernate schema behaviour; defaults to `update` |
| `JPA_SHOW_SQL` | No | Enables SQL logging; defaults to `false` |
| `JPA_FORMAT_SQL` | No | Formats SQL logs; defaults to `false` |
| `CORS_ALLOWED_ORIGINS` | No | Comma-separated frontend origin patterns |
| `AUTH_COOKIE_SECURE` | No | `auto`, `true`, or `false` |
| `AUTH_COOKIE_SAME_SITE` | No | `auto`, `Lax`, `Strict`, or `None` |
| `JWT_SECRET_KEY` | Yes | Base64-encoded key used to sign JWTs |
| `JWT_EXPIRATION_TIME` | No | JWT lifetime in milliseconds; defaults to 30 days |
| `MAIL_HOST` | Yes | SMTP server |
| `MAIL_PORT` | No | SMTP port; defaults to `587` |
| `MAIL_USERNAME` | Yes | SMTP username |
| `MAIL_PASSWORD` | Yes | SMTP password or app password |
| `GEMINI_API_KEY` | For Amp | Server-side Gemini API key |
| `GEMINI_MODEL` | No | Defaults to `gemini-3.1-flash-lite` |
| `CHATBOT_MAX_OUTPUT_TOKENS` | No | Defaults to `300` |

Generate a JWT secret:

```bash
openssl rand -base64 32
```

Or with Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

> Never commit `.env`, database credentials, mail credentials, JWT secrets, or Gemini keys.

### Local cookie settings

For a local frontend on `http://localhost:5173` and backend on `http://localhost:8080`, use:

```text
CORS_ALLOWED_ORIGINS=http://localhost:*
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=Lax
```

For Vercel and Railway over HTTPS, production normally uses secure cookies and `SameSite=None`.

## 2) Create a local MySQL database

The backend uses `spring.jpa.hibernate.ddl-auto=update` by default. Hibernate creates or updates tables after the database itself exists.

Start MySQL:

```bash
mysql -u root -p
```

Then run:

```sql
CREATE DATABASE apexauto_test;
CREATE USER 'apexauto_user'@'localhost' IDENTIFIED BY 'apexauto_password';
GRANT ALL PRIVILEGES ON apexauto_test.* TO 'apexauto_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Use the same values in `.env`:

```text
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/apexauto_test?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=apexauto_user
SPRING_DATASOURCE_PASSWORD=apexauto_password
```

## 3) Optional sample data

Sample cart statuses, order statuses, and vehicles can be seeded when the backend starts.

### PowerShell

```powershell
$env:APP_SEED_ENABLED = "true"
.\mvnw.cmd spring-boot:run
```

### macOS or Linux

```bash
export APP_SEED_ENABLED=true
./mvnw spring-boot:run
```

Seeding is disabled by default and only inserts missing sample vehicles. It does not create a default administrator account.

## 4) Run backend tests

### PowerShell

```powershell
.\mvnw.cmd test
```

### macOS or Linux

```bash
chmod +x mvnw
./mvnw test
```

Backend tests are stored under:

```text
apexauto/src/test/java/com/example/apexauto/
```

Current test areas include authentication, roles, favorites, reviews, financing, carts, orders, payments, chatbot validation, Gemini error handling, and knowledge-file loading.

## 5) Run the backend

### PowerShell

```powershell
.\mvnw.cmd spring-boot:run
```

### macOS or Linux

```bash
./mvnw spring-boot:run
```

The backend starts at:

```text
http://localhost:8080
```

Health endpoint:

```text
GET http://localhost:8080/health
```

## Backend Notes

- The application searches for `.env` in the backend directory, repository root, and related parent paths.
- Operating-system environment variables and JVM system properties take precedence over `.env`.
- The backend uses stateless Spring Security.
- Login sets a JWT in an HTTP-only cookie named `jwt`.
- The API also accepts `Authorization: Bearer <token>` when a token is supplied manually.
- Browser requests to protected endpoints must include credentials. The frontend already uses `credentials: 'include'`.
- Registration sends an email-verification token through SMTP and currently also returns it in the registration response for project testing.
- Changing backend environment variables requires restarting Spring Boot.
- An administrator account is not created automatically. For local admin testing, promote a verified local user to the `ADMIN` role in the local database.

# API Endpoints

## Authentication and access

### Public authentication endpoints

- `POST /auth/register` — create a user account
- `POST /auth/login` — authenticate and set the JWT cookie
- `POST /auth/logout` — clear the JWT cookie
- `GET /auth/verify-email?token=...` — verify an email address
- `GET /auth/account-status?email=...` — read verification and lock status
- `POST /auth/forgot-password` — generate and email a reset token
- `POST /auth/reset-password` — reset a password using a token

### Authenticated account endpoints

- `GET /auth/me` — return the signed-in user
- `PATCH /auth/me` — update first name, last name, or email

## Vehicles

### Public

- `GET /vehicles` — list vehicles
- `GET /vehicles/{vehicleId}` — get one vehicle
- `GET /vehicles/filter` — filter vehicles through query parameters
- `GET /reviews/vehicles/{vehicleId}` — list vehicle reviews
- `GET /vehicle-history/vehicles/{vehicleId}` — list public vehicle-history notes

Common vehicle filter parameters:

- `brand`, `make`, `model`, `color`
- `year`, `minYear`, `maxYear`
- `minPrice`, `maxPrice`
- `isOnSale`, `isInStock`

### Authenticated

- `POST /vehicles/compare` — compare two or three vehicles

Example:

```json
{
  "vehicleIds": [1, 2, 3]
}
```

### Administrator

- `POST /vehicles` — create a vehicle
- `PUT /vehicles/{vehicleId}` — replace editable vehicle data
- `PATCH /vehicles/{vehicleId}` — partially update a vehicle
- `DELETE /vehicles/{vehicleId}` — delete a vehicle

## Favorites

The frontend label uses **Favorites**. The backend endpoint uses the existing British spelling `favourites`.

- `GET /users/{userId}/favourites` — list saved vehicles
- `GET /users/{userId}/favourites/{vehicleId}` — get one saved vehicle
- `POST /users/{userId}/favourites` — save a vehicle
- `DELETE /users/{userId}/favourites/{vehicleId}` — remove a saved vehicle

Example create body:

```json
{
  "userId": 7,
  "vehicleId": 12
}
```

## Reviews and Star Ratings

- `GET /users/{userId}/reviews` — list a user’s reviews
- `GET /users/{userId}/reviews/{reviewId}` — get one review
- `POST /users/{userId}/reviews` — create a review
- `PATCH /users/{userId}/reviews/{reviewId}` — edit a review
- `DELETE /users/{userId}/reviews/{reviewId}` — delete one review
- `DELETE /users/{userId}/reviews` — delete all reviews by a user
- `GET /reviews` — list all reviews
- `GET /reviews/vehicles/{vehicleId}` — list reviews for a vehicle
- `DELETE /reviews` — administrator: delete all reviews
- `DELETE /reviews/vehicles/{vehicleId}` — administrator: delete reviews for one vehicle

Create or update requests include a comment and a rating from 1 to 5:

```json
{
  "userId": 7,
  "vehicleId": 12,
  "reviewComments": "Comfortable and easy to drive.",
  "rating": 5
}
```

Users may create multiple reviews for the same vehicle. Older reviews without ratings are still supported.

## Search History

- `GET /users/{userId}/search-history`
- `GET /users/{userId}/search-history/{searchHistoryId}`
- `POST /users/{userId}/search-history`
- `DELETE /users/{userId}/search-history/{searchHistoryId}`
- `DELETE /users/{userId}/search-history`

## Vehicle History

### User-scoped endpoints

- `GET /users/{userId}/vehicle-history`
- `GET /users/{userId}/vehicle-history/{vehicleHistoryId}`
- `POST /users/{userId}/vehicle-history`
- `DELETE /users/{userId}/vehicle-history/{vehicleHistoryId}`
- `DELETE /users/{userId}/vehicle-history`

### Global and administrator endpoints

- `GET /vehicle-history`
- `GET /vehicle-history/vehicles/{vehicleId}`
- `DELETE /vehicle-history`
- `DELETE /vehicle-history/vehicles/{vehicleId}`

The project also contains legacy user-scoped vehicle-history deletion routes for administrator maintenance.

## Customer Carts

Use the authenticated-user routes for the customer frontend:

- `GET /users/me/carts` — list the signed-in user’s carts
- `GET /users/me/carts/active` — get the latest ACTIVE cart
- `POST /users/me/carts` — create or return an active cart

The backend also contains general cart-management endpoints:

- `GET /carts`
- `GET /carts/{cartId}`
- `GET /carts/status/{cartStatusId}`
- `POST /carts`
- `PUT /carts/{cartId}`
- `DELETE /carts/{cartId}`

## Cart Lines and Per-Vehicle Financing

- `GET /carts/{cartId}/cart-lines` — list cart lines
- `POST /carts/{cartId}/cart-lines` — add a cash or financed line
- `DELETE /carts/{cartId}/cart-lines/{cartLineId}` — remove one specific line

Example financed line:

```json
{
  "vehicleId": 12,
  "quantity": 1,
  "financingSelected": true,
  "downPayment": 5000.00,
  "annualRate": 6.5,
  "termMonths": 60
}
```

Example cash line:

```json
{
  "vehicleId": 12,
  "quantity": 1,
  "financingSelected": false
}
```

Important behaviour:

- `quantity` defaults to `1`.
- Stock is validated across all lines for the same vehicle.
- Re-adding a vehicle creates another cart line. This allows different financing scenarios for the same vehicle.
- The frontend estimates financing immediately.
- The backend recalculates and stores the financing snapshot before saving the line.

## Checkout and Orders

- `POST /carts/{cartId}/checkout` — create an order from an active cart
- `GET /users/{userId}/orders` — list a user’s orders
- `DELETE /users/{userId}/orders/{orderId}` — delete an eligible order owned by the user
- `GET /orders` — administrator: list all orders
- `GET /orders/{orderId}` — get one order
- `GET /orders/status/{orderStatusId}` — list orders by status
- `GET /orders/{orderId}/loan` — read an order-level loan calculation
- `PUT /orders/{orderId}` — update editable order data
- `PATCH /orders/{orderId}/status` — update order status
- `DELETE /orders/{orderId}` — administrator: delete an order

Checkout copies each cart line into an order line, preserves financing values, updates inventory, and marks the cart as checked out.

The visible checkout form is simulated. It does not send card details to a real payment processor.

## Order Lines

- `GET /orders/{orderId}/order-lines`
- `POST /orders/{orderId}/order-lines`
- `DELETE /orders/{orderId}/order-lines/{orderLineId}`

## Payments

Payment endpoints support project payment records. They are not connected to the customer card form or a real payment gateway.

- `GET /payments`
- `GET /payments/{paymentId}`
- `GET /payments/status/{paymentStatusId}`
- `POST /payments`
- `PUT /payments/{paymentId}`
- `PATCH /payments/{paymentId}/status`
- `DELETE /payments/{paymentId}`

### Order payments

- `GET /orders/{orderId}/payment`
- `POST /orders/{orderId}/payment`
- `DELETE /orders/{orderId}/payment`

### User payments

- `GET /users/{userId}/payments`

## Status Endpoints

### Cart statuses

- `GET /cart-statuses`
- `GET /cart-statuses/{cartStatusId}`
- `POST /cart-statuses`

### Order statuses

- `GET /order-statuses`
- `GET /order-statuses/{orderStatusId}`
- `POST /order-statuses`

### Payment statuses

- `GET /payment-statuses`
- `GET /payment-statuses/{paymentStatusId}`
- `POST /payment-statuses`

## Administrator User Management

All routes require the `ADMIN` role.

- `GET /admin/users` — list users
- `PATCH /admin/users/{userId}/role` — update `USER` or `ADMIN`
- `PATCH /admin/users/{userId}/restrict` — set or clear a temporary restriction
- `DELETE /admin/users/{userId}` — delete a user and related project data

## Amp Chatbot

- `POST /api/chatbot/messages` — public chatbot endpoint

Example request:

```json
{
  "message": "How do I save a vehicle?",
  "history": []
}
```

Example response:

```json
{
  "message": "..."
}
```

Amp uses a customer-facing knowledge file at:

```text
apexauto/src/main/resources/chatbot/apexauto-site-knowledge.txt
```

See `CHATBOT_SETUP.md` for detailed chatbot setup and test cases.

# End-to-End API Testing Flow

The browser frontend is the recommended way to test the complete system. The following flow is useful for Postman or `curl.exe`.

## Authentication with a cookie jar

### 1) Register

```powershell
curl.exe -X POST "http://localhost:8080/auth/register" `
  -H "Content-Type: application/json" `
  -d '{\"firstName\":\"Mark\",\"lastName\":\"Tester\",\"email\":\"mark.tester@example.com\",\"password\":\"TestPass123!\"}'
```

The registration response currently contains `emailVerificationToken`, and the backend also sends the token through SMTP.

### 2) Verify the email

```powershell
curl.exe "http://localhost:8080/auth/verify-email?token=YOUR_TOKEN"
```

### 3) Login and save the JWT cookie

```powershell
curl.exe -X POST "http://localhost:8080/auth/login" `
  -H "Content-Type: application/json" `
  -c cookies.txt `
  -d '{\"email\":\"mark.tester@example.com\",\"password\":\"TestPass123!\"}'
```

### 4) Confirm the signed-in user

```powershell
curl.exe "http://localhost:8080/auth/me" -b cookies.txt
```

Save the returned `userId`.

## Primary customer flow

### 5) Get a vehicle

```powershell
curl.exe "http://localhost:8080/vehicles"
```

Use an existing `vehicleId`. Enable optional sample data before starting the backend if the database has no vehicles.

### 6) Create or retrieve an active cart

```powershell
curl.exe -X POST "http://localhost:8080/users/me/carts" `
  -H "Content-Type: application/json" `
  -b cookies.txt
```

Save the returned `cartId`.

### 7) Add a financed vehicle

```powershell
curl.exe -X POST "http://localhost:8080/carts/CART_ID/cart-lines" `
  -H "Content-Type: application/json" `
  -b cookies.txt `
  -d '{\"vehicleId\":1,\"quantity\":1,\"financingSelected\":true,\"downPayment\":5000,\"annualRate\":6.5,\"termMonths\":60}'
```

Replace `CART_ID` and `vehicleId`.

### 8) Inspect the cart

```powershell
curl.exe "http://localhost:8080/carts/CART_ID" -b cookies.txt
```

### 9) Checkout

```powershell
curl.exe -X POST "http://localhost:8080/carts/CART_ID/checkout" `
  -b cookies.txt
```

Save the returned `orderId`.

### 10) View customer orders

```powershell
curl.exe "http://localhost:8080/users/USER_ID/orders" -b cookies.txt
```

Verify that order lines preserve the financing snapshot from the cart.

# ApexAuto Frontend Local Development

The React frontend is located in the `frontend/` directory.

## Prerequisites

- Node.js 22.x
- npm included with Node.js
- The Spring Boot backend running locally or at a configured remote URL

The project declares Node `22.x` in `frontend/package.json`. Other Node versions may produce an engine warning.

## 1) Configure the frontend API URL

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

For local development:

```text
VITE_API_BASE_URL=http://localhost:8080
```

The frontend falls back to `http://localhost:8080` during development. Production builds require `VITE_API_BASE_URL`.

## 2) Install dependencies

Use the locked dependency versions:

```bash
npm ci
```

Use `npm install` only when intentionally changing dependencies.

## 3) Run frontend checks

```bash
npm run lint
npm run build
```

## 4) Start the development server

```bash
npm run dev
```

Vite normally starts at:

```text
http://localhost:5173
```

## 5) Preview a production build

```bash
npm run build
npm run preview
```

## Recommended Local Startup Order

1. Start MySQL.
2. Start the Spring Boot backend on port `8080`.
3. Start the Vite frontend on port `5173`.
4. Open `http://localhost:5173`.
5. Register, verify the email, sign in, and test customer features.

# Gemini Chatbot

Amp sends messages from the React frontend to the Spring Boot backend. The backend validates the request, loads the ApexAuto customer knowledge file, and calls Google Gemini.

Main files:

```text
frontend/src/pages/ChatbotPage.tsx
frontend/src/services/chatbotApi.ts
apexauto/src/main/java/com/example/apexauto/chatbot/
apexauto/src/main/resources/chatbot/apexauto-site-knowledge.txt
```

Required backend value:

```text
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Optional settings:

```text
GEMINI_MODEL=gemini-3.1-flash-lite
CHATBOT_MAX_OUTPUT_TOKENS=300
```

If the key is missing, the backend still starts, but the chatbot endpoint returns a controlled configuration error.

For setup steps, example requests, manual checks, and common errors, see:

```text
CHATBOT_SETUP.md
```

# Deployment Notes

## Vercel frontend

- Set the Vercel root directory to `frontend`.
- Set `VITE_API_BASE_URL` to the public Railway backend HTTPS origin.
- `frontend/vercel.json` rewrites client-side routes to `index.html`.

## Railway backend and database

- The backend is built from `apexauto/Dockerfile`.
- The Dockerfile uses a Maven build stage and a Java 21 runtime stage.
- The runtime container uses a non-root `spring` user.
- Add all backend environment variables to the Railway backend service.
- The MySQL database is provisioned as a separate managed service in the same Railway project.
- `railway.json` uses `/health` for deployment health checks and restarts the backend after failures.

## Production cookie and CORS example

```text
CORS_ALLOWED_ORIGINS=https://apexauto-beta.vercel.app
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=None
```

Use the exact deployed Vercel origin. Add preview origins only when they are intentionally supported.

# Troubleshooting

## Backend does not start

Check:

- Java 21 is active: `java -version`
- MySQL is running
- The database exists
- `.env` is next to `apexauto/pom.xml`
- `JWT_SECRET_KEY`, mail settings, and datasource values are present

## Frontend cannot reach the backend

Check:

- The backend is running on port `8080`
- `VITE_API_BASE_URL` points to the correct origin
- `CORS_ALLOWED_ORIGINS` includes the frontend origin
- Protected frontend requests use cookies and the backend cookie settings match HTTP or HTTPS

## Login succeeds but protected pages return 401

Check:

- The email has been verified
- The browser accepted the `jwt` cookie
- Local development uses `AUTH_COOKIE_SECURE=false`
- Cross-site production uses HTTPS and compatible SameSite settings

## Amp returns 503

Check:

- `GEMINI_API_KEY` is configured
- The Gemini project has available quota
- The configured model is available
- Spring Boot was restarted after editing `.env`

## Email verification or password reset does not send

Check:

- SMTP host, port, username, and password
- STARTTLS support
- Gmail accounts use an App Password when required
- The mail provider has not blocked the sign-in attempt
