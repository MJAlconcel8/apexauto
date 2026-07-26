# ApexAuto verified deployment guide

This guide deploys the Vite/React frontend to Vercel and the Spring Boot/MySQL backend to Railway.

Verified baseline: the project snapshot supplied on July 26, 2026.

Recommended branch: `deploy/vercel-railway`

## 1. Fork and synchronize the repository

Fork the team repository in GitHub, then clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/apexauto.git
cd apexauto
```

Keep the team repository as `upstream`:

```bash
git remote add upstream https://github.com/MJAlconcel8/apexauto.git
git fetch upstream
git switch main
git reset --hard upstream/main
git push origin main --force-with-lease
```

Create the deployment branch:

```bash
git switch -c deploy/vercel-railway
```

Apply the provided format patch:

```bash
git am --3way /path/to/apexauto-vercel-railway-verified.patch
```

Push the branch to your fork:

```bash
git push -u origin deploy/vercel-railway
```

## 2. What the patch changes

### Frontend

- Adds one shared API origin in `frontend/src/config/api.ts`.
- Removes all hard-coded `http://localhost:8080` API calls from application source files.
- Makes a production build fail immediately when `VITE_API_BASE_URL` is missing.
- Adds `frontend/vercel.json` so direct refreshes of React Router routes return `index.html`.
- Pins Vercel/local builds to supported Node.js `22.x`.

### Backend

- Makes Spring Boot bind to `0.0.0.0` and Railway's dynamic `PORT`.
- Enables forwarded-header processing for Railway HTTPS proxy requests.
- Replaces destructive Hibernate `create-drop` with configurable `update`.
- Makes CORS origins configurable and supports multiple comma-separated origins.
- Makes JWT cookie `Secure` and `SameSite` behavior configurable for local, Railway/Vercel, and custom-domain deployments.
- Returns valid JSON from `/` and `/health`.
- Adds a Java 21 multi-stage Dockerfile and `.dockerignore`.

### Railway

- Adds root-level `railway.json` with Dockerfile build mode, backend watch paths, `/health`, and restart settings.

## 3. Local preflight

Use Node.js 22 and Java 21.

### Frontend

```bash
cd frontend
npm ci
VITE_API_BASE_URL=http://localhost:8080 npm run build
npm run lint
```

PowerShell:

```powershell
cd frontend
npm ci
$env:VITE_API_BASE_URL = "http://localhost:8080"
npm run build
npm run lint
```

### Backend

```bash
cd ../apexauto
./mvnw test
./mvnw -DskipTests package
docker build -t apexauto-backend:deploy .
```

Windows PowerShell:

```powershell
cd ..\apexauto
.\mvnw.cmd test
.\mvnw.cmd -DskipTests package
docker build -t apexauto-backend:deploy .
```

## 4. Railway website setup

Create a Railway project such as **ApexAuto Staging**.

### Add MySQL

1. Click **New** -> **Database** -> **MySQL**.
2. Keep the MySQL and backend services in the same Railway project.
3. The examples below assume the database service is named `MySQL`. Replace that name in references if yours differs.

### Add the backend service

1. Add an **Empty Service** first.
2. Add all variables before connecting the repository.
3. Connect your fork: `YOUR_USERNAME/apexauto`.
4. Track branch: `deploy/vercel-railway`.
5. Set **Root Directory** to `/apexauto`.
6. Set **Config File Path** to `/railway.json`.
7. Do not add a custom start command. The Dockerfile supplies the entrypoint.

### Required database variables

```text
SPRING_DATASOURCE_URL=jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=${{MySQL.MYSQLUSER}}
SPRING_DATASOURCE_PASSWORD=${{MySQL.MYSQLPASSWORD}}
```

### Required authentication and persistence variables

Generate a Base64 32-byte JWT secret:

```bash
openssl rand -base64 32
```

PowerShell alternative:

```powershell
python -c "import secrets,base64; print(base64.b64encode(secrets.token_bytes(32)).decode())"
```

Set:

```text
JWT_SECRET_KEY=PASTE_GENERATED_VALUE
JWT_EXPIRATION_TIME=2592000000
JPA_DDL_AUTO=update
JPA_SHOW_SQL=false
JPA_FORMAT_SQL=false
```

For the default cross-site Vercel and Railway domains, set:

```text
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=None
```

For local HTTP, use `false` and `Lax`. For sibling custom domains such as `app.example.com` and `api.example.com`, use `true` and `Lax`.

### Temporary CORS value

Before Vercel assigns a domain:

```text
CORS_ALLOWED_ORIGINS=https://placeholder.invalid
```

Replace it with the exact Vercel HTTPS origin after the frontend deploys. Do not include a path or trailing slash.

### Required mail variables

The current application sends verification and password-reset messages synchronously, so configure working SMTP values for complete registration testing:

```text
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=YOUR_EMAIL
MAIL_PASSWORD=YOUR_GMAIL_APP_PASSWORD_OR_SMTP_PASSWORD
```

For Gmail, use an App Password rather than your normal account password.

### Optional chatbot variables

```text
GEMINI_API_KEY=YOUR_KEY
GEMINI_MODEL=gemini-3.1-flash-lite
CHATBOT_MAX_OUTPUT_TOKENS=300
```

The application can start without a Gemini key; chatbot calls will not work until it is configured.

### Deploy and generate a domain

1. Deploy the backend.
2. Confirm the build uses `apexauto/Dockerfile`.
3. Confirm the deployment passes health check `/health`.
4. Open **Settings** -> **Networking** -> **Public Networking** -> **Generate Domain**.
5. Test:

```text
https://YOUR_BACKEND.up.railway.app/health
```

Expected response:

```json
{"status":"UP"}
```

## 5. Vercel website setup

1. Click **Add New** -> **Project**.
2. Import `YOUR_USERNAME/apexauto`.
3. Set **Root Directory** to `frontend`.
4. Set **Framework Preset** to `Vite`.
5. Use:

```text
Install Command: npm ci
Build Command: npm run build
Output Directory: dist
Node.js Version: 22.x
```

6. Add this variable to Preview and Production:

```text
VITE_API_BASE_URL=https://YOUR_BACKEND.up.railway.app
```

Do not include a trailing slash.

7. After the project exists, open **Settings** -> **Environments** -> **Production** -> **Branch Tracking** and select `deploy/vercel-railway`.
8. Create or redeploy a deployment from `deploy/vercel-railway`.

## 6. Finish CORS after Vercel assigns a domain

Copy the stable Vercel URL, for example:

```text
https://apexauto-staging.vercel.app
```

In Railway, replace the placeholder:

```text
CORS_ALLOWED_ORIGINS=https://apexauto-staging.vercel.app
```

Railway must redeploy after the variable changes.

For multiple exact origins, separate them with commas:

```text
CORS_ALLOWED_ORIGINS=https://apexauto-staging.vercel.app,https://another-approved-preview.vercel.app
```

Do not allow every Vercel project with a broad wildcard when credentialed cookies are enabled.

## 7. Smoke tests

Test all of the following from the Vercel URL:

1. Home page and public catalogue.
2. Direct refresh on nested routes such as `/login`, `/catalogue`, and vehicle pages.
3. Registration and email verification.
4. Login, `/auth/me`, browser refresh, and logout.
5. Cart and checkout.
6. Orders.
7. Admin dashboard, users, inventory, and order actions.
8. Chatbot when Gemini is configured.
9. Database persistence after redeploying the backend.

In browser DevTools -> Network, confirm:

- Requests use the Railway HTTPS origin, never `localhost:8080`.
- Credentialed requests include `credentials: include`.
- The login response includes `Set-Cookie`.
- Later authenticated calls include the `jwt` cookie.
- Responses include `Access-Control-Allow-Origin` for the exact Vercel origin and `Access-Control-Allow-Credentials: true`.

## 8. Important cookie-domain note

`*.vercel.app` and `*.up.railway.app` are different sites. The patch uses `SameSite=None; Secure`, which is the correct cookie configuration for that arrangement, but browser privacy controls can still block third-party cookies.

The most reliable production arrangement is:

```text
app.yourdomain.com -> Vercel
api.yourdomain.com -> Railway
```

Then configure:

```text
VITE_API_BASE_URL=https://api.yourdomain.com
CORS_ALLOWED_ORIGINS=https://app.yourdomain.com
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=Lax
```

## 9. Move the proven deployment back to the team repository

After staging works:

1. Open a pull request from your fork's `deploy/vercel-railway` into `MJAlconcel8/apexauto`.
2. Ask the owner to create or push the same branch in the shared repository.
3. Have the owner connect the shared repository to the final Vercel and Railway projects.
4. Use new production secrets and a separate production MySQL database.
5. Merge into `main` only after the shared-repository deployment passes the same smoke tests.

## 10. Troubleshooting

### Vercel says `VITE_API_BASE_URL` is missing

Add it to the environment used by the deployment and redeploy. Vite embeds the variable at build time.

### Browser requests still call localhost

Confirm Vercel deployed `deploy/vercel-railway`, then search locally:

```bash
grep -R "http://localhost:8080" frontend/src --exclude=api.ts
```

The command should print nothing.

### Railway cannot find the Dockerfile

Confirm:

```text
Root Directory: /apexauto
Config File Path: /railway.json
```

### Railway health check fails

Check deployment logs for missing database, JWT, or mail variables. Confirm `/health` returns HTTP 200 and Spring listens on Railway's injected `PORT`.

### Login works but `/auth/me` returns 401

Inspect the browser's cookie/storage panel and the login `Set-Cookie` header. Confirm:

```text
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=None
CORS_ALLOWED_ORIGINS=https://EXACT_VERCEL_ORIGIN
```

If the browser blocks third-party cookies, use sibling custom domains.

### Data disappears

Confirm `JPA_DDL_AUTO=update`. Never deploy `create-drop` against a persistent database.
