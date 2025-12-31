# Notebook

A modern cloud notebook application with GitHub-inspired design.

![React](https://img.shields.io/badge/React-19-blue) ![Vite](https://img.shields.io/badge/Vite-6-purple) ![better-auth](https://img.shields.io/badge/better--auth-1.2-green) ![Bun](https://img.shields.io/badge/Bun-compatible-orange)

## Features

- 🔐 **Secure Authentication** - Powered by better-auth with email/password
- 📝 **Notes Management** - Create, edit, delete, and organize your notes
- 🔗 **Sharing** - Share notes publicly with a link
- 🎨 **GitHub-style UI** - Modern dark theme with Octicons
- 📱 **Responsive** - Works on desktop and mobile
- ⚡ **Fast** - Uses Bun for blazing-fast performance

## Tech Stack

- **Frontend**: React 19, Vite 6, React Router 7
- **Backend**: Express.js 5
- **Database**: MongoDB (native driver)
- **Authentication**: better-auth
- **Icons**: GitHub Octicons

## Quick Start

### Prerequisites

- Node.js 18+ or Bun 1.0+
- MongoDB database (local or Atlas)

### Installation

```bash
# Clone the repository
git clone https://github.com/innovatorved/notebook.git
cd Notebook

# Install dependencies
bun install

# Create environment file
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
```

### Development

```bash
# Start API server
bun run dev          # or: bun run bun:dev

# In another terminal, start frontend
bun run dev:frontend # or: bun run bun:dev:frontend

# Open http://localhost:5173
```

### Production

```bash
# Build frontend
bun run build        # or: bun run bun:build

# Start production server
bun start            # or: bun run bun:start

# Open http://localhost:3000
```

## Scripts

| Task | bun |
|------|-----|
| Dev server | `bun run bun:dev` |
| Dev frontend | `bun run bun:dev:frontend` |
| Build | `bun run bun:build` |
| Production | `bun run bun:start` |
| Export DB | `bun run bun:export-db` |
| Migrate users | `bun run bun:migrate-users` |

## Database Operations

### Export Database (Backup)
```bash
bun run bun:export-db
# Exports all collections to scripts/backups/
```

### Migrate Users (from old JWT system)
```bash
# Always backup first!
bun run bun:export-db
