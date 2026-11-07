# Photography Website

A photography portfolio and management site built with Next.js 16. It includes public travel, photo, and blog pages plus an authenticated dashboard for managing photos, cities, posts, and profile settings.

## 📸 Screenshots

![Home Page](screenshots/home.png)
_Home Page_

![Dashboard](screenshots/dashboard.png)
_Dashboard_

## 🚀 Features

- **Next.js 16** with React 19 and React Compiler
- **TanStack Query v5** for advanced data fetching and caching
- **tRPC v11** for end-to-end type-safe APIs
- **Photo Management** with direct S3-compatible uploads, EXIF metadata, location editing, favorites, and visibility controls
- **Travel Galleries** with city collections, framed photo galleries, and cover-photo management
- **Discover** with a Mapbox map and public photos in the current viewport
- **Blog Publishing** with a rich-text post editor, cover images, tags, and public/private visibility
- **Dashboard Analytics** with photo activity, travel statistics, and metadata summaries
- **Modern UI** built with Tailwind CSS and shadcn/ui components
- **Authentication** powered by Better Auth
- **Database** using Drizzle ORM with PostgreSQL
- **File Storage** via S3-compatible storage and presigned uploads

## 🗺️ Application Routes

### Public

| Route | Description |
| --- | --- |
| `/` | Photography portfolio home page |
| `/about` | Photographer profile and equipment |
| `/travel` | Travel destinations |
| `/travel/[city]` | City gallery |
| `/discover` | Map of public, geotagged photos |
| `/blog` | Public posts |
| `/blog/[slug]` | Blog post |
| `/p/[id]` | Photo detail page |
| `/screensaver` | Full-screen photo display |

### Dashboard

| Route | Description |
| --- | --- |
| `/sign-in` | Dashboard sign-in |
| `/dashboard` | Dashboard overview and analytics |
| `/dashboard/photos` | Photo library and bulk management |
| `/dashboard/photos/[id]` | Edit a photo |
| `/dashboard/cities` | Manage city collections |
| `/dashboard/cities/[city]` | Edit a city and manage its photos |
| `/dashboard/posts` | Manage blog posts |
| `/dashboard/posts/new` | Create a post |
| `/dashboard/posts/[slug]` | Edit a post |
| `/dashboard/profile` | Profile and security settings |

## 📋 Prerequisites

Before deploying, ensure you have:

- **Node.js 20.9+** or **Bun**
- **PostgreSQL database** (Neon is supported through its serverless driver; other PostgreSQL services can use the `local`/node-postgres driver)
- **S3-compatible storage** for image storage (AWS S3, Cloudflare R2, DigitalOcean Spaces, etc.)
- **Mapbox** access token for map features
- A deployment target such as Vercel or Docker (optional)

## 💻 Local Development

```bash
bun install
cp .env.example .env
# Fill in DATABASE_URL, Better Auth, S3, and Mapbox values.
bun run db:push
bun run dev
```

Open `http://localhost:3000`. To create the initial local account, run this in a second terminal while the development server is running:

```bash
bun run seed:user
```

Registration is limited to the first user in development and is disabled in production.

## 🧰 Common Commands

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the development server |
| `bun run build` | Create a production build |
| `bun run start` | Serve a completed production build |
| `bun run lint` | Run ESLint |
| `bun run test:unit` | Run unit tests |
| `bun run db:push` | Push the Drizzle schema to the configured database |
| `bun run db:studio` | Open Drizzle Studio |
| `bun run seed:user` | Create the first user in development |
| `bun run seed:demo-post` | Create or update the demo blog post |

## 🎨 Customization

All personal branding is centralized in **one file**: `src/site.config.ts`. Edit it to make the site your own:

| Field         | Description                                                             |
| ------------- | ----------------------------------------------------------------------- |
| `name`        | Your name (logo, profile cards, footer)                                 |
| `tagline`     | Short tagline next to logo (e.g. "Photo")                               |
| `role`        | Your title (e.g. "Photographer")                                        |
| `bio`         | Short bio on the home page                                              |
| `avatar`      | Avatar image path (place file in `/public/avatar.jpg`)                  |
| `initials`    | Fallback text when avatar fails to load                                 |
| `metadata`    | SEO title & description                                                 |
| `socialLinks` | Social links with icons (Instagram, GitHub, X, Xiaohongshu, Contact me) |
| `footer`      | Footer attribution credits                                              |
| `mapbox`      | Custom Mapbox style URLs for light/dark themes                          |
| `imageLoader` | Set to `"cloudflare"` or `"default"` based on your storage provider     |
| `gear`        | Camera gear shown on the About page                                     |

**Quick start:**

```bash
# 1. Edit the config
vim src/site.config.ts

# 2. Replace avatar
cp your-photo.jpg public/avatar.jpg

# 3. Replace about background
cp your-bg.jpg public/bg.jpg
```

> **Note:** If you are NOT using Cloudflare R2, set `imageLoader` to `"default"` in `site.config.ts`. This replaces the old manual edit of `next.config.ts`.

## 🛠️ Deployment Guide

### Step 1: Clone and Setup

```bash
# Clone the repository
git clone https://github.com/ECarry/photography-website.git
cd photography-website

# Install dependencies
bun install
# or
npm install
```

### Step 2: Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Configure the following environment variables:

#### Database Configuration

```env
# PostgreSQL connection string
DATABASE_URL=postgresql://username:password@host:port/database_name?sslmode=require

# Optional: "local" uses node-postgres; omit or use "neon" for Neon serverless
DATABASE_PROVIDER=local
```

For Neon, use `DATABASE_PROVIDER=neon` or leave `DATABASE_PROVIDER` unset. Other PostgreSQL services such as Supabase can use the `local` (node-postgres) driver.

To create a Neon database:

1. Create an account at [neon.tech](https://neon.tech)
2. Create a project
3. Copy its connection string

#### Authentication Configuration

```env
# Generate a random secret key (32+ characters)
BETTER_AUTH_SECRET=your-super-secret-key-here

# Your app's base URL
BETTER_AUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

#### S3-Compatible Storage Configuration

```env
# S3-compatible storage settings
S3_ENDPOINT=https://your-s3-endpoint.com
S3_BUCKET_NAME=your-bucket-name
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
# Public asset base URL used by the website
NEXT_PUBLIC_S3_PUBLIC_URL=https://your-custom-domain.com
```

The public URL must point to a domain that can serve objects from the bucket. The browser uploads directly to storage using short-lived presigned URLs.

**Supported Storage Providers:**

**Cloudflare R2:**

```env
S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
S3_BUCKET_NAME=your-bucket-name
NEXT_PUBLIC_S3_PUBLIC_URL=https://your-custom-domain.com
```

**AWS S3:**

```env
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET_NAME=your-aws-bucket
NEXT_PUBLIC_S3_PUBLIC_URL=https://your-bucket.s3.amazonaws.com
```

**DigitalOcean Spaces:**

```env
S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
S3_BUCKET_NAME=your-space-name
NEXT_PUBLIC_S3_PUBLIC_URL=https://your-space.nyc3.digitaloceanspaces.com
```

**MinIO (Self-hosted):**

```env
S3_ENDPOINT=http://localhost:9000
S3_BUCKET_NAME=your-minio-bucket
NEXT_PUBLIC_S3_PUBLIC_URL=http://localhost:9000/your-bucket
```

**Wasabi:**

```env
S3_ENDPOINT=https://s3.wasabisys.com
S3_BUCKET_NAME=your-wasabi-bucket
NEXT_PUBLIC_S3_PUBLIC_URL=https://your-bucket.s3.wasabisys.com
```

#### ⚠️ Image loader note (when not using Cloudflare R2)

If you are **not using Cloudflare R2**, set `imageLoader` to `"default"` in `src/site.config.ts`. This is handled automatically — no need to manually edit `next.config.ts`.

**Setup Instructions:**

1. Choose your preferred S3-compatible storage provider
2. Create an account and set up a bucket
3. Generate API credentials (Access Key ID and Secret Access Key)
4. Configure the endpoint URL for your provider
5. (Optional) Setup custom domain for public access

#### Mapbox Configuration

```env
# Mapbox access token
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your-mapbox-token
```

**Get Mapbox Token:**

1. Create account at [mapbox.com](https://mapbox.com)
2. Go to Account > Access Tokens
3. Create a new token with appropriate scopes

#### Optional Rate Limiting

Set both variables to enable Upstash-backed rate limiting for public API requests. Leave both unset to disable it.

```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

#### Admin User Configuration

```env
# Used by the first-user development setup
SEED_USER_EMAIL=admin@yourdomain.com
SEED_USER_PASSWORD=your-secure-password
SEED_USER_NAME=Admin User
```

### Step 3: Database Setup

```bash
# Push database schema
bun run db:push
```

### Step 4: Run the Development Server

```bash
bun run dev
```

In another terminal, create the first account while the development server is running:

```bash
bun run seed:user
```

`seed:user` calls the app's sign-up endpoint. It only works in development, before any user exists; public registration is disabled in production.

### Step 5: Build and Test Locally

```bash
# Build the application
bun run build

# Test the production build locally
bun run start
```

Visit `http://localhost:3000` to verify everything works correctly.

### Step 6: Deploy to Vercel

#### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option B: Deploy via Git Integration

1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push

#### Vercel Environment Variables Setup

In your Vercel dashboard, add all environment variables from your `.env` file:

1. Go to Project Settings > Environment Variables
2. Add each variable with appropriate values for production
3. Make sure to update URLs to use your production domain

### Step 7: Post-Deployment Setup

#### Database Migration (if needed)

```bash
# If you need to run migrations on production
vercel env pull .env.local
bun run db:push
```

`seed:user` cannot create an account against a production server because registration is disabled there. Bootstrap the initial production account through a controlled, one-time process; do not enable public registration.

#### Upgrade: Photo URL storage change (S3 Key)

- **Change Summary**
  - The database `url` field now stores the S3 object key (e.g., `photos/IMG_0001.jpg`) instead of a full public URL.
  - **Benefit**: You can switch domains or CDNs freely by updating environment variables for the public base URL, without mass-updating the database.

- **Migration Steps (run before production, recommended)**
  1. **Backup your database** (strongly recommended).
  2. Run the cleanup script to convert existing full URLs to S3 keys:
     ```bash
     bun run clean:photo-urls
     ```
  3. **Verify the result**: spot-check several records; `url` should look like a key such as `path/to/object.jpg`.
  4. If you need to rollback, run:
     ```bash
     bun run rollback:photo-urls
     ```

- **Notes**
  - Set `NEXT_PUBLIC_S3_PUBLIC_URL` to the public asset base URL. At runtime, the app combines this base URL with the stored object key.
  - If you have custom prefixes or multiple buckets, validate the script behavior in a staging environment first.

## 🐳 Docker Deployment

This project supports two Docker deployment modes: **Standalone** (self-hosted) and **Cloud** (managed services).

### 1. Standalone Mode (Default)

Run the entire stack (App, PostgreSQL, RustFS) locally. Ideal for testing and self-hosting.

```bash
docker compose up -d
# or explicitly:
docker compose -f docker-compose.standalone.yml up -d
```

- **App**: http://localhost:3000
- **Postgres**: localhost:5432
- **RustFS (S3)**: localhost:9000
- **RustFS Console**: http://localhost:9001

### 2. Cloud Mode

Run only the App container, connecting to external services (e.g., Neon Postgres, AWS S3, Cloudflare R2).

1.  Create a `.env` file with your credentials:
    ```bash
    DATABASE_URL="postgresql://..."
    BETTER_AUTH_SECRET="..."
    BETTER_AUTH_URL="https://your-domain.com"
    NEXT_PUBLIC_APP_URL="https://your-domain.com"
    S3_ACCESS_KEY_ID="..."
    S3_SECRET_ACCESS_KEY="..."
    S3_BUCKET_NAME="..."
    S3_ENDPOINT="https://your-storage-endpoint"
    NEXT_PUBLIC_S3_PUBLIC_URL="https://your-public-storage-domain"
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="pk...."
    ```
2.  Start the service:
    ```bash
    docker compose -f docker-compose.cloud.yml up -d
    ```

The Cloud Compose file sets `DATABASE_PROVIDER=neon` and passes the public app, storage, and Mapbox values as build arguments. Set a real Mapbox token if you use map pages.

### ⚠️ Important Note on Building

The Dockerfile uses a **multi-stage build** with two deployment targets:

| Target   | Used by                            | Strategy                                                                                                       |
| -------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `dev`    | `docker-compose.yml` (Standalone)  | **Runtime build** — app is built inside the container at startup so SSG can access the local database          |
| `runner` | `docker-compose.cloud.yml` (Cloud) | **Pre-built** — app is built during `docker build` using Next.js standalone output for a smaller, faster image |

**Standalone mode:**

- **First Start**: Will take 1-2 minutes to compile.
- **Restarts**: Will be fast (cached via `next_cache` volume).

**Cloud mode:**

- Image is pre-built and optimized (~200MB vs ~1GB).
- Starts instantly — no build step at runtime.
- Environment variables for SSG are passed as build args.

## ⚙️ Operations and Security

### Custom Domain Setup

1. **Vercel Custom Domain:**
   - Go to Project Settings > Domains
   - Add your custom domain
   - Configure DNS records as instructed

2. **Update Environment Variables:**
   ```env
   BETTER_AUTH_URL=https://your-custom-domain.com
   NEXT_PUBLIC_APP_URL=https://your-custom-domain.com
   ```

### Performance and Images

- Vercel Analytics is already included in the application.
- For Cloudflare R2, the Cloudflare image loader can resize images at the edge.
- For other providers, use the default Next.js image loader and configure a public storage domain or CDN.

### Security Considerations

1. **Environment Variables:**
   - Never commit `.env` files
   - Use strong, unique secrets
   - Rotate keys regularly

2. **Database Security:**
   - Use connection pooling
   - Enable SSL connections
   - Restrict database access by IP

3. **File Upload Security:**
   - Configure proper CORS settings
   - Implement file type validation
   - Set upload size limits

## 📱 Mobile Optimization

The dashboard and public pages are responsive and optimized for mobile browsers:

- **Touch-friendly** interface
- **Optimized images** with lazy loading
- **Fast loading** with Next.js optimizations

## 🐛 Troubleshooting

### Common Issues

#### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
bun install
```

#### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check database server status
- Ensure SSL settings match requirements

#### Image Upload Issues

- Verify S3 storage credentials
- Check CORS settings on your storage bucket
- Ensure bucket permissions are correct
- Verify endpoint URL is correct for your provider

#### Map Not Loading

- Verify Mapbox token is valid
- Check token permissions and scopes
- Ensure domain is authorized in Mapbox settings

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Better Auth Documentation](https://better-auth.com)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [DigitalOcean Spaces Documentation](https://docs.digitalocean.com/products/spaces/)
- [Mapbox Documentation](https://docs.mapbox.com)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 💖 Support

If you find this project helpful, please give it a ⭐️ on GitHub!

## ⭐️ Star History

## Star History

<a href="https://www.star-history.com/?repos=ECarry%2Fphotography-website&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=ECarry/photography-website&type=date&theme=dark&legend=top-left&sealed_token=YIvqTaYn4d5o7R2s00ixqF9v2FKtnLq-IxswDwy0zFh7I9pw4Mb2yUD2dXKXfWEdK_uqPMCl8UUr1L83AjjDSKujjr7h0ajgDIXl45NcGpwdrKjmaQ4MitYFm0U6YDAmo0TW88BYKbjTfDcrt2BbqfA2UQRXukwkVTP6P5OgIgItGcBtqwiFfpX1DCYg" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=ECarry/photography-website&type=date&legend=top-left&sealed_token=YIvqTaYn4d5o7R2s00ixqF9v2FKtnLq-IxswDwy0zFh7I9pw4Mb2yUD2dXKXfWEdK_uqPMCl8UUr1L83AjjDSKujjr7h0ajgDIXl45NcGpwdrKjmaQ4MitYFm0U6YDAmo0TW88BYKbjTfDcrt2BbqfA2UQRXukwkVTP6P5OgIgItGcBtqwiFfpX1DCYg" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=ECarry/photography-website&type=date&legend=top-left&sealed_token=YIvqTaYn4d5o7R2s00ixqF9v2FKtnLq-IxswDwy0zFh7I9pw4Mb2yUD2dXKXfWEdK_uqPMCl8UUr1L83AjjDSKujjr7h0ajgDIXl45NcGpwdrKjmaQ4MitYFm0U6YDAmo0TW88BYKbjTfDcrt2BbqfA2UQRXukwkVTP6P5OgIgItGcBtqwiFfpX1DCYg" />
 </picture>
</a>


## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Need help?** Check the troubleshooting section above or open an issue in the repository.
