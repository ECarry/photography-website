# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

```bash
bun dev              # Start Next.js dev server with Turbopack
bun build            # Build for production
bun start            # Start production server
bun lint             # Run ESLint
```

### Database

```bash
bun db:generate      # Generate Drizzle migrations
bun db:migrate       # Run database migrations
bun db:studio        # Open Drizzle Studio (database GUI)
```

### User Management

```bash
bun seed:user        # Create initial admin user (uses .env vars or defaults)
```

## Project Architecture

### Tech Stack

- **Framework:** Next.js 15 with App Router (using route groups)
- **Database:** Neon (Serverless Postgres) with Drizzle ORM
- **API:** tRPC for type-safe API calls
- **Auth:** Better Auth with email/password
- **Storage:** Cloudflare R2 (S3-compatible) for photo storage
- **UI:** Shadcn/ui components with Tailwind CSS
- **Maps:** Mapbox for location features

### Module-Based Architecture

The codebase follows a **module-based architecture** where each feature is organized in `src/modules/`. Each module contains:

- `server/procedures.ts` - tRPC router definitions
- `ui/` - React components (views, sections, forms)
- `lib/` - Module-specific utilities (if needed)

**Modules:**

- `photos` - Photo management (CRUD, EXIF data, favorites)
- `posts` - Blog post management with TipTap rich text editor
- `travel` - Travel/location-based photo organization
- `discover` - Map-based photo discovery
- `dashboard` - Admin dashboard with analytics
- `cloudflare` - R2 upload presigned URL generation
- `auth` - Authentication setup

### Route Groups (App Router)

Next.js route groups organize the application into three main layouts:

1. `(home)/` - Public-facing pages (home, travel, discover, about)
2. `(dashboard)/` - Admin area (photos, posts, city management, profile)
3. `(auth)/` - Authentication pages (sign-in, sign-up)
4. `(photograph)/` - Individual photo detail pages
5. `/screensaver` - Fullscreen photo slideshow

### tRPC Setup

- **Router definition:** `src/trpc/routers/_app.ts` - combines all module routers
- **Procedures:** Each module defines its tRPC procedures in `server/procedures.ts`
- **Context:** `src/trpc/init.ts` - creates context with session/userId
- **Client:** `src/trpc/client.ts` - React Query integration
- **Endpoint:** `/api/trpc/[trpc]/route.ts`

Two procedure types:

- `baseProcedure` - public endpoints
- `protectedProcedure` - requires authentication

### Database Schema

Schema located in `src/db/schema/`:

- `photos.ts` - Photos table with EXIF metadata, geo data, and citySets table
- `posts.ts` - Blog posts with rich text content
- `users.ts` - Better Auth managed user tables

Key patterns:

- Relations defined using `drizzle-orm/relations`
- Zod schemas auto-generated with `drizzle-zod`
- Reusable `timestamps` object for created/updated fields
- `citySets` table aggregates photos by location with automatic photo counting

### Photo Upload Flow

1. Client requests presigned URL via `cloudflare.createPresignedUrl` (tRPC)
2. Client uploads directly to R2 using presigned URL with progress tracking (`src/lib/cloudflare-r2.ts`)
3. Client submits photo metadata via `photos.create` (tRPC)
4. Server stores metadata in database and updates `citySets` aggregation
5. EXIF data extraction happens client-side before upload

### Image Optimization

**Important:** The project uses Cloudflare's CDN image optimization:

- Custom loader in `image-loader.ts` transforms image URLs
- Domain is hardcoded: `gallery.tahmidul612.com`
- **Before deployment:** Update the domain in both `image-loader.ts:26` and `next.config.ts:10`

### Authentication

- Better Auth configured in `src/modules/auth/lib/auth.ts`
- Email/password authentication enabled
- First user signup creates admin, subsequent signups are disabled (handled in route logic)
- Session checked in tRPC context creation (`src/trpc/init.ts`)

### Environment Variables Required

```bash
DATABASE_URL                        # Neon database connection
BETTER_AUTH_SECRET                  # Auth secret (openssl rand -base64 32)
BETTER_AUTH_URL                     # Base URL (http://localhost:3000)
NEXT_PUBLIC_APP_URL                 # Public base URL
CLOUDFLARE_R2_ENDPOINT              # R2 endpoint
CLOUDFLARE_R2_ACCESS_KEY_ID         # R2 credentials
CLOUDFLARE_R2_SECRET_ACCESS_KEY     # R2 credentials
CLOUDFLARE_R2_BUCKET_NAME           # R2 bucket
CLOUDFLARE_R2_PUBLIC_URL            # Public CDN URL
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN     # Mapbox API token
```

### Testing

Currently no test suite is configured in the project.

## Development Notes

- Uses `bun` as package manager (not npm/yarn)
- TypeScript with React 19 and Next.js 15
- Database migrations managed via Drizzle Kit
- All tRPC procedures use Zod for input validation
- Photos automatically extract EXIF data (make, model, lens, GPS, etc.)
- City sets automatically maintain photo counts and cover photos
