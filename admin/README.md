# ClassEcon Admin Dashboard

A React-based admin dashboard for managing the ClassEcon platform. Built with React, GraphQL, Radix UI, and TailwindCSS.

## Features

- 📊 **Dashboard Overview** - Platform statistics and health monitoring
- 👥 **User Management** - View and manage all platform users
- 🏫 **Class Management** - Create, edit, archive, and delete classes
- 🔑 **Beta Access Codes** - Create and manage beta access codes
- 💳 **Subscriptions** - View subscription plans and user subscriptions
- 💰 **Transactions** - Monitor student balances and transactions
- ⚙️ **Settings** - Configure admin preferences

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Apollo Client** - GraphQL client
- **Radix UI** - Headless UI components
- **TailwindCSS** - Styling
- **React Router** - Routing
- **Lucide Icons** - Icons

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Backend server running at `http://localhost:4000`

### Installation

```bash
# Navigate to admin directory
cd admin

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Start development server
pnpm dev
```

The admin dashboard will be available at `http://localhost:5175`.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_GRAPHQL_URL` | Backend GraphQL endpoint | `http://localhost:4000/graphql` |

## Authentication

The admin dashboard uses the same authentication system as the main frontend. Only users with the `TEACHER` role can access the admin dashboard.

To login:
1. Use your existing teacher account credentials
2. The dashboard will authenticate via the Backend's GraphQL API
3. JWT tokens are stored in localStorage and cookies

## Project Structure

```
admin/
├── src/
│   ├── components/
│   │   ├── layout/        # Layout components (sidebar, header)
│   │   └── ui/            # Radix UI components
│   ├── contexts/          # React contexts (Auth)
│   ├── graphql/           # GraphQL queries and mutations
│   ├── lib/               # Utilities (Apollo client, helpers)
│   └── pages/             # Page components
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Available Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard overview with stats |
| `/users` | User management with search/filter |
| `/classes` | Class management |
| `/beta-codes` | Beta access code management |
| `/subscriptions` | Subscription plans viewer |
| `/transactions` | Transaction monitoring |
| `/settings` | Admin settings |
| `/login` | Login page |

## Connecting to Backend

The admin dashboard connects to the existing ClassEcon Backend service. Make sure the Backend is running before starting the admin dashboard.

```bash
# Start Backend (from Backend directory)
cd Backend
pnpm dev

# Start Admin Dashboard (from admin directory)
cd admin
pnpm dev
```

## Building for Production

```bash
# Build the app
pnpm build

# Preview production build
pnpm preview
```

## Docker Deployment

```bash
# Build Docker image
docker build -t classecon-admin .

# Run container
docker run -p 80:80 -e VITE_GRAPHQL_URL=https://api.classecon.com/graphql classecon-admin
```

## Railway Deployment

The `railway.toml` file is configured for Railway deployment. Simply connect your repository to Railway and deploy.

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Follow the component patterns in `src/components/ui/`
4. Test changes locally before committing

## License

MIT
