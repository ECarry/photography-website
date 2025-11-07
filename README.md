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
- **File Storage** via Cloudflare R2

## 📋 Prerequisites

Before deploying, ensure you have:

- **Node.js 18+** or **Bun** runtime
- **PostgreSQL database** (recommended: Neon, Supabase, or Vercel Postgres)
- **Cloudflare R2** bucket for image storage
- **Mapbox** account for map features
- **Vercel** account for deployment (or any Node.js hosting provider)

## 🛠️ Deployment Guide

### Step 1: Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
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

#### Cloudflare R2 Configuration
```env
# Cloudflare R2 settings
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
CLOUDFLARE_R2_PUBLIC_URL=https://your-custom-domain.com
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key
NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL=https://your-custom-domain.com
```

**Setup Cloudflare R2:**
1. Create Cloudflare account
2. Go to R2 Object Storage
3. Create a new bucket
4. Generate API tokens with R2 permissions
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

#### Photo URL Cleanup (if migrating)
```bash
# If migrating from another system, clean photo URLs
bun run clean:photo-urls
```

## 🔧 Configuration Options

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
   - Ensure Cloudflare R2 is properly configured
   - Set up custom domain for R2 bucket
   - Configure CDN settings

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
- Verify Cloudflare R2 credentials
- Check CORS settings on R2 bucket
- Ensure bucket permissions are correct

#### Map Not Loading
- Verify Mapbox token is valid
- Check token permissions and scopes
- Ensure domain is authorized in Mapbox settings

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Better Auth Documentation](https://better-auth.com)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Mapbox Documentation](https://docs.mapbox.com)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Need help?** Check the troubleshooting section above or open an issue in the repository.