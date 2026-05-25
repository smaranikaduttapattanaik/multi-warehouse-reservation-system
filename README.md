# Multi-Warehouse Reservation System

A concurrency-safe inventory reservation system built with Next.js, Prisma, PostgreSQL, and TypeScript.

This project simulates a real-world e-commerce inventory reservation flow where stock can be temporarily reserved, confirmed, released, or automatically restored after expiry.

---

# Features

## Inventory Management
- Multi-warehouse inventory support
- Real-time available stock tracking
- Warehouse-wise stock display
- Out-of-stock handling

## Reservation System
- Create temporary reservations
- Confirm reservations
- Cancel reservations
- Automatic reservation expiry
- Automatic stock restoration after expiry

## Concurrency Safety
- Transaction-safe reservation creation
- Prevents overselling
- Uses Prisma transactions
- Handles simultaneous reservation attempts safely

## Frontend UI
- Dark modern responsive UI
- Product cards
- Live stock counters
- Reservation checkout page
- Countdown timer
- Status updates
- Auto refresh after actions

---

# Tech Stack

## Frontend
- Next.js 16
- React
- TypeScript

## Backend
- Next.js API Routes
- Prisma ORM
- PostgreSQL

## Database
- PostgreSQL

---

# Project Structure

```bash
app/
│
├── api/
│   ├── cron/
│   │   └── release-expired/
│   │       └── route.ts
│   │
│   ├── products/
│   │   └── route.ts
│   │
│   ├── reservations/
│   │   ├── route.ts
│   │   │
│   │   └── [id]/
│   │       ├── route.ts
│   │       │
│   │       ├── confirm/
│   │       │   └── route.ts
│   │       │
│   │       └── release/
│   │           └── route.ts
│   │
│   └── warehouses/
│       └── route.ts
│
├── reservations/
│   └── [id]/
│       └── page.tsx
│
├── favicon.ico
├── globals.css
├── layout.tsx
└── page.tsx
│
components/
├── ProductCard.tsx
└── ReservationCheckout.tsx
│
lib/
├── prisma.ts
├── schemas.ts
└── expiry.ts
│
prisma/
├── schema.prisma
└── seed.ts
│
public/
```
---

# Database Schema

## Product
Stores product information.

## Warehouse
Stores warehouse details.

## Inventory
Tracks stock per warehouse.

## Reservation
Handles temporary stock reservations.

---

# Reservation Lifecycle

## 1. Product Reservation
User clicks Reserve.

Backend:
- validates inventory
- checks available stock
- creates reservation
- increments reserved units

## 2. Checkout Page
User is redirected to reservation checkout page.

Features:
- countdown timer
- confirm button
- cancel button
- live status updates

## 3. Reservation Confirmation
If user confirms:
- reservation status becomes CONFIRMED
- reserved stock remains allocated

## 4. Reservation Cancellation
If user cancels:
- reservation becomes RELEASED
- reserved stock restored

## 5. Reservation Expiry
If timer expires:
- reservation becomes EXPIRED
- stock restored automatically

---

# Concurrency Handling

The system prevents overselling using Prisma transactions.

Reservation creation:
- locks inventory operation
- checks current available stock
- safely updates reserved units

This ensures:
- multiple users cannot oversell stock
- inventory remains consistent

---

# API Endpoints

## Products

### Get Products
```http
GET /api/products
```

---

## Reservations

### Create Reservation
```http
POST /api/reservations
```

Request Body:
```json
{
  "inventoryId": "inventory_id",
  "quantity": 1
}
```

---

### Get Reservation
```http
GET /api/reservations/:id
```

---

### Confirm Reservation
```http
POST /api/reservations/:id/confirm
```

---

### Release Reservation
```http
POST /api/reservations/:id/release
```

---

## Cron Endpoint

### Release Expired Reservations
```http
GET /api/cron/release-expired
```

Requires:
```http
Authorization: your-secret-key
```

---

# Setup Instructions

## 1. Clone Repository

```bash
git clone <your-repo-url>
cd multi-warehouse-reservation-system
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Setup Environment Variables

Create `.env` file:

```env
DATABASE_URL="your_postgres_url"

CRON_SECRET="your-secret-key"
```

---

## 4. Setup Database

```bash
npx prisma migrate dev
```

---

## 5. Seed Database

```bash
npm run db:seed
```

---

## 6. Start Development Server

```bash
npm run dev
```

---

# Testing Flow

## Reservation Flow
1. Open homepage
2. Click Reserve
3. Go to checkout page
4. Confirm or cancel reservation

## Expiry Flow
1. Create reservation
2. Wait for timer expiry
3. Reservation becomes EXPIRED
4. Stock automatically restores

---

# Future Improvements

- Authentication
- Admin dashboard
- Redis queue for expiry jobs
- WebSocket live updates
- Toast notifications
- Skeleton loaders
- Payment integration
- Order management

---

# Screenshots

<img width="1919" height="916" alt="image" src="https://github.com/user-attachments/assets/a423efd3-e897-4c14-b279-d3eb5140c132" />


---

# Author

Smaranika Dutta

---

# License

MIT
