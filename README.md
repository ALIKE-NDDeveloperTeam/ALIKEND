# ALIKE ND

ALIKE ND is an ultra-luxury multi-vendor e-commerce marketplace and trade portal. Engineered with a bespoke high-fashion aesthetic, the platform connects discerning clientele with verified artisans and luxury ateliers. It features full-stack inventory management, real-time checkout and orders processing, dedicated seller portals, a Super Admin command center, and an internal commission wallet with ledger tracking and balance withdrawal disbursements.

---

## Features

- **Luxury Storefront & Curated Catalog**: Dynamic category filtering, flash luxury drops, real-time search, high-resolution product showcase, and responsive mobile-first UI.
- **Client Cart & Checkout Experience**: Streamlined checkout workflow with instant order number generation and client invoice records.
- **Seller & Atelier Portal**: Direct seller registration, catalog management, real-time sales visibility, and automated payout calculations.
- **Admin & Super Admin Command Center**: Role-based access control (RBAC), hero banner management, sales and revenue analytics, audit activity logging, and staff management.
- **Platform Commission & Wallet**: Configurable global commission rate, lifetime revenue tracking, and internal Platform Wallet Balance with withdrawal logging.
- **Dual Persistence Architecture**: Production-ready MongoDB integration with automatic in-memory fallback for high availability.

---

## Getting Started

### Prerequisites

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher
- **MongoDB** (Optional for local testing; persistent cloud cluster recommended for production)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/alike-nd.git
   cd alike-nd
   ```

2. Install project dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the development server:

```bash
npm run dev
```

The application runs as a full-stack Express and Vite service accessible at:
```
http://localhost:3000
```

### Production Build

To compile both client-side static assets and the server bundle:

```bash
npm run build
npm start
```

---

## Environment Variables

Configuration is loaded via environment variables. See `.env.example` for all supported configuration options:

| Variable | Description | Required |
| :--- | :--- | :--- |
| `MONGO_URI` | MongoDB Atlas / database connection string | Yes |
| `JWT_SECRET` | Secret key used for signing administrative and user JWT tokens | Yes |
| `INITIAL_ADMIN_PASSWORD` | Optional initial seed password for the default Super Admin account | No |
| `GMAIL_USER` | Gmail address for SMTP notification dispatch | Optional |
| `GMAIL_APP_PASSWORD` | Gmail App Password for SMTP authentication | Optional |

To configure your local environment, copy `.env.example` to `.env` and provide your credentials:

```bash
cp .env.example .env
```

---

## Tech Stack

### Frontend
- **React 18**: Component architecture with hooks and state management
- **TypeScript**: Complete static type-safety across client models and APIs
- **Tailwind CSS**: Custom styling, dark/light luxury theme palette, responsive layouts
- **Lucide React**: Vector iconography
- **Framer Motion**: Smooth entry and modal transitions

### Backend
- **Node.js & Express**: High-performance HTTP REST API
- **TypeScript & tsx**: Server execution and build-time bundling
- **JWT & bcrypt**: Cryptographic token issuance and secure password hashing
- **Mongoose / MongoDB**: Document schema validation, indexing, and persistent database storage

---

## License

All rights reserved. Proprietary and confidential.
