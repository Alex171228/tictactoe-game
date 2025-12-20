# Крестики-Нолики с Telegram

## Overview

A Tic-Tac-Toe web game with Telegram authentication. Players can log in via Telegram, play against an AI opponent using minimax algorithm, and receive promo codes when they win. The game features an elegant pastel design with animated cat mascot reactions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom development and production configurations
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Context for auth state, local component state for game logic
- **Data Fetching**: TanStack React Query for API communication
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom pastel theme (pink/beige color palette)

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Server**: HTTP server with conditional Vite dev server in development
- **API Design**: RESTful endpoints under `/api` prefix
- **Build Output**: esbuild bundles server to `dist/index.cjs` for production

### Key Design Patterns
- **Separation of Concerns**: Client code in `client/`, server in `server/`, shared types in `shared/`
- **Type Safety**: Zod schemas in `shared/schema.ts` for runtime validation and TypeScript type inference
- **Game Logic**: Minimax algorithm with alpha-beta pruning for unbeatable AI opponent
- **Authentication Flow**: Telegram Login Widget callback stores user in localStorage, verified on client side

### Directory Structure
```
client/src/
├── components/     # React components (game/, layout/, auth/, ui/)
├── hooks/          # Custom React hooks
├── lib/            # Utilities (auth-context, game-logic, queryClient)
├── pages/          # Route page components
server/
├── index.ts        # Express server entry point
├── routes.ts       # API route definitions
├── static.ts       # Production static file serving
├── vite.ts         # Development Vite integration
shared/
├── schema.ts       # Zod schemas and TypeScript types
```

## External Dependencies

### Database
- **PostgreSQL**: Configured via Drizzle ORM with `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migrations in `migrations/` directory
- **Note**: Schema currently minimal; database may be used for future game stats persistence

### Telegram Integration
- **Bot Token**: `TELEGRAM_BOT_TOKEN` environment variable for sending messages
- **Chat ID**: `TELEGRAM_CHAT_ID` for admin notifications
- **Login Widget**: `VITE_TELEGRAM_BOT_USERNAME` for client-side auth widget
- **Purpose**: Authentication via Telegram Login Widget, promo code delivery via bot messages

### Key NPM Packages
- `express` - HTTP server
- `drizzle-orm` / `drizzle-zod` - Database ORM and validation
- `@tanstack/react-query` - Data fetching
- `wouter` - Routing
- `zod` - Schema validation
- `@radix-ui/*` - UI primitives
- `tailwindcss` - Styling