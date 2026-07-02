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
