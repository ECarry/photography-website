# Photography Website

A modern photography portfolio website built with Next.js 16, featuring interactive maps, photo management, and a comprehensive dashboard.

## 🚀 Features

- **Next.js 16** with React 19 and React Compiler
- **TanStack Query v5** for advanced data fetching and caching
- **tRPC v11** for end-to-end type-safe APIs
- **Interactive Maps** with Mapbox GL JS integration
- **Photo Management** with EXIF data extraction and iPhone album integration
- **Real-time Dashboard** with analytics and statistics
- **Modern UI** built with Tailwind CSS and shadcn/ui components
- **Authentication** powered by Better Auth
- **Database** using Drizzle ORM with PostgreSQL
- **File Storage** via S3-compatible storage

## 📋 Prerequisites

Before deploying, ensure you have:

- **Node.js 18+** or **Bun** runtime
- **PostgreSQL database** (recommended: Neon, Supabase, or Vercel Postgres)
- **S3-compatible storage** for image storage (AWS S3, Cloudflare R2, DigitalOcean Spaces, etc.)
- **Mapbox** account for map features
- **Vercel** account for deployment (or any Node.js hosting provider)

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
```

**For Neon Database:**

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from dashboard

**For Supabase:**

1. Create project at [supabase.com](https://supabase.com)
2. Go to Settings > Database
3. Copy the connection string

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
S3_PUBLIC_URL=https://your-custom-domain.com
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
NEXT_PUBLIC_S3_PUBLIC_URL=https://your-custom-domain.com
```

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

#### Admin User Configuration

```env
# Default admin user for seeding
SEED_USER_EMAIL=admin@yourdomain.com
SEED_USER_PASSWORD=your-secure-password
SEED_USER_NAME=Admin User
```

### Step 3: Database Setup

```bash
# Push database schema
bun run db:push

# Create admin user
bun run seed:user
```

### Step 4: Build and Test Locally

```bash
# Build the application
bun run build

# Test the production build locally
bun run start
```

Visit `http://localhost:3000` to verify everything works correctly.

### Step 5: Deploy to Vercel

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

### Step 6: Post-Deployment Setup

#### Database Migration (if needed)

```bash
# If you need to run migrations on production
vercel env pull .env.local
bun run db:push
```

#### Create Admin User (Production)

```bash
# Seed admin user in production
vercel env pull .env.local
bun run seed:user
```

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
  - Ensure your public access domain is configured via `S3_PUBLIC_URL` or `NEXT_PUBLIC_S3_PUBLIC_URL`. At runtime, the app combines this base URL with the key to form a full public URL.
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
*   **App**: http://localhost:3000
*   **Postgres**: localhost:5432
*   **RustFS (S3)**: localhost:9000
*   **RustFS Console**: http://localhost:9001

### 2. Cloud Mode
Run only the App container, connecting to external services (e.g., Neon Postgres, AWS S3, Cloudflare R2).

1.  Create a `.env` file with your credentials:
    ```bash
    DATABASE_PROVIDER=cloud
    DATABASE_URL="postgres://..."
    BETTER_AUTH_SECRET="..."
    S3_ACCESS_KEY_ID="..."
    S3_SECRET_ACCESS_KEY="..."
    S3_BUCKET_NAME="..."
    S3_ENDPOINT="..." # Optional
    S3_PUBLIC_URL="..."
    ```
2.  Start the service:
    ```bash
    docker compose -f docker-compose.cloud.yml up -d
    ```

### ⚠️ Important Note on Building
This project uses a **Runtime Build** strategy for Docker. The Next.js application is built *inside* the container when it starts, not when the Docker image is built.
This ensures that Static Site Generation (SSG) can successfully fetch data from the database (which is only available at runtime in the Standalone mode).
*   **First Start**: Will take 1-2 minutes to compile.
*   **Restarts**: Will be fast (cached via `next_cache` volume).

## 🛠 Tech Stack

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

### Performance Optimization

1. **Enable Vercel Analytics:**

   ```bash
   npm install @vercel/analytics
   ```

2. **Configure Image Optimization:**
   - Ensure S3-compatible storage is properly configured
   - Set up custom domain for your storage bucket
   - Configure CDN settings (CloudFlare, AWS CloudFront, etc.)

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

The application is fully responsive and optimized for mobile devices:

- **Progressive Web App** features
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

[![Star History Chart](https://api.star-history.com/svg?repos=ECarry/photography-website&type=Date)](https://star-history.com/#ECarry/photography-website&Date)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Need help?** Check the troubleshooting section above or open an issue in the repository.
