# Bite POS

A streamlined, browser-based Point of Sale system for restaurants.

![Bite POS](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)

## Features

- 🔐 **Owner Login** - Email/password authentication
- 🔢 **Staff PIN Login** - Quick 4-digit PIN entry
- 📊 **Dashboard** - Sales stats and recent orders
- 🍔 **Menu Management** - Categories, items, and images
- 👥 **Staff Management** - Create staff with PINs
- 💳 **POS Terminal** - Touch-friendly order taking
- 📋 **Order History** - Search and filter orders
- ⚙️ **Settings** - Restaurant profile and currency

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account

### Installation

```bash
# Clone and install
cd bite-pos
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations
# Copy supabase/migrations/000_clean_reset.sql to Supabase SQL Editor

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Icons:** Lucide React

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login pages
│   ├── dashboard/       # Admin pages
│   ├── pos/             # POS terminal
│   └── globals.css      # Design system
├── context/             # React contexts
├── lib/                 # Utilities
└── types/               # TypeScript types
```

## Default Credentials

- **Demo Staff PIN:** `1234`

## License

MIT
