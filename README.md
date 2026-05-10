# 🔐 Secure Auth API

A production-ready REST API implementing authentication best practices and OWASP security guidelines.

![Node.js](https://img.shields.io/badge/Node.js-v24-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Redis](https://img.shields.io/badge/Redis-7-red)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 Features

- ✅ **JWT Authentication** — Access tokens + Refresh token rotation
- ✅ **2FA with Google Authenticator** — TOTP-based two-factor authentication
- ✅ **Brute Force Protection** — Account locking after failed attempts
- ✅ **Rate Limiting** — Per-route request throttling
- ✅ **Password Hashing** — bcrypt with configurable rounds
- ✅ **Input Validation** — express-validator on all endpoints
- ✅ **Security Headers** — Helmet.js for HTTP hardening
- ✅ **CORS** — Configurable cross-origin resource sharing
- ✅ **Role-based Authorization** — User and admin roles

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL |
| Cache / Sessions | Redis |
| Auth | JWT + bcrypt |
| 2FA | speakeasy + qrcode |
| Security | Helmet, CORS, express-rate-limit |
| Validation | express-validator |
| Container | Docker |

## 📋 Prerequisites

- Node.js v18+
- Docker and Docker Compose

## ⚙️ Installation

```bash
# 1. Clone the repository
git clone https://github.com/VladimirRamirez07/secure-auth-api.git
cd secure-auth-api

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your values

# 4. Start PostgreSQL and Redis
docker-compose up -d

# 5. Run database migrations
node src/config/migrate.js

# 6. Start the server
node src/app.js
```

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login with email/password | ❌ |
| POST | `/api/auth/refresh-token` | Rotate refresh token | ❌ |
| POST | `/api/auth/logout` | Logout and invalidate token | ✅ |

### Two-Factor Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/2fa/setup` | Generate 2FA secret and QR code | ✅ |
| POST | `/api/2fa/verify` | Verify TOTP token | ✅ |
| POST | `/api/2fa/disable` | Disable 2FA | ✅ |

## 🔒 Security Features

### Brute Force Protection
Accounts are automatically locked after **5 failed login attempts** for **15 minutes**.

```json
{
  "status": "error",
  "message": "Too many failed attempts. Account locked for 15 minutes"
}
```

### Rate Limiting
- **Global API**: 100 requests / 15 minutes
- **Auth endpoints**: 10 requests / 15 minutes  
- **Register**: 5 requests / hour

### Password Policy
Passwords must contain:
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character (!@#$%^&*)

## 🗄️ Database Schema

```sql
users
├── id (UUID)
├── email (UNIQUE)
├── password (bcrypt hash)
├── username (UNIQUE)
├── role (user | admin)
├── two_factor_secret
├── two_factor_enabled
├── login_attempts
└── locked_until

refresh_tokens
├── id (UUID)
├── user_id (FK → users)
├── token
└── expires_at

login_attempts
├── id (UUID)
├── email
├── ip_address
├── success
└── attempted_at
```

## 📁 Project Structure

```
secure-auth-api/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── redis.js
│   │   ├── schema.sql
│   │   └── migrate.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── twoFactor.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── validate.middleware.js
│   │   └── rateLimit.middleware.js
│   ├── models/
│   │   └── user.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── twoFactor.routes.js
│   ├── services/
│   │   └── twoFactor.service.js
│   └── app.js
├── .env.example
├── docker-compose.yml
└── package.json
```
## 📄 License

MIT © [VladimirRamirez07](https://github.com/VladimirRamirez07)
