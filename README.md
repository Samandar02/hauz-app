# HAUZ - Personal Account Authentication

Production-grade implementation of the **HAUZ Personal Account Authentication System** using **TypeScript**, **TanStack Router**, **Tailwind CSS**, and **Appwrite** (Auth, Databases/TablesDB, and Functions).

---

## 🏛 Architecture & Data Model

The application strictly implements the provided HAUZ authentication entity relationship model:

```
[Appwrite Auth User ($id)]
          │
          │ (appwrite_user_id)
          ▼
[account_access_grants] ────── (account_id) ──────► [accounts]
  - $id (UUID)                                         - $id (UUID)
  - appwrite_user_id (varchar 36)                     - account_type: individual
  - account_id (relationship)                         - status: active | blocked
  - revoked_at (datetime, nullable)                    - current_access_grant_id (varchar 36)
                                                       - terminated_at (datetime, nullable)
                                                                 │
                                                                 │ (account_id, unique)
                                                                 ▼
[personal_roles] ◄────────────── (role_id) ──────────── [personal_accounts]
  - $id (UUID)                                           - $id (UUID)
  - value: consumer | realtor (unique)                   - account_id (relationship, unique)
                                                         - role_id (relationship)
                                                         - first_name (varchar 100)
                                                         - last_name (varchar 100)
                                                         - contact_phone (varchar 20, E.164)
```

### Key Distinctions
- **Appwrite Auth User**: External identity layer that owns email credentials, verification tokens, and login sessions.
- **HAUZ `accounts`**: The core HAUZ account record (`account_type: 'individual'`, `status: 'active'`).
- **HAUZ `account_access_grants`**: Connects the Appwrite Auth user (`appwrite_user_id`) to the HAUZ Account. Tracks active access and historical revocations via `revoked_at`.
- **HAUZ `personal_accounts`**: Stores personal profile information (`first_name`, `last_name`, `contact_phone`) linked uniquely to the account.
- **HAUZ `personal_roles`**: Pre-seeded lookup table storing `consumer` and `realtor` roles.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- An Appwrite instance (Cloud: [cloud.appwrite.io](https://cloud.appwrite.io) or Self-Hosted)

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Fill in your Appwrite project credentials in `.env`:
```env
# Appwrite API Endpoint
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1

# Your Appwrite Project ID (from Appwrite Console)
VITE_APPWRITE_PROJECT_ID=your_project_id_here

# HAUZ Database & Collection IDs (Default: hauz_db)
VITE_APPWRITE_DATABASE_ID=hauz_db
VITE_APPWRITE_COLLECTION_ROLES_ID=personal_roles
VITE_APPWRITE_COLLECTION_ACCOUNTS_ID=accounts
VITE_APPWRITE_COLLECTION_GRANTS_ID=account_access_grants
VITE_APPWRITE_COLLECTION_PERSONAL_ACCOUNTS_ID=personal_accounts

# Appwrite API Secret Key (Required to run the automated setup script)
# Create in Appwrite Console > Project Settings > View API Keys > Create Secret Key
APPWRITE_API_KEY=your_secret_api_key_here
```

### 4. Database & Schema Setup (Optional)
> **Note**: If your Appwrite project already has the HAUZ database and collections created, **skip this step**.
>
> If you are connecting to a fresh/empty Appwrite project, you can run this automated script to create the database, all 4 collections, attributes, indexes, and seed the `consumer` and `realtor` roles in one command:

```bash
npm run setup:appwrite
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ✨ Features Implemented

### 1. Registration (`/register`)
- Collects:
  - `first_name` (`varchar(100)`, required)
  - `last_name` (`varchar(100)`, required)
  - `email` (valid email format, required)
  - `password` (minimum 8 characters, required)
  - `role` (`consumer` | `realtor`, required)
  - `contact_phone` (`varchar(20)`, optional with E.164 pattern validation)
- Creates Appwrite Auth user and dispatches email verification token.
- Stores registration profile safely in user metadata.

### 2. Email Verification & Atomic HAUZ Provisioning (`/verify`)
- Handles Appwrite verification query parameters (`userId` and `secret`).
- Executes `account.updateVerification(userId, secret)`.
- Upon successful verification, provisions the HAUZ records:
  1. `accounts` record (`status: 'active'`, `account_type: 'individual'`, `current_access_grant_id`)
  2. `account_access_grants` record (`appwrite_user_id`, `account_id`, `revoked_at: null`)
  3. `personal_accounts` profile record linked to the account and role.
- **Rollback Protection**: If any record creation fails, all partial entities created during the transaction are automatically deleted (rolled back).
- **Idempotency**: Prevents duplicate records on repeated requests or re-verification.

### 3. Login & Session Persistence (`/login`)
- Authenticates using email and password.
- Persistent session across page reloads via Appwrite Account SDK.
- Detects unverified email status and prompts with a one-click **"Resend Verification Link"** action.
- Clear error handling for invalid credentials or blocked accounts.

### 4. Authenticated Dashboard (`/dashboard`)
- Protected route: Unauthenticated users are redirected to `/login`.
- Displays real-time breakdown of:
  - Appwrite Auth User identity (`$id`, email, verification status)
  - HAUZ `accounts` details (`$id`, status, current grant pointer)
  - HAUZ `personal_accounts` profile (`first_name`, `last_name`, `contact_phone`)
  - HAUZ `personal_roles` (`consumer` / `realtor`)
  - HAUZ `account_access_grants` history table
  - Collapsible **Raw JSON Document Inspector** for verifying database documents.
- **Logout Action**: Clears the session and redirects to login.

---

## 🛠 Appwrite Cloud Function

A standalone Appwrite Function handler is included under [`functions/create-hauz-account/`](./functions/create-hauz-account/) for optional server-side deployment or event triggering (`users.*.update.verification`).

---

## 📁 Project Structure

```
├── functions/
│   └── create-hauz-account/     # Standalone Appwrite Cloud Function
├── scripts/
│   └── setup-appwrite.ts        # Automated Database & Schema Migration CLI
├── src/
│   ├── context/
│   │   └── AuthContext.tsx      # Auth State & Session Management
│   ├── lib/
│   │   ├── appwrite.ts          # Appwrite SDK client config
│   │   └── hauzService.ts       # HAUZ provisioning, lookup & atomic rollback
│   ├── routes/
│   │   ├── __root.tsx           # Layout, Navigation & Status Bar
│   │   ├── index.tsx            # Overview & Landing Page
│   │   ├── register.tsx         # Registration Form (Consumer / Realtor)
│   │   ├── verify.tsx           # Email Verification & Provisioning Handler
│   │   ├── login.tsx            # Login with Unverified Email Warnings
│   │   └── dashboard.tsx        # Authenticated Page with HAUZ Schema Inspector
│   ├── types/
│   │   └── hauz.ts              # Strict TypeScript interfaces for HAUZ schema
│   ├── main.tsx                 # App entry point
│   ├── router.tsx               # TanStack Router configuration
│   └── styles.css               # Tailwind CSS & Inter typography
├── .env.example                 # Environment variables template
├── package.json
└── tsconfig.json
```

---

## 🛡 Assumptions & Design Decisions
1. **Schema Immutability**: All table names, attributes, data types, constraints, and indexes strictly match the provided assignment ERD.
2. **Personal Roles**: `consumer` and `realtor` are seeded as unique records in `personal_roles` with generated UUIDs and treated as existing reference data.
3. **Rollback & Data Integrity**: When provisioning HAUZ records after verification, a multi-entity transaction is executed with reverse-order rollback on any exception, ensuring no partial or duplicate records remain.
