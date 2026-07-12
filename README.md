# ApexAuto Backend Local Development

This directory contains the Spring Boot backend for ApexAuto.

## Prerequisites

- Java 21
- Maven 3.9+ (or use the bundled `mvnw` wrapper)
- MySQL 8+

## 1) Create a local `.env`

The backend loads environment values from a local `.env` file before Spring Boot starts.
Place the file next to `pom.xml` in this directory:

```bash
cd /Users/{path-to-apex-auto}/apexauto/apexauto
cp env.example .env
```

Then update the values to match your machine and local database.

### Variables used by the backend

- `SPRING_DATASOURCE_URL` — JDBC URL for your local MySQL database
- `SPRING_DATASOURCE_USERNAME` — MySQL username
- `SPRING_DATASOURCE_PASSWORD` — MySQL password
- `JWT_SECRET_KEY` — **required** — Base64-encoded 256-bit secret used to sign JWTs (no default; the app will fail to start if missing)
- `JWT_EXPIRATION_TIME` — JWT lifetime in milliseconds (optional, defaults to `3600000` = 1 hour)

Generate a secure `JWT_SECRET_KEY`:

```bash
openssl rand -base64 32
```

or with Node:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

> **Never commit a real secret key.** `.env` is already in `.gitignore`.

## 2) Create a local MySQL database for testing

The backend uses `spring.jpa.hibernate.ddl-auto=update`, so once the database exists,
Hibernate will create or update the tables automatically.

Example database setup:

```bash
mysql -u root -p
```

Inside the MySQL shell:

```sql
CREATE DATABASE apexauto_test;
CREATE USER 'apexauto_user'@'localhost' IDENTIFIED BY 'apexauto_password';
GRANT ALL PRIVILEGES ON apexauto_test.* TO 'apexauto_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Use the same database name in `SPRING_DATASOURCE_URL`, for example:

```text
jdbc:mysql://localhost:3306/apexauto_test?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
```

## 3) Run the backend

From this directory:

```bash
./mvnw spring-boot:run
```

If you want to run the backend tests:

```bash
./mvnw test
```

## 4) Run backend tests

Backend tests are stored in:

```text
src/test/java/com/example/apexauto/
```

Service-level tests are stored in:

```text
src/test/java/com/example/apexauto/services/
```

Run all backend tests:

```bash
./mvnw test
```

### Current service test coverage

#### `OrderServiceTest`

- Creates an order with order lines and reduces vehicle stock
- Rejects duplicate vehicle IDs in the same order
- Blocks order-line changes after a payment exists

#### `PaymentServiceTest`

- Rejects duplicate payments for the same order

## Notes

- The application checks for `.env` in this directory, the workspace root, and a few related paths.
- If a value is already present as an OS environment variable or JVM system property, it takes precedence over `.env`.
- `JWT_EXPIRATION_TIME` is in milliseconds; the default fallback is `3600000` (1 hour).

## Endpoints

### Authentication

- `POST /auth/register` — register a new user
- `POST /auth/login` — log in and receive a JWT
- `GET /auth/verify-email?token=...` — verify a user's email address
- `GET /auth/account-status?email=...` — check whether an account is enabled, verified, or locked
- `POST /auth/forgot-password` — generate a password reset token
- `POST /auth/reset-password` — reset a password using a token

### Search History

- `GET /users/{userId}/search-history` — list all search history entries for a user
- `GET /users/{userId}/search-history/{searchHistoryId}` — get one search history entry for a user
- `POST /users/{userId}/search-history` — create a new search history entry for a user
- `DELETE /users/{userId}/search-history/{searchHistoryId}` — delete one search history entry for a user
- `DELETE /users/{userId}/search-history` — delete all search history entries for a user

### Vehicle Endpoints

- `GET /vehicles` — list all vehicles
- `GET /vehicles/{vehicleId}` — get one vehicle by ID
- `POST /vehicles` — create a new vehicle
- `PUT /vehicles/{vehicleId}` — fully update an existing vehicle (send all fields)
- `PATCH /vehicles/{vehicleId}` — partially update an existing vehicle (send only changed fields)
- `DELETE /vehicles/{vehicleId}` — delete a vehicle by ID
- `GET /vehicles/filter` — filter vehicles by query parameters

Common filter query parameters for `GET /vehicles/filter`:

- `brand`, `make`, `model`, `color`
- `year` (exact match)
- `minYear`, `maxYear` (range; ignored when `year` is provided)
- `minPrice`, `maxPrice`
- `isOnSale`, `isInStock`

### Vehicle History

- `GET /users/{userId}/vehicle-history` — list all vehicle history entries for a user
- `GET /users/{userId}/vehicle-history/{vehicleHistoryId}` — get one vehicle history entry for a user
- `POST /users/{userId}/vehicle-history` — create a new vehicle history entry for a user
- `DELETE /users/{userId}/vehicle-history/{vehicleHistoryId}` — delete one vehicle history entry for a user
- `DELETE /users/{userId}/vehicle-history` — delete all vehicle history entries for a user
- `GET /vehicle-history` — list all vehicle history entries across all users and vehicles
- `GET /vehicle-history/vehicles/{vehicleId}` — list all vehicle history entries for a specific vehicle
- `DELETE /vehicle-history/vehicles/{vehicleId}` — delete all vehicle history entries for a specific vehicle
- `DELETE /vehicle-history` — delete all vehicle history entries from the database

### Review

- `GET /users/{userId}/reviews` — list all reviews created by a specific user (newest first)
- `GET /users/{userId}/reviews/{reviewId}` — get one specific review for a user
- `POST /users/{userId}/reviews` — create a new review for a vehicle by a user
- `PATCH /users/{userId}/reviews/{reviewId}` — update the comments for a specific review
- `DELETE /users/{userId}/reviews/{reviewId}` — delete one specific review for a user
- `DELETE /users/{userId}/reviews` — delete all reviews created by a specific user
- `GET /reviews` — list all reviews across all vehicles and users (newest first)
- `GET /reviews/vehicles/{vehicleId}` — list all reviews for a specific vehicle (newest first)
- `DELETE /reviews` — delete all reviews across all vehicles and users
- `DELETE /reviews/vehicles/{vehicleId}` — delete all reviews for a specific vehicle

### Favourites

- `GET /users/{userId}/favourites` — list all favourite vehicles for a user (newest first)
- `GET /users/{userId}/favourites/{vehicleId}` — get one specific favourite vehicle for a user
- `POST /users/{userId}/favourites` — add a vehicle to a user's favourites
- `DELETE /users/{userId}/favourites/{vehicleId}` — remove a vehicle from a user's favourites

### Orders

- `GET /orders` - list all orders
- `GET /orders/{orderId}` - get one order by ID
- `GET /orders/status/{orderStatusId}` - list all orders with a specific order status
- `POST /orders` - create a new order with one or more vehicles
- `PUT /orders/{orderId}` - update editable order fields such as order status or delivery date
- `PATCH /orders/{orderId}/status` - update only the order status
- `DELETE /orders/{orderId}` - delete an order by ID

### User Orders

- `GET /users/{userId}/orders` - list all orders created by a specific user
- `POST /users/{userId}/orders` - create a new order for a specific user

### Order Lines

- `GET /orders/{orderId}/order-lines` - list all vehicles attached to an order
- `POST /orders/{orderId}/order-lines` - add a vehicle to an existing order
- `DELETE /orders/{orderId}/order-lines/{vehicleId}` - remove a vehicle from an existing order

### Order Statuses

- `GET /order-statuses` - list all order statuses
- `GET /order-statuses/{orderStatusId}` - get one order status by ID
- `POST /order-statuses` - create a reusable order status such as PENDING, CONFIRMED, DELIVERED, or CANCELLED

### Payments

- `GET /payments` - list all payments
- `GET /payments/{paymentId}` - get one payment by ID
- `GET /payments/status/{paymentStatusId}` - list all payments with a specific payment status
- `POST /payments` - create a new payment for an order
- `PUT /payments/{paymentId}` - update editable payment fields
- `PATCH /payments/{paymentId}/status` - update only the payment status
- `DELETE /payments/{paymentId}` - delete a payment by ID

### Order Payments

- `GET /orders/{orderId}/payment` - get the payment attached to a specific order
- `POST /orders/{orderId}/payment` - create a payment for a specific order
- `DELETE /orders/{orderId}/payment` - delete the payment attached to a specific order

### User Payments

- `GET /users/{userId}/payments` - list all payments for orders owned by a specific user

### Payment Statuses

- `GET /payment-statuses` - list all payment statuses
- `GET /payment-statuses/{paymentStatusId}` - get one payment status by ID
- `POST /payment-statuses` - create a reusable payment status such as PENDING, PAID, FAILED, or REFUNDED

### Cart Statuses

- `GET /cart-statuses` — list all cart statuses
- `GET /cart-statuses/{cartStatusId}` — get one cart status by ID
- `POST /cart-statuses` — create a reusable cart status such as ACTIVE, CHECKED_OUT, or ABANDONED

### Carts

- `GET /carts` — list all carts
- `GET /carts/{cartId}` — get one cart by ID
- `GET /carts/status/{cartStatusId}` — list all carts with a specific cart status
- `POST /carts` — create a new cart for a user, optionally with one or more vehicles
- `PUT /carts/{cartId}` — update editable cart fields such as cart status
- `DELETE /carts/{cartId}` — delete a cart by ID

### User Carts

- `GET /users/{userId}/carts` — list all carts created by a specific user
- `GET /users/{userId}/carts/active` — get the latest active cart for a specific user
- `POST /users/{userId}/carts` — create a new cart for a specific user

### Cart Lines

- `GET /carts/{cartId}/cart-lines` — list all vehicles attached to a cart
- `POST /carts/{cartId}/cart-lines` — add a vehicle to an existing cart
- `DELETE /carts/{cartId}/cart-lines/{vehicleId}` — remove a vehicle from an existing cart

# ApexAuto Frontend Local Development

The frontend is a React + Vite + TypeScript app located in the `frontend/` directory.

## Prerequisites

- Node.js 18+
- npm 9+

## 1) Install dependencies

```bash
cd frontend
npm install
```

## 2) Start the Development Server
```bash
npm run dev
```

The app will be available at http://localhost:5173 by default.
