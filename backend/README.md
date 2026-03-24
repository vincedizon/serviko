# EWQ Backend — Node.js + Express + MongoDB

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js               # MongoDB connection
├── middleware/
│   └── auth.js             # JWT authentication
├── models/
│   ├── User.js             # Users (customers, providers, admins)
│   ├── Listing.js          # Service listings
│   ├── Booking.js          # Bookings
│   ├── Rating.js           # Ratings & reviews
│   └── Payment.js          # Payments
├── routes/
│   ├── auth.js             # /api/auth/*
│   ├── listings.js         # /api/listings/*
│   ├── bookings.js         # /api/bookings/*
│   ├── ratings.js          # /api/ratings/*
│   ├── payments.js         # /api/payments/*
│   └── admin.js            # /api/admin/*
├── .env.example            # Copy to .env and fill in values
├── server.js               # Main entry point
├── package.json
└── angular-api.service.ts  # Copy to your Angular app
```

---

## 🚀 Setup Instructions

### Step 1 — Create a free MongoDB Atlas database

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account and a **free M0 cluster**
3. In **Database Access**, create a user with a password
4. In **Network Access**, allow access from `0.0.0.0/0` (or your IP)
5. Click **Connect** → **Connect your application** → copy the connection string

### Step 2 — Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:
```
MONGODB_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/ewq
JWT_SECRET=any_long_random_string_here
```

### Step 3 — Install dependencies

```bash
npm install
```

### Step 4 — Run the server

```bash
# Development (auto-restarts on file change)
npm run dev

# Production
npm start
```

Server runs at: **http://localhost:3000**

---

## 🔌 Connect to Angular

### 1. Add `angular-api.service.ts` to your Angular project

Copy `angular-api.service.ts` → `src/app/core/services/api.service.ts`

### 2. Enable HttpClient in your Angular app

In `app.config.ts`:
```typescript
import { provideHttpClient } from '@angular/common/http';

export const appConfig = {
  providers: [
    provideHttpClient(),
    // ... other providers
  ]
};
```

### 3. Use the service in your components

```typescript
import { ApiService } from '../../core/services/api.service';

export class LoginComponent {
  constructor(private api: ApiService) {}

  onLogin(email: string, password: string) {
    this.api.login({ email, password }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        // redirect to home
      },
      error: (err) => console.error(err.message)
    });
  }
}
```

---

## 📡 API Endpoints Reference

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | Login | No |
| GET | /api/auth/me | Get current user | Yes |
| PUT | /api/auth/me | Update profile | Yes |

### Listings
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/listings | Get all listings | No |
| GET | /api/listings/:id | Get one listing | No |
| POST | /api/listings | Create listing | Provider |
| PUT | /api/listings/:id | Update listing | Owner/Admin |
| DELETE | /api/listings/:id | Delete listing | Owner/Admin |

### Bookings
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/bookings | Get my bookings | Yes |
| GET | /api/bookings/:id | Get one booking | Yes |
| POST | /api/bookings | Create booking | Customer |
| PUT | /api/bookings/:id/status | Update status | Yes |

### Ratings
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/ratings/listing/:id | Get listing ratings | No |
| POST | /api/ratings | Submit rating | Yes |

### Payments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/payments | Get my payments | Yes |
| POST | /api/payments | Create payment | Yes |

### Admin
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/admin/stats | Dashboard stats | Admin |
| GET | /api/admin/users | All users | Admin |
| PUT | /api/admin/users/:id | Update user | Admin |
| DELETE | /api/admin/users/:id | Delete user | Admin |

---

## 🧪 Test the API

After starting the server, test it with:
```bash
# Health check
curl http://localhost:3000

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"123456","role":"customer"}'
```
