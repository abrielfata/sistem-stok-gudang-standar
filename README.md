# Sistem Gudang (WMS) — Portfolio Project

[![CI Pipeline](https://github.com/abrielfata/sistem-stok-gudang-standar/actions/workflows/ci.yml/badge.svg)](https://github.com/abrielfata/sistem-stok-gudang-standar/actions/workflows/ci.yml)
![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-0.45.2-orange)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8)
![Vitest](https://img.shields.io/badge/Tests-15%20Passed-brightgreen)

Sistem manajemen gudang (Warehouse Management System) modern, scalable, dan type-safe untuk mengelola pelacakan stok secara real-time, penerimaan barang (Inbound / GRN), dan pengeluaran barang (Outbound / SO) dengan alokasi FIFO.

## 🚀 Live Demo
- **Akun Demo:**
  - **Admin:** `admin@demo.com` / `admin123`
  - **Staff:** `staff@demo.com` / `staff123`

---

## 📦 Fitur Utama

- **Autentikasi & RBAC:** Login dengan JWT access token (15m) + refresh token (7d) rotation, proteksi brute force rate limiting, dan role checking (`ADMIN` & `STAFF`).
- **Master Data Lengkap:** Manajemen Barang (SKU, harga modal, harga jual, min stock), Kategori, Satuan (UoM), Gudang, Supplier, dan Customer dengan *soft delete* & *dynamic sorting whitelist*.
- **Core Inventory Engine:**
  - `adjustStock()` sebagai **satu-satunya pintu transaksi mutasi stok** dengan database row locking (`FOR UPDATE`) untuk mencegah *race conditions*.
  - Anti-negative stock policy.
  - Kartu Stok kronologis dari mutasi `stock_movements`.
  - Alert produk dengan *Low Stock*.
- **Inbound (GRN):** Flow Goods Receipt Note (`DRAFT` → `CONFIRMED` / `CANCELLED`), generate otomatis nomor dokumen `IN-YYYYMM-XXXX`, dan mutasi stok otomatis dalam satu transaksi DB.
- **Outbound (SO) & FIFO:** Flow Sales Order (`DRAFT` → `CONFIRMED` / `CANCELLED`), generate otomatis nomor dokumen `OUT-YYYYMM-XXXX`, dan alokasi stok FIFO.
- **Dashboard & Analitik:** 5 KPI cards (Total SKU, Total Stok, Nilai Valuasi Stok, Inbound Hari Ini, Outbound Hari Ini), dan grafik aktivitas mutasi stok 7 hari terakhir.
- **Audit Logging:** Pencatatan otomatis setiap aksi CUD di sistem untuk transparansi audit.

---

## 📸 Screenshots

| Fitur | Preview |
|---|---|
| **Login Page** | ![Login](docs/screenshots/01-login.png) |
| **Dashboard** | ![Dashboard](docs/screenshots/02-dashboard.png) |
| **Master Barang** | ![Master Barang](docs/screenshots/03-products.png) |
| **Inbound (GRN)** | ![Inbound](docs/screenshots/04-inbound.png) |
| **Outbound (SO)** | ![Outbound](docs/screenshots/05-outbound.png) |
| **Kartu Stok** | ![Kartu Stok](docs/screenshots/06-kartu-stok.png) |

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express, TypeScript, Drizzle ORM (≥ 0.45.2), Neon Serverless Postgres (WebSocket Driver)
- **Logging & Security:** Pino, Helmet, CORS, Express Rate Limit, Zod validation
- **Testing:** Vitest
- **Frontend:** React, Vite, TypeScript, TanStack Query, Zustand, React Hook Form, Zod
- **UI & Styling:** TailwindCSS, shadcn/ui, Lucide Icons, Recharts

---

## ⚙️ Cara Menjalankan Secara Lokal

### 1. Prasyarat
- Node.js ≥ 18.x
- Database Neon Postgres (atau PostgreSQL lokal)

### 2. Setup Backend
```bash
cd backend
npm install

# Setup file Environment
cp .env.example .env
# Sesuaikan DATABASE_URL dan JWT_SECRET di file .env

# Push schema ke database
npm run db:push

# Isi database dengan data awal (seed)
npx tsx src/db/seed.ts

# Jalankan server development
npm run dev
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Menjalankan Unit Tests
```bash
cd backend
npm run test
```
