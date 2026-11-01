# KBN Traders Finova Suite — Mandi Ledger & Produce Billing

A full-stack, enterprise-grade Mandi produce billing, commission agent, and real-time customer ledger suite. Built with **React 19 + Vite** on the frontend and a **Professional Modular Layered Architecture** on the backend with **Express 4 + Sequelize ORM + MySQL** (with resilient in-memory fallback) and dual-token JWT security.

---

## 🏗️ Repository Architecture

The codebase adheres to clean architecture principles with complete separation of concerns:

```
kbntraders/
├── backend/                       # Professional Modular Node/Express API
│   ├── src/
│   │   ├── app.js                 # Express application factory & middleware pipeline
│   │   ├── server.js              # Server entry point, DB connect & graceful shutdown
│   │   ├── config/
│   │   │   ├── env.js             # Validated environment configuration
│   │   │   ├── database.js        # Sequelize ORM & resilient fallback engine
│   │   │   └── swagger.js         # OpenAPI 3.0 specification
│   │   ├── constants/
│   │   │   └── index.js           # HTTP status, User roles, Payment modes, Units
│   │   ├── utils/
│   │   │   ├── slug.js            # Professional slug generator with transliteration
│   │   │   ├── jwt.js             # Dual-token JWT (access in-memory, refresh in cookie)
│   │   │   ├── response.js        # Standardized API response formatters (JSend)
│   │   │   └── logger.js          # Structured console logger with timestamps
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT Bearer token authentication & RBAC guards
│   │   │   ├── errorHandler.js    # Global error handling middleware
│   │   │   └── security.js        # Helmet headers & express rate limiter
│   │   ├── models/
│   │   │   ├── User.js            # User entity & password hash
│   │   │   ├── Customer.js        # Customer entity with unique slug indexing
│   │   │   ├── Variety.js         # Produce variety with unique slug indexing
│   │   │   ├── Invoice.js         # Produce invoice with unique slug indexing
│   │   │   ├── Payment.js         # Payment voucher with unique slug indexing
│   │   │   ├── LedgerEntry.js     # Debit/Credit audit trail & running balance
│   │   │   └── index.js           # Relational associations & model registry
│   │   ├── services/
│   │   │   ├── authService.js     # Authentication & profile business logic
│   │   │   ├── customerService.js # Customer management & slug resolution
│   │   │   ├── varietyService.js  # Produce varieties & slug resolution
│   │   │   ├── invoiceService.js  # Multi-variety invoice & billing calculations
│   │   │   ├── paymentService.js  # Payment vouchers & ledger balance sync
│   │   │   ├── ledgerService.js   # Customer running statements & ledger summary
│   │   │   ├── reportService.js   # Real-time analytics & dashboard aggregations
│   │   │   └── seedService.js     # Out-of-the-box demo data & in-memory store
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── customerController.js
│   │   │   ├── varietyController.js
│   │   │   ├── invoiceController.js
│   │   │   ├── paymentController.js
│   │   │   ├── ledgerController.js
│   │   │   └── reportController.js
│   │   └── routes/
│   │       ├── authRoutes.js
│   │       ├── customerRoutes.js
│   │       ├── varietyRoutes.js
│   │       ├── invoiceRoutes.js
│   │       ├── paymentRoutes.js
│   │       ├── ledgerRoutes.js
│   │       ├── reportRoutes.js
│   │       └── index.js           # Central Router mounted at /api
│   ├── server.js                  # Root delegation entry point
│   ├── nodemon.json               # Nodemon hot-reload configuration
│   ├── package.json               # Backend dependencies
│   ├── .env                       # Active environment variables
│   └── .env.example               # Environment template
│
├── frontend/                      # React 19 + Vite + Tailwind CSS Client
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/              # LoginPage, RegisterPage, Forgot/Reset
│   │   │   ├── billing/           # ProduceInvoiceBuilderModal, PaymentModal
│   │   │   ├── dashboard/         # DashboardView, FinancialOverview, MetricCards
│   │   │   ├── landing/           # Landing page
│   │   │   ├── layout/            # Sidebar, TopHeader, MobileNav
│   │   │   ├── ledgers/           # CustomerLedgerMasterView, CustomerDetailView
│   │   │   ├── ui/                # Button, Input, Modal, Card, Badge
│   │   │   └── views/             # ReportsView, ApiDocsView, SettingsView
│   │   ├── services/api.ts        # Typed Axios client with dual-token interceptors
│   │   ├── store/                 # Zustand state stores
│   │   └── index.css              # Responsive styles & mobile touch optimizations
│   ├── package.json
│   └── vite.config.ts
│
├── package.json                   # Root monorepo orchestrator with npm workspaces
└── README.md
```

---

## ⚡ Quick Start & Development

### 1. From the Root Directory

```bash
# Start Frontend Dev Server (http://localhost:5173)
npm run dev

# Start Backend Dev Server with Nodemon (http://localhost:5000)
npm run backend:dev

# Build Frontend for Production
npm run build
```

### 2. Interactive API Explorer & Docs
* **Swagger UI Documentation**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
* **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🏷️ Professional Slug Design

All core entities in the system support REST-compliant, URL-friendly unique slugs generated using [`slugify`](file:///home/crackrocker/kbntraders/backend/src/utils/slug.js):

| Entity | Example Slug | Endpoint Lookup by Slug or ID |
|---|---|---|
| **Customer** | `tariq-fruit-merchants-delhi` | `GET /api/customers/:idOrSlug` |
| **Produce Variety** | `apple-royal-delicious-a1-100-count-a1` | `GET /api/varieties/:idOrSlug` |
| **Invoice** | `inv-2026-001` | `GET /api/invoices/:idOrSlug` |
| **Payment** | `pay-2026-001` | `GET /api/payments/:idOrSlug` |

---

## 🔐 Demo Credentials

* **Admin Role**: `vintwork@gmail.com` / `Password123!`
* **Cashier Role**: `user@kbntraders.com` / `Password123!`

