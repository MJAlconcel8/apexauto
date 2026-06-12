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
cd /Users/markalconcel/Documents/GitHub/apexauto/apexauto
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
