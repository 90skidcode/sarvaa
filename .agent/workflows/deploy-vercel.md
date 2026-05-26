---
description: How to deploy the application to Vercel
---

# Deploying to Vercel

This guide will walk you through deploying your Next.js e-commerce application to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Git repository (GitHub, GitLab, or Bitbucket)
3. Project pushed to the repository

## Database Setup

Since this project uses SQLite (which is file-based and not suitable for production), you'll need to migrate to a cloud database:

### Option 1: Use Vercel Postgres (Recommended)

1. Go to your Vercel dashboard
2. Navigate to Storage → Create Database → Postgres
3. Follow the setup wizard
4. Copy the connection string

Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Option 2: Use Planetscale (MySQL)

1. Sign up at https://planetscale.com
2. Create a new database
3. Get the connection string

Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  relationMode = "prisma"
}
```

### Option 3: Use Supabase (PostgreSQL)

1. Sign up at https://supabase.com
2. Create a new project
3. Get the connection string from Settings → Database

Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Environment Variables

You'll need to set these environment variables in Vercel:

```
DATABASE_URL=<your-database-connection-string>
NEXTAUTH_SECRET=<generate-a-secure-random-string>
NEXTAUTH_URL=<your-vercel-deployment-url>
```

**Firebase Configuration** (if using Firebase):

```
NEXT_PUBLIC_FIREBASE_API_KEY=<your-firebase-api-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-firebase-auth-domain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-firebase-project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-firebase-storage-bucket>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-firebase-messaging-sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<your-firebase-app-id>
```

## Step-by-Step Deployment

### 1. Prepare Your Repository

Make sure all changes are committed and pushed:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Import Project to Vercel

**Via Vercel Dashboard:**

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your repository
4. Configure project settings:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `.next` (or leave default)

### 3. Configure Environment Variables

1. In the Vercel project settings, go to "Environment Variables"
2. Add all required environment variables listed above
3. Make sure to add them for all environments (Production, Preview, Development)

### 4. Deploy

Click "Deploy" and Vercel will:

- Install dependencies
- Run the build command
- Deploy your application

### 5. Post-Deployment: Run Database Migrations

After the first deployment, you need to set up your database:

**Option A: Use Vercel CLI**

```bash
npm i -g vercel
vercel login
vercel env pull .env.local
npx prisma migrate deploy
npx prisma db seed
```

**Option B: Via GitHub Actions or Vercel Build Command**

Update your build command in Vercel settings:

```
npx prisma generate && npx prisma migrate deploy && next build
```

## Continuous Deployment

Vercel automatically deploys:

- **Production**: When you push to your main/master branch
- **Preview**: When you create a pull request or push to other branches

## Post-Deployment Checklist

- [ ] Verify database connection
- [ ] Test authentication (NextAuth)
- [ ] Test Firebase integration
- [ ] Test file uploads (if any)
- [ ] Verify all API routes work
- [ ] Check environment variables are set correctly
- [ ] Test admin panel functionality
- [ ] Verify cart and order functionality

## Troubleshooting

### Build Failures

1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Make sure `package.json` scripts are correct

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check database allows connections from Vercel's IP ranges
3. Ensure Prisma schema matches database provider

### Authentication Issues

1. Verify `NEXTAUTH_URL` matches your deployment URL
2. Check `NEXTAUTH_SECRET` is set
3. Ensure Firebase config is correct (if using)

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update `NEXTAUTH_URL` environment variable to match

## Performance Optimization

Consider these optimizations for production:

1. Enable Vercel Analytics
2. Use Next.js Image Optimization
3. Enable caching headers
4. Configure ISR (Incremental Static Regeneration) where appropriate
5. Use Vercel Edge Functions for API routes if needed

## Additional Resources

- Vercel Documentation: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Prisma with Vercel: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
