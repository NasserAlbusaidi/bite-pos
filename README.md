# 🍔 Bite POS (Point of Sale)

![Status](https://img.shields.io/badge/Status-Active_Development-orange?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-Row_Level_Policies-green?style=for-the-badge)
![Stack](https://img.shields.io/badge/Tech-Next.js_14_%7C_Supabase_%7C_TypeScript-blue?style=for-the-badge)

**Bite POS** is a cloud-native Point of Sale system designed for multi-location F&B businesses. Unlike standard POS demos, this project implements strict **multi-tenancy** at the database level, ensuring data isolation between different restaurants using PostgreSQL Row Level Security (RLS).

---

### 🏗️ Architecture Highlights

#### 1. Multi-Tenant Data Isolation
Instead of logical software checks, data security is enforced by the database engine.
- **Implementation:** Custom PostgreSQL RLS policies ensuring users can only query data linked to their `restaurant_id`.
- **Auth:** Hybrid authentication system linking Supabase Auth Users (Owners) with PIN-based local auth (Staff).

#### 2. Database Schema (PostgreSQL)
The system relies on relational integrity for complex order flows.
- **Core Entities:** `Restaurant` -> `Menu_Category` -> `Menu_Item`.
- **Order Flow:** Transactional integrity maintained via Foreign Key constraints and `ON DELETE CASCADE` policies.
- **Performance:** Indexed queries on `restaurant_id` and `created_at` for rapid dashboard reporting.

#### 3. Frontend State (React + Context)
- **Global Store:** `RestaurantContext` handles the hydration of tenant settings (Currency, Taxes, Rules) across the application.
- **Optimistic UI:** Next.js App Router for server-side initial data fetching.

---

### 🛠️ Tech Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS.
- **Backend/DB:** Supabase (PostgreSQL), PL/pgSQL Functions.
- **Security:** RLS Policies, UUID Primary Keys.

---

### 🚀 Roadmap
- [x] **Core Schema:** Multi-tenant database design with RLS.
- [x] **Auth System:** Owner vs. Staff role separation.
- [x] **Menu Management:** Category and Item CRUD operations.
- [ ] **Offline Sync:** LocalStorage queue for order processing without internet.
- [ ] **Analytics:** Sales reporting dashboard using PostgreSQL Aggregation.

---

### 📸 Database Schema
*(Visual representation of the SQL migration files)*
`Restaurant` 1:N `UserProfile`
`Restaurant` 1:N `Order`
`Order` 1:N `OrderItem`
