# Photography Blog 📸

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tahmidul612/gallery)

A modern, open-source photography blog platform built with the latest web technologies. Share your photography journey with style and efficiency.

## ✨ Features

- 📱 Responsive design for all devices
- 🖼️ Automatic EXIF data extraction from photos
- 🔐 Secure authentication with Better Auth
- ☁️ Cloud storage with Cloudflare R2
- 🎨 Beautiful UI with Shadcn/ui components
- 🚀 Lightning-fast performance
- 📍 Location-based photo organization
- 🌐 SEO optimized
- 🎯 API powered by tRPC

## 📸 Screenshots

<img src="https://github.com/tahmidul612/gallery/blob/main/docs/screen/home.png?raw=true" alt="page">
<img src="https://github.com/tahmidul612/gallery/blob/main/docs/screen/travel.png?raw=true" alt="page">
<img src="https://github.com/tahmidul612/gallery/blob/main/docs/screen/discover.png?raw=true" alt="page">
<img src="https://github.com/tahmidul612/gallery/blob/main/docs/screen/about.png?raw=true" alt="page">
<img src="https://github.com/tahmidul612/gallery/blob/main/docs/screen/photograph.png?raw=true" alt="page">

## 🌈 Support Theme

- 🌈 Dark
- 🌈 Light

<img src="https://github.com/tahmidul612/gallery/blob/main/screen/theme.png?raw=true" alt="page">

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/)
- **Database:** [Neon](https://neon.tech/) (Serverless Postgres)
- **ORM:** [Drizzle](https://orm.drizzle.team/)
- **Authentication:** [Better Auth](https://better-auth.com/)
- **UI Components:** [Shadcn/ui](https://ui.shadcn.com/)
- **API Layer:** [tRPC](https://trpc.io/)
- **Storage:** [Cloudflare R2](https://www.cloudflare.com/products/r2/)
- **Deployment:** [Vercel](https://vercel.com)

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- bun (recommended) or npm
- [Neon Database](https://neon.tech/)
- [Cloudflare R2 Account](https://www.cloudflare.com/products/r2/)
- [Mapbox Account](https://console.mapbox.com/)

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL=your_database_url

# Auth
# You can generate a random secret using `openssl rand -base64 32`
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000 #Base URL of your app

NEXT_PUBLIC_APP_URL='http://localhost:3000'

# Cloudflare R2
CLOUDFLARE_R2_ENDPOINT=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=
CLOUDFLARE_R2_PUBLIC_URL=

# Mapbox
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=
```

Replace `your-domain.com` with your actual domain name. This is required for Cloudflare Image Optimization to work correctly.

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/photography-website.git
    cd photography-website
    ```

1. Install dependencies:

    ```bash
    bun install
    ```

1. Set up the database:

    ```bash
    bun db:push
    ```

1. Start the development server:

    ```bash
    bun run dev
    ```

### Initial User Registration

When you first deploy the application, you'll need to create an admin user. You can do this by visiting:

```url
http://localhost:3000/sign-up
```

Note: After the first admin user is created, the `/sign-up` route will be disabled for security purposes. Any subsequent attempts to access the sign-up page will automatically redirect to the sign-in page (`/sign-in`).

### Custom Domain Configuration

Before deploying, you need to update the custom domain in `image-loader.ts`:

```typescript
// image-loader.ts
return `https://your-domain.com/cdn-cgi/image/${paramsString}/${normalizeSrc(
  src
)}`;
```

Visit `http://localhost:3000` to see your application.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and pull requests.

## 💖 Support

If you find this project helpful, please give it a ⭐️ on GitHub!
