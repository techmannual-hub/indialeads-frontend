# IndiaLeads CRM — Complete Setup Guide

A full-stack WhatsApp CRM for Indian B2B sales teams.

---

## Repository Structure

```
indialeads/
├── indialeads-api/          ← Node.js + Express backend
│   ├── src/
│   │   ├── modules/         ← 12 feature modules
│   │   ├── queues/          ← BullMQ workers
│   │   ├── config/          ← DB, Redis, S3, env
│   │   └── middleware/      ← Auth, error handling
│   ├── prisma/schema.prisma
│   └── docker-compose.yml
│
└── indialeads-frontend/
    └── apps/
        ├── dashboard/       ← CRM App (Next.js)
        └── web/             ← Marketing site (Next.js)
```

---

## Prerequisites

- Node.js 20+
- Docker + Docker Compose
- A Meta Developer account (for WhatsApp API)
- AWS account with S3 bucket

---

## Quick Start (Local Development)

### 1. Clone and configure the API

```bash
cd indialeads-api
cp .env.example .env
# Fill in DATABASE_URL, REDIS_URL, JWT_SECRET,
# AWS_*, ENCRYPTION_KEY, WA_VERIFY_TOKEN
```

### 2. Start infrastructure

```bash
docker compose up postgres redis -d
```

### 3. Run migrations and seed demo data

```bash
npm install
npx prisma migrate dev --name init
npm run prisma:seed
```

### 4. Start API server and queue workers

```bash
# Terminal 1 — API
npm run dev

# Terminal 2 — BullMQ workers
npm run worker
```

API runs at `http://localhost:4000`

---

### 5. Configure and start the CRM dashboard

```bash
cd indialeads-frontend/apps/dashboard
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:4000

npm install
npm run dev
```

Dashboard runs at `http://localhost:3001`

---

### 6. Configure and start the marketing website

```bash
cd indialeads-frontend/apps/web
npm install
npm run dev
```

Website runs at `http://localhost:3000`

---

## Demo Login

After running the seed:

| Field    | Value                       |
|----------|-----------------------------|
| Email    | demo@indialeadscrm.com      |
| Password | demo@1234                   |

---

## Environment Variables Reference

### API (`indialeads-api/.env`)

| Variable               | Description                                      |
|------------------------|--------------------------------------------------|
| `DATABASE_URL`         | PostgreSQL connection string                     |
| `REDIS_URL`            | Redis connection string                          |
| `JWT_SECRET`           | Min 32-char secret for JWT signing               |
| `REFRESH_TOKEN_SECRET` | Separate secret for refresh tokens               |
| `ENCRYPTION_KEY`       | 32-char key for AES-256 WA token encryption      |
| `AWS_REGION`           | e.g. `ap-south-1`                                |
| `AWS_S3_BUCKET`        | Your S3 bucket name                              |
| `WA_VERIFY_TOKEN`      | Token you set in Meta webhook configuration      |
| `WA_APP_SECRET`        | From Meta App Dashboard for HMAC verification    |
| `COOLING_PERIOD_DAYS`  | Days a lead stays in COOLING status (default: 7) |
| `BROADCAST_DELAY_MIN_MS` | Min delay between broadcast messages (20000)  |
| `BROADCAST_DELAY_MAX_MS` | Max delay between broadcast messages (40000)  |

### Dashboard (`apps/dashboard/.env.local`)

| Variable                  | Description                             |
|---------------------------|-----------------------------------------|
| `NEXT_PUBLIC_API_URL`     | Backend API URL                         |
| `NEXT_PUBLIC_SOCKET_URL`  | Socket.io URL (usually same as API)     |
| `NEXT_PUBLIC_DEMO_MODE`   | `"true"` to enable demo banner          |

---

## WhatsApp Setup (Per Tenant)

1. Go to **Settings → WhatsApp** in the CRM
2. Follow the 6-step wizard:
   - Create Meta Business Account
   - Verify your business
   - Add a WhatsApp phone number
   - Generate a System User permanent access token
   - Paste credentials into the CRM
   - Send a test message

3. Add the webhook URL in Meta Developer Console:
   ```
   https://api.indialeadscrm.com/webhooks/whatsapp
   ```

---

## Lead Import Excel Format

Your `.xlsx` file should have these columns (column names are flexible):

| name         | phone          | product        |
|--------------|----------------|----------------|
| Rahul Sharma | 9876543210     | Solar Panel    |
| Priya Singh  | +919876543211  | Water Heater   |

**Rules:**
- Duplicate phone within 30 days → skipped
- Same phone + new product → product list updated
- Phone numbers auto-normalized to E.164 (+91XXXXXXXXXX)

---

## Production Deployment (Docker)

```bash
# Build and start all services
docker compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker compose exec api npx prisma migrate deploy

# Seed demo tenant (optional)
docker compose exec api npm run prisma:seed
```

### Nginx SSL setup

Place your SSL certificates at:
```
nginx/ssl/fullchain.pem
nginx/ssl/privkey.pem
```

Then update `nginx/nginx.conf` with your actual domain names.

---

## API Route Reference

All routes are prefixed with `/api/`.

| Module       | Base Path         | Auth |
|--------------|-------------------|------|
| Auth         | `/api/auth`       | Mixed|
| Tenant       | `/api/tenant`     | ✅   |
| Leads        | `/api/leads`      | ✅   |
| Templates    | `/api/templates`  | ✅   |
| Broadcasts   | `/api/broadcasts` | ✅   |
| Followups    | `/api/followups`  | ✅   |
| Automations  | `/api/automations`| ✅   |
| WhatsApp     | `/api/whatsapp`   | ✅   |
| Catalog      | `/api/catalog`    | ✅   |
| Analytics    | `/api/analytics`  | ✅   |
| Storage      | `/api/storage`    | ✅   |
| License      | `/api/license`    | ✅   |
| Inbox        | `/api/inbox`      | ✅   |
| WA Webhook   | `/webhooks/whatsapp` | Public (HMAC) |

---

## Socket.io Events

Connect with: `{ auth: { token: "<access_token>" } }`

| Event                  | Direction     | Payload                              |
|------------------------|---------------|--------------------------------------|
| `message:new`          | Server→Client | `{ message, conversation_id, lead }` |
| `message:status`       | Server→Client | `{ wa_message_id, status }`          |
| `broadcast:progress`   | Server→Client | `{ broadcastId, queued, total }`     |
| `broadcast:complete`   | Server→Client | `{ broadcastId }`                    |
| `lead_import:progress` | Server→Client | `{ uploadId, progress, imported }`   |
| `lead_import:complete` | Server→Client | `{ uploadId, imported, skipped }`    |
| `join:conversation`    | Client→Server | `conversationId`                     |

---

## Tech Stack Summary

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| Backend     | Node.js, Express.js, TypeScript                 |
| ORM         | Prisma                                          |
| Database    | PostgreSQL 16                                   |
| Queue       | Redis + BullMQ                                  |
| File Storage| AWS S3                                          |
| Real-time   | Socket.io                                       |
| Dashboard   | Next.js 14 (App Router), TailwindCSS, Zustand   |
| Website     | Next.js 14 (Static Export), TailwindCSS         |
| Deployment  | Docker, Docker Compose, Nginx                   |

---

## Demo Mode

Set `NEXT_PUBLIC_DEMO_MODE=true` in the dashboard `.env.local`.

This will:
- Pre-fill the login form with demo credentials
- Show a persistent amber banner: "DEMO MODE — No real messages will be sent"
- The demo tenant created by the seed script has `is_demo: true`

The backend does **not** block WA sends in demo mode automatically — you should either:
- Not configure WA credentials on the demo tenant, OR
- Add a guard in `whatsapp.service.ts`: `if (tenant.is_demo) return "demo_message_id"`

---

## License

MIT — free for commercial use.

---

*Built for India 🇮🇳 — IndiaLeads CRM*
