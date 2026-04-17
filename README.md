# ClassEcon - Classroom Economy Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

A comprehensive classroom economy management system that helps teachers create engaging, gamified learning environments where students earn virtual currency, manage jobs, and learn financial literacy concepts.

![ClassEcon Dashboard](docs/images/dashboard-preview.png)

---

## 🌟 Features

- 👥 **Multi-Role Support** - Teachers, Students, and Parents with role-based permissions
- 💼 **Job System** - Create jobs, manage applications, and automate payroll
- 🏪 **Virtual Store** - Customizable store with inventory management
- 💰 **Complete Financial Tracking** - Transactions, balances, and reporting
- 📋 **Pay Request Workflow** - Student work submission and approval system
- 🎒 **Backpack & Redemption** - Virtual inventory with real-world redemption
- 🔔 **Real-time Notifications** - WebSocket-based instant updates
- 🔐 **Modern Authentication** - OAuth 2.0 (Google, Microsoft) + traditional login
- 🎨 **Beautiful UI** - Responsive design with dark mode support
- 📊 **Analytics & Reports** - Comprehensive dashboards and exports

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- MongoDB (local or Docker)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/andrewdangelo/ClassEcon.git
cd ClassEcon

# Install dependencies
cd Backend && pnpm install
cd ../Frontend && pnpm install
cd ../AuthService && pnpm install
```

### Setup Environment

Copy `.env.example` to `.env` in each service directory and configure:

```bash
# Backend
cp Backend/.env.example Backend/.env

# AuthService
cp AuthService/.env.example AuthService/.env

# Frontend
cp Frontend/.env.example Frontend/.env
```

Edit the `.env` files with your configuration.

### Run the Application

```bash
# Terminal 1 - Auth Service
cd AuthService && pnpm run dev

# Terminal 2 - Backend
cd Backend && pnpm run dev

# Terminal 3 - Frontend
cd Frontend && pnpm run dev
```

**Access the app:** http://localhost:5173

---

## 📚 Documentation

### 📖 Main Documentation

**[Complete Developer Documentation](DEVELOPER_DOCUMENTATION.md)** - Comprehensive guide covering all aspects of the platform

### 🔐 Authentication

- **[OAuth Setup Guide](docs/authentication/OAUTH_SETUP_GUIDE.md)** - Configure Google and Microsoft OAuth
- **[OAuth Quick Start](docs/authentication/OAUTH_QUICK_START.md)** - Quick testing guide
- **[OAuth Implementation](docs/authentication/OAUTH_IMPLEMENTATION_SUMMARY.md)** - Technical details
- **[Auth Architecture](docs/authentication/AUTH_ARCHITECTURE.md)** - System design
- **[Auth Microservice Migration](docs/authentication/AUTH_MICROSERVICE_MIGRATION.md)** - Migration guide
- **[Auth Testing Guide](docs/authentication/AUTH_TESTING_GUIDE.md)** - Testing procedures
- **[Auth Quick Reference](docs/authentication/AUTH_QUICK_REFERENCE.md)** - API reference

### 🎯 Features

- **[Activity System](docs/features/ACTIVITY_SYSTEM_GUIDE.md)** - ⭐ NEW! Student transaction tracking with charts and filtering
- **[Job System](docs/features/JOB_SYSTEM_SUMMARY.md)** - Job management overview
- **[Job Quick Start](docs/features/JOB_SYSTEM_QUICK_START.md)** - Setup guide
- **[Backpack Implementation](docs/features/BACKPACK_IMPLEMENTATION_GUIDE.md)** - Virtual inventory
- **[Backpack Frontend](docs/features/BACKPACK_FRONTEND_SUMMARY.md)** - UI components
- **[Redemption System](docs/features/REDEMPTION_SYSTEM_IMPROVEMENTS.md)** - Redemption workflow
- **[Notification System](docs/features/NOTIFICATION_FIX_SUMMARY.md)** - Real-time notifications
- **[Teacher Dashboard](docs/features/TEACHER_DASHBOARD_GUIDE.md)** - Teacher features
- **[Student Detail](docs/features/STUDENT_DETAIL_SUMMARY.md)** - Student views
- **[Dashboard Enhancements](docs/features/DASHBOARD_ENHANCEMENTS.md)** - UI improvements

### 📖 Guides

- **[Testing Guide](docs/guides/TESTING_GUIDE.md)** - Testing procedures
- **[Notification Debug](docs/guides/NOTIFICATION_DEBUG_GUIDE.md)** - Troubleshooting
- **[Onboarding Redesign](docs/guides/ONBOARDING_REDESIGN_SUMMARY.md)** - User onboarding

### 🔧 Fixes & Maintenance

- **[Purchase & Payment Fixes](docs/fixes/PURCHASE_AND_PAYMENT_FIXES.md)**
- **[Enum Format Fix](docs/fixes/ENUM_FORMAT_FIX.md)**
- **[Null StoreItem Fix](docs/fixes/NULL_STOREITEM_FIX.md)**
- **[ItemId Compatibility](docs/fixes/ITEMID_COMPATIBILITY_FIX.md)**
- **[Backpack Redemption UI Fixes](docs/fixes/BACKPACK_REDEMPTION_UI_FIXES.md)**
- **[Theme Notification](docs/fixes/THEME_NOTIFICATION_SUMMARY.md)**

### 📣 Marketing

- **[Landing Page Guide](docs/marketing/LANDING_PAGE_GUIDE.md)** - ⭐ NEW! Complete marketing website with waitlist

### 🏗️ Architecture

- **[Architecture Diagrams](ARCHITECTURE_DIAGRAMS.md)** - System architecture and flows
- **[Auth Refactor Summary](docs/authentication/AUTH_REFACTOR_SUMMARY.md)** - Migration details

### 📋 Other

- **[Change Log](docs/CHANGES_SUMMARY.md)** - Version history
- **[Session 2 Summary](docs/SESSION_2_SUMMARY.md)** - Development notes
- **[TODO](TODO.md)** - Planned features

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            ClassEcon Platform                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────┐        ┌──────────────┐        ┌──────────────┐       │
│  │  Frontend   │───────▶│   Backend    │───────▶│ Auth Service │       │
│  │  (React)    │◀───────│  (GraphQL)   │◀───────│  (Express)   │       │
│  │  Port 5173  │        │  Port 4000   │        │  Port 4001   │       │
│  └─────────────┘        └──────────────┘        └──────────────┘       │
│         │                       │                        │               │
│         ▼                       ▼                        ▼               │
│  ┌─────────────┐        ┌──────────────┐        ┌──────────────┐       │
│  │   Redux +   │        │   MongoDB    │        │ JWT + OAuth  │       │
│  │   Apollo    │        │  Database    │        │   bcrypt     │       │
│  └─────────────┘        └──────────────┘        └──────────────┘       │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- Apollo Client (GraphQL)
- Redux Toolkit
- Tailwind CSS + shadcn/ui
- React Hook Form

**Backend:**
- Node.js + Express
- GraphQL (Apollo Server)
- MongoDB + Mongoose
- WebSocket subscriptions

**Auth Service:**
- Express microservice
- JWT (jsonwebtoken)
- bcrypt
- OAuth 2.0 (Google, Microsoft)

---

## 🎓 User Roles

### Teachers
- Create and manage classes
- Create jobs and approve applications
- Manage virtual store
- Approve pay requests
- Process redemptions
- View analytics and reports

### Students
- Join classes with join code
- Apply for jobs
- Submit pay requests
- Purchase items from store
- Request redemptions
- Track balance and transactions

### Parents
- View child's progress
- Monitor financial activity
- Limited read-only access

---

## 🔒 Security

- JWT-based authentication with refresh tokens
- OAuth 2.0 integration (Google, Microsoft)
- Service-to-service API key authentication
- HTTP-only cookies for refresh tokens
- Role-based access control
- Input validation and sanitization
- Rate limiting (production)
- HTTPS enforcement (production)

---

## 🧪 Testing

```bash
# Contract tests
node --test assessment/tests/*.mjs

# E2E tests (assessment harness)
cd assessment
cp .env.e2e.example .env.e2e
pnpm install
pnpm run test:e2e:api
pnpm run test:e2e
```

See [Testing Guide](docs/guides/TESTING_GUIDE.md) for comprehensive testing documentation.

---

## 🐳 Docker

```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 📦 Project Structure

```
ClassEcon/
├── Frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── graphql/       # GraphQL operations
│   │   ├── modules/       # Feature modules
│   │   ├── redux/         # Redux store
│   │   └── lib/           # Utilities
│   └── package.json
│
├── Backend/               # GraphQL backend server
│   ├── src/
│   │   ├── models/        # Mongoose models
│   │   ├── resolvers/     # GraphQL resolvers
│   │   ├── services/      # Business logic
│   │   └── schema.ts      # GraphQL schema
│   └── package.json
│
├── AuthService/           # Authentication microservice
│   ├── src/
│   │   ├── auth.ts        # JWT & bcrypt
│   │   ├── oauth.ts       # OAuth 2.0
│   │   └── routes.ts      # Express routes
│   └── package.json
│
├── docs/                  # Documentation
│   ├── authentication/    # Auth documentation
│   ├── features/          # Feature guides
│   ├── guides/            # How-to guides
│   └── fixes/             # Bug fix notes
│
├── DEVELOPER_DOCUMENTATION.md  # Complete dev guide
└── README.md              # This file
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](DEVELOPER_DOCUMENTATION.md#contributing) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier configurations
- Write meaningful commit messages
- Add tests for new features
- Update documentation

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Powered by [GraphQL](https://graphql.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/andrewdangelo/ClassEcon/issues)
- **Discussions:** [GitHub Discussions](https://github.com/andrewdangelo/ClassEcon/discussions)
- **Email:** support@classecon.com

---

## 🗺️ Roadmap

### Version 2.1 (Q4 2025)
- [ ] Parent dashboard and notifications
- [ ] Advanced analytics and charts
- [ ] Export to CSV/PDF
- [ ] Email notifications
- [ ] Mobile app (React Native)

### Version 3.0 (Q1 2026)
- [ ] Multi-classroom support
- [ ] School-wide leaderboards
- [ ] Customizable themes
- [ ] Plugin system
- [ ] API for third-party integrations

See [TODO.md](TODO.md) for complete feature list.

---

## 📊 Statistics

- **Lines of Code:** ~50,000+
- **Components:** 100+
- **GraphQL Operations:** 50+
- **Database Models:** 15+
- **Documentation Pages:** 30+

---

## 🌐 Demo

**Live Demo:** [demo.classecon.com](https://demo.classecon.com)

**Test Credentials:**
- Teacher: `teacher@demo.com` / `password123`
- Student: `student@demo.com` / `password123`

---

**Made with ❤️ by the ClassEcon Team**

**Star ⭐ this repo if you find it useful!**
