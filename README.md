# ServiKo – Angular CLI (v17)
**Advanced Dynamic Web Development (6AWEB) · March 2026**

| Name | Role |
|---|---|
| Cunanan, Lienne Sebastian | Project Manager / Full-Stack |
| Dizon, Maverick Vince | Front-End Developer |
| Escoto, Jorel | Back-End Developer |
| Lacson, Rheiniel Fred | QA / Full-Stack |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
ng serve

# 3. Open browser
# http://localhost:4200
```

**Demo credentials**
| Role  | Email                | Password  |
|-------|----------------------|-----------|
| Admin | admin@serviko.ph     | admin123  |
| User  | user@serviko.ph      | user123   |

---

## Project Structure

```
src/
├── main.ts                         ← Bootstrap
├── index.html                      ← Shell HTML
├── styles.css                      ← Global styles & CSS variables
├── environments/
│   ├── environment.ts              ← Dev config
│   └── environment.prod.ts         ← Prod config
└── app/
    ├── app.component.ts            ← Root component (navbar + router-outlet + footer)
    ├── app.config.ts               ← provideRouter, provideAnimations
    ├── app.routes.ts               ← Lazy-loaded routes with guards
    │
    ├── core/
    │   ├── models/
    │   │   ├── provider.model.ts   ← Provider, ServiceItem interfaces
    │   │   ├── booking.model.ts    ← Booking, BookingForm interfaces
    │   │   └── user.model.ts       ← User, Review interfaces
    │   ├── services/
    │   │   ├── auth.service.ts     ← Signal-based auth (login/logout/register)
    │   │   ├── provider.service.ts ← Provider data store with signals
    │   │   └── booking.service.ts  ← Active booking state & city/service lists
    │   └── guards/
    │       └── auth.guard.ts       ← authGuard + adminGuard (CanActivateFn)
    │
    ├── shared/
    │   └── components/
    │       ├── navbar/             ← NavbarComponent (.ts .html .css)
    │       └── footer/             ← FooterComponent (.ts inline template)
    │
    └── pages/
        ├── home/                   ← HomeComponent
        ├── login/                  ← LoginComponent
        ├── register/               ← RegisterComponent
        ├── listings/               ← ListingsComponent (filter + search + sort)
        ├── provider-profile/       ← ProviderProfileComponent (tabs)
        ├── booking/                ← BookingComponent (4-step wizard)
        ├── payment/                ← PaymentComponent (GCash/Maya/Bank/Cash)
        ├── bookings/               ← BookingsComponent (dashboard + rating modal)
        ├── ratings/                ← RatingsComponent (community reviews)
        └── admin/                  ← AdminComponent (5-tab admin panel)
```

---

## Key Angular 17 Features Used

| Feature | Where |
|---|---|
| **Standalone components** | All components (`standalone: true`) |
| **Signals** (`signal`, `computed`) | AuthService, ProviderService, BookingService, all page components |
| **Lazy loading** | All routes via `loadComponent()` |
| **Route Guards** | `authGuard`, `adminGuard` using `CanActivateFn` |
| **`provideRouter`** | `app.config.ts` (no NgModule) |
| **`ngModel` (FormsModule)** | All form pages |
| **`*ngFor` / `*ngIf`** | All templates |
| **`[ngClass]`** | Badge helpers, active states |
| **`RouterLink` / `RouterLinkActive`** | Navbar |

---

## Pages & Routes

| Route | Component | Guard |
|---|---|---|
| `/` | HomeComponent | — |
| `/login` | LoginComponent | — |
| `/register` | RegisterComponent | — |
| `/listings` | ListingsComponent | — |
| `/provider-profile` | ProviderProfileComponent | — |
| `/booking` | BookingComponent | authGuard |
| `/payment` | PaymentComponent | authGuard |
| `/bookings` | BookingsComponent | authGuard |
| `/ratings` | RatingsComponent | — |
| `/admin` | AdminComponent | authGuard + adminGuard |
"# serviko" 
