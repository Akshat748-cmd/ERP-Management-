# AMPS School Portal / ERP Management System

A multi-tenant SaaS School Portal built with React 19, TypeScript, Vite, Tailwind CSS, Python 3, FastAPI, and SQLAlchemy.

---

## 📁 Repository Structure

```
ERP-Management--main/
├── backend/                       # 🐍 Python FastAPI Backend
│   ├── routes/                    # API route handlers (tenants, etc.)
│   ├── database.py                # Database connection & SQLAlchemy Base
│   ├── main.py                    # Main FastAPI application entry point
│   ├── models.py                  # SQLAlchemy Database Models (User, Tenant, Audits)
│   ├── provisioning.py            # User provisioning logic for 7 school roles
│   ├── security.py                # JWT authentication & password hashing
│   ├── seed.py                    # Demo database seeder
│   ├── reset_default_passwords.py # Password reset utility script
│   └── requirements.txt           # Python backend dependencies
│
├── frontend/                      # ⚛️ React 19 Frontend App
│   ├── public/                    # Static public assets (logos, icons)
│   ├── src/                       # React TypeScript source code
│   │   ├── config/                # Permissions matrix & theme system
│   │   ├── context/               # AuthContext & TenantContext providers
│   │   ├── layouts/               # Portal layout & role dashboard shells
│   │   ├── modules/               # Feature pages (students, fees, results, etc.)
│   │   ├── routes/                # Route definitions & PermissionGuard
│   │   ├── services/              # API Client & endpoint definitions
│   │   ├── types/                 # TypeScript interfaces (Auth, Tenant, Entities)
│   │   ├── App.tsx                # React app root component
│   │   └── main.tsx               # DOM entry point
│   ├── index.html                 # Frontend HTML entry point
│   ├── package.json               # Frontend dependencies & npm scripts
│   ├── vite.config.ts             # Vite configuration & path aliases
│   ├── tsconfig.json              # TypeScript root configuration
│   └── tailwind.config.js         # Tailwind CSS styling configuration
│
└── package.json                   # 🚀 Root Monorepo Orchestration Scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+
- **Python**: v3.10+

### 2. Running Locally

From the project root:

```bash
# Start both Backend (FastAPI on port 8000) and Frontend (Vite) concurrently
npm run dev
```

Or run frontend / backend independently:

```bash
# Start backend server only
npm run dev:backend

# Start frontend dev server only
npm run dev:frontend
```

---

## 🛠️ Building & Linting

```bash
# Build frontend TypeScript and Vite bundle
npm run build

# Lint frontend codebase
npm run lint
```

---

## 📊 Demo Data Seeding

To populate realistic demo data (Students, Teachers, Attendance, Homework, Examination Results, and Fee Records) for an existing tenant school using Indian locale (`en_IN`):

```bash
# Seed demo data for default/first tenant
python backend/seed_demo_data.py

# Or specify a school ID slug explicitly:
python backend/seed_demo_data.py --school-id amps-sr-sec-01
```

