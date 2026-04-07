# 🎌 CardMyAnime

> 🇫🇷 [Version française](README.md)

<div align="center">
  <img src="public/images/cma-logo.png" alt="CardMyAnime Logo" width="120" height="120">
  
  **Dynamic profile card generator for anime and manga enthusiasts**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.5.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Bun](https://img.shields.io/badge/Bun-1.0-orange?style=for-the-badge&logo=bun)](https://bun.sh/)
  [![Prisma](https://img.shields.io/badge/Prisma-7.1.0-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://docker.com/)
</div>

## 📖 About

**CardMyAnime** is a modern web application that lets you create personalized profile cards from your data on major anime and manga platforms. Create elegant, dynamic cards to visually share your tastes and statistics.

### ✨ Key Features

- 🎨 **7 card types**: Small, Medium, Large, Summary, Neon, Minimal and Glassmorphism
- 🌐 **3 supported platforms**: AniList, MyAnimeList and Nautiljon
- 🖼️ **Custom backgrounds** with the last watched anime
- 📊 **Detailed statistics**: anime watched, manga read, average scores
- 🚀 **Fast generation** with smart caching
- 📱 **Responsive** and modern interface
- 🔒 **GDPR compliant** with data deletion request management
- 📈 **Trends page** with carousel and popular card rankings
- 🛡️ **Full admin panel** with cron job management, logs, statistics and settings
- 🌓 **Light/dark theme** with circular transition animation (View Transitions API)
- 🐳 **Docker deployment** ready to use

## 🎯 Card Types

| Type | Size | Description |
|------|------|-------------|
| **Small** | 400×200 | Avatar + username + 3 last anime |
| **Medium** | 600×300 | Avatar + stats + last anime/manga |
| **Large** | 800×500 | Full profile with images |
| **Summary** | 800×600 | Full profile with detailed stats |
| **Neon** | — | Cyberpunk style with neon effects |
| **Minimal** | — | Clean, minimalist design |
| **Glassmorphism** | — | Modern frosted glass effect |

## 🌐 Supported Platforms

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="public/images/anilist-android-chrome-512x512.png" alt="AniList" width="64" height="64">
        <br><strong>AniList</strong>
        <br><small>Official GraphQL API</small>
      </td>
      <td align="center">
        <img src="public/images/MAL_Favicon_2020.png" alt="MyAnimeList" width="64" height="64">
        <br><strong>MyAnimeList</strong>
        <br><small>Unofficial Jikan API</small>
      </td>
      <td align="center">
        <img src="public/images/nautiljon-logo.jpg" alt="Nautiljon" width="64" height="64">
        <br><strong>Nautiljon</strong>
        <br><small>Public profile scraping</small>
      </td>
    </tr>
  </table>
</div>

## Example

![](https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=small)

## 🚀 Installation and Usage

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- [Docker](https://docker.com/) (optional)
- Database (SQLite or PostgreSQL)

### Quick Install

```bash
# Clone the project
git clone https://github.com/PedroKarim64/cardmyanime.git
cd cardmyanime

# Install dependencies
bun install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Initialize the database
bunx prisma generate
bunx prisma db push

# Start development server
bun dev
```

### 🐳 Docker Deployment

```bash
# Use the deployment script
chmod +x deploy.sh

# Configure environment
./deploy.sh setup

# Build and start
./deploy.sh build
./deploy.sh start

# View logs
./deploy.sh logs
```

## ⚙️ Configuration

### Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"  # SQLite
# or
DATABASE_URL="postgresql://user:password@localhost:5432/cardmyanime"  # PostgreSQL
DIRECT_URL="postgresql://user:password@localhost:5432/cardmyanime"    # For Prisma migrations

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Discord OAuth
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"

# Authorized admin users (comma-separated Discord IDs)
AUTHORIZED_USERS="123456789012345678"

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-site-key"
RECAPTCHA_SECRET_KEY="your-secret-key"

# Cron Scheduler
CRON_SCHEDULER_ENABLED=false       # true in production
CRON_POLL_INTERVAL_MS=30000
CRON_COMMAND_TIMEOUT_MS=120000

# Port
PORT=3000
```

### Database

The project supports multiple databases:

- **SQLite**: Perfect for local development
- **PostgreSQL**: Recommended for production

See the [full documentation](docs/) for more details:
- [Architecture](docs/ARCHITECTURE.en.md) - Services, card generation, providers
- [API](docs/API.en.md) - Complete endpoint reference
- [Database](docs/DATABASE.en.md) - Prisma schema, SQLite/PostgreSQL setup
- [Deployment](docs/DEPLOYMENT.en.md) - Docker, environment variables
- [Authentication](docs/AUTHENTICATION.en.md) - Discord OAuth setup

## 🏗️ Architecture

```
src/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API routes
│   │   ├── auth/                 # NextAuth authentication
│   │   ├── trpc/                 # tRPC API
│   │   ├── admin/                # Admin endpoints
│   │   ├── card/                 # Card generation
│   │   ├── health/               # Health check
│   │   ├── og/                   # Open Graph images
│   │   └── recaptcha/            # reCAPTCHA validation
│   ├── admin/                    # Admin panel
│   │   ├── cron/                 # Cron job management
│   │   ├── logs/                 # View logs
│   │   ├── stats/                # Statistics
│   │   ├── settings/             # Settings
│   │   ├── trends/               # Trends management
│   │   ├── data-deletion/        # GDPR deletion requests
│   │   └── profile/              # User profile
│   ├── ranking/                  # Ranking page
│   ├── tendances/                # Trends page
│   ├── about/                    # About page
│   ├── contact/                  # Contact page
│   ├── terms/                    # Terms of service
│   ├── data-deletion/            # Deletion request (public)
│   └── auth/                     # Authentication pages
├── components/                   # React components
│   ├── ui/                       # UI components (Radix UI)
│   ├── tendances/                # Trends page components
│   ├── CardPreview.tsx           # Card preview
│   ├── Navbar.tsx                # Navigation bar
│   ├── ShareOptions.tsx          # Share options
│   └── ThemeToggle.tsx           # Light/dark toggle
├── lib/                          # Business logic
│   ├── cards/                    # Card generators (7 types)
│   ├── providers/                # Platform integrations (3)
│   ├── services/                 # Services (cache, tracking, cron, settings)
│   ├── trpc/                     # tRPC client/server config
│   └── utils/                    # Utilities (canvas, images, watermark, OG)
├── server/                       # Server configuration
│   └── trpc.ts                   # tRPC routes
└── hooks/                        # React hooks
```

## 🎨 Card Generation

The system uses **Canvas** for server-side card rendering. Each card type has its own dedicated generator with a distinct style.

### 7 Available Types

- **Small**: Compact format with avatar and essential stats
- **Medium**: Balanced format with more details
- **Large**: Extended format with full profile
- **Summary**: Detailed statistics, GitHub Stats style
- **Neon**: Cyberpunk aesthetic with glow effects
- **Minimal**: Clean design, focused on essentials
- **Glassmorphism**: Frosted glass effect with transparencies

## 📊 Advanced Features

### Smart Caching
- User data caching to avoid repeated API calls
- Media data (anime/manga) cache with configurable expiration
- Automatic cleanup of expired data

### View Tracking System
- Total and 24h view counter for each generated card
- Anti-spam protection with fingerprinting and IP tracking
- Detailed logs for administration

### Trends Page
- Carousel of most popular cards
- Dynamic hero banners
- Adult content verification
- Trend snapshots for history

### GDPR Compliance
- Public data deletion request page
- Full admin workflow (pending → processing → completed/rejected)
- Tracking with notes and history

### Admin Panel

The admin panel (`/admin`) offers comprehensive management:

- **Dashboard**: Real-time cache and view statistics
- **Cron Jobs**: Creation, editing, manual execution and automatic scheduling
- **Logs**: Detailed view history with filtering
- **Statistics**: Application usage metrics
- **Settings**: Cache expiration, log retention, maintenance mode, notifications
- **Trends**: Trends management and snapshots
- **Data Deletion**: GDPR request processing

## 🔧 Available Scripts

```bash
# Development
bun dev              # Development server (Turbopack)
bun build            # Production build (Turbopack)
bun start            # Production server
bun run lint         # ESLint linting
bun run test         # Vitest tests
bun run test:watch   # Tests in watch mode

# Database
bunx prisma generate # Generate Prisma client
bunx prisma db push  # Apply schema
bunx prisma studio   # Database admin interface

# Maintenance
bun run reset-views24h      # Reset 24h views
bun run cleanup-view-logs   # Clean view logs
bun run snapshot-trends     # Capture a trends snapshot
bun run populate            # Populate DB with test data
```

### 🔄 Scheduled Jobs (admin)

Cron jobs are managed directly in the admin panel via `/admin/cron` (creation, editing, manual execution, enable/disable).

In production, an internal scheduler runs them automatically based on their `schedule` field.

Notes:

- In development, the internal scheduler is disabled by default (set `CRON_SCHEDULER_ENABLED=true` to test locally).
- If deploying multiple app instances, prefer a single external scheduler (crontab, GitHub Actions, Vercel Cron) to avoid concurrent executions.

## 🐳 Docker

### Simple Deployment

```bash
# Build and start
docker compose up -d

# Logs
docker compose logs -f

# Stop
docker compose down
```

The `docker-compose.yml` includes:
- **PostgreSQL 17** Alpine with health checks
- **Next.js app** with resource limits (512 MB RAM, 0.5 CPUs)
- Persistent volumes for data and logs

### Deployment Script

The `deploy.sh` script provides convenient commands:

```bash
./deploy.sh setup     # Initial setup
./deploy.sh build     # Build image
./deploy.sh start     # Start
./deploy.sh stop      # Stop
./deploy.sh restart   # Restart
./deploy.sh logs      # View logs
./deploy.sh clean     # Cleanup
```

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 4 |
| **UI** | Radix UI, Framer Motion, Lucide Icons |
| **State** | tRPC + React Query, Nuqs (URL state) |
| **Backend** | Next.js API Routes, tRPC |
| **Database** | Prisma 7.1, PostgreSQL 17 / SQLite |
| **Auth** | NextAuth 5 (Discord OAuth) |
| **Security** | reCAPTCHA v2, fingerprinting |
| **Testing** | Vitest |
| **DevOps** | Docker, Bun, Turbopack, ESLint |

## 🤝 Contributing

Contributions are welcome! Here's how to contribute:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**PedroKarim64** - [@PedroKarim64](https://github.com/PedroKarim64)

## 🙏 Acknowledgments

- [AniList](https://anilist.co/) for their GraphQL API
- [MyAnimeList](https://myanimelist.net/) for their platform
- [Nautiljon](https://www.nautiljon.com/) for their community
- [Jikan API](https://jikan.moe/) for MyAnimeList access
- [Next.js](https://nextjs.org/) for the framework
- [Prisma](https://prisma.io/) for the ORM
- [Bun](https://bun.sh/) for the JavaScript runtime

## 📞 Support

- 📧 **Email**: [contact@ascencia.re](mailto:contact@ascencia.re)
- 🐛 **Issues**: [GitHub Issues](https://github.com/PedroKarim64/cardmyanime/issues)
- 💬 **Discord**: [Discord Server](https://discord.gg/ascencia)

---

<div align="center">
  <p>Made with ❤️ by <strong>PedroKarim64</strong></p>
  <p>© 2024-2026 Ascencia - All rights reserved</p>
</div>
