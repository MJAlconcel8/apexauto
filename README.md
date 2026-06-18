# ApexAuto Backend

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
- `DELETE /users/{userId}/vehicle-history/vehicles/{vehicleId}/history` — delete all vehicle history entries for a specific vehicle
- `DELETE /users/{userId}/vehicle-history/vehicles/history/all` — delete all vehicle history entries from the database


# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
