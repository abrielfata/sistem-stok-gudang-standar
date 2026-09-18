# PRD — Sistem Gudang (WMS Portfolio)

**Versi:** 1.0  
**Tipe:** Portfolio Project  
**Target:** Middle-level developer  
**Durasi:** 4–6 minggu (part-time)  
**Biaya:** $0 (semua free tier)  

---

## 1. Latar Belakang & Tujuan
Sistem Gudang (Warehouse Management System) adalah studi kasus yang kaya domain namun mudah dipahami.
**Tujuan Portfolio:**
1. Membangun aplikasi fullstack dari nol.
2. Menulis kode rapi, modular, dan terstruktur tanpa over-engineering.
3. Menangani logika bisnis nyata (mutasi stok real-time, alokasi FIFO, transaksi ACID).
4. Deploy & demo live yang meyakinkan recruiter/client.

---

## 2. Target Pengguna (Demo Persona)
| Role | Deskripsi | Hak Akses |
|---|---|---|
| **Admin** | Pemilik / Penanggung Jawab Sistem | Akses penuh seluruh fitur |
| **Staff Gudang** | Operator Lapangan | Inbound, Outbound, Cek Stok |

---

## 3. Scope Fungsional

### 3.1 Fitur MVP (Wajib)
- **Auth & User:** Login, JWT (access + refresh), Logout, 2 Role (Admin & Staff), Middleware guard.
- **Master Data:** Barang (SKU, nama, barcode, kategori, satuan, min stock, harga), Kategori, Satuan (UoM), Gudang, Supplier, Customer. Operasi: CRUD + soft delete (`deleted_at`), pagination & search.
- **Inventory:** Stok real-time per barang per gudang, Kartu Stok (histori mutasi), Low stock alert.
- **Inbound (Barang Masuk):** Dokumen Goods Receipt Note (GRN), tambah line items, konfirmasi penerimaan (stok bertambah otomatis), nomor auto `IN-YYYYMM-0001`.
- **Outbound (Barang Keluar):** Dokumen Sales Order (SO), alokasi FIFO otomatis dari stok tertua, konfirmasi pengiriman (stok berkurang otomatis), nomor auto `OUT-YYYYMM-0001`.
- **Dashboard:** Ringkasan KPI (Total SKU, Total Stok, Estimasi Nilai Stok, Inbound/Outbound hari ini), daftar Low Stock, grafik aktivitas 7 hari.
- **Audit Log Sederhana:** Catat aksi CUD (user, aksi, entitas, timestamp).

### 3.2 Out of Scope (Tidak Dikerjakan di v1.0)
- ❌ Microservices, Kubernetes, Docker kompleks
- ❌ Redis, BullMQ, Message Queue, Event Bus terpisah
- ❌ Multi-tenant, batch/expiry, serial number, barcode hardware
- ❌ Transfer antar gudang, adjustment, stock opname (masuk Fase 2)
- ❌ Integrasi ERP/marketplace, notifikasi WA/email

---

## 4. Tech Stack Final
- **Backend:** Node.js, Express, TypeScript
- **ORM:** Drizzle ORM (≥ 0.45.2)
- **Database:** Neon Serverless Postgres (Free tier)
- **Driver DB:** `@neondatabase/serverless` + `drizzle-orm/neon-serverless` (WebSocket mode)
- **Validation:** Zod (Backend & Frontend)
- **Frontend:** React 19, Vite, TypeScript, TanStack Query, Zustand (auth only), Tailwind CSS, shadcn/ui, React Hook Form
- **Logging & Testing:** Pino, Vitest
- **Deploy:** Vercel (FE), Railway/Render (BE)

---

## 5. Aturan Bisnis & Teknis Kunci
1. **Single Gateway Stok:** Modifikasi stok HANYA boleh lewat `inventory.service.ts` -> `adjustStock()`.
2. **Integritas Mutasi:** Setiap perubahan stok wajib mencatat baris di `stock_movements` dalam transaksi yang sama.
3. **Database Transaction:** Semua operasi multi-tabel wajib dibungkus `db.transaction`.
4. **Alokasi Outbound:** Menggunakan strategi FIFO (First In First Out) berbasis riwayat kedatangan stok.
5. **Koneksi Neon:** Aplikasi memakai pooled endpoint (`-pooler`), migrasi Drizzle Kit memakai direct endpoint.
6. **Keamanan Query:** Sort & filter dinamis wajib melalui whitelist kolom (anti SQL injection).
7. **Standar API:** Prefix `/api/v1/`, format respon konsisten `{ success: true, data, meta }` atau `{ success: false, error }`.
