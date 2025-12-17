# Deployment Guide

## Production Deployment Checklist

### Pre-Deployment
- [ ] Test all features locally
- [ ] Run database migrations
- [ ] Set production environment variables
- [ ] Update CORS settings
- [ ] Enable HTTPS
- [ ] Set up monitoring
- [ ] Configure error tracking
- [ ] Set up backups

---

## Option 1: Vercel + Supabase (Recommended)

### Step 1: Deploy Database to Supabase

1. **Create Supabase Account**
   - Go to https://supabase.com
   - Sign up / Login
   - Create new project

2. **Get Database Connection String**
   - Go to Project Settings → Database
   - Copy connection string (connection pooling mode)
   - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres?pgbouncer=true`

3. **Run Migrations**
   ```bash
   # Set DATABASE_URL temporarily
   export DATABASE_URL="your-supabase-connection-string"
   
   # Push schema
   npm run db:push
   ```

### Step 2: Deploy Frontend to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial deployment"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Select "Next.js" framework

3. **Configure Environment Variables**
   In Vercel dashboard, add these variables:
   
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres?pgbouncer=true
   
   JWT_SECRET=generate-random-256-bit-string
   JWT_REFRESH_SECRET=generate-different-256-bit-string
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   
   NEXT_PUBLIC_API_URL=https://your-app.vercel.app
   
   FREE_PLAN_SCANS_PER_MONTH=5
   PRO_PLAN_SCANS_PER_MONTH=999999
   
   MAX_FILE_SIZE=5242880
   
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Visit your live site!

---

## Option 2: Railway (Full Stack)

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Login
```bash
railway login
```

### Step 3: Initialize Project
```bash
railway init
```

### Step 4: Add PostgreSQL
```bash
railway add
# Select PostgreSQL from menu
```

### Step 5: Set Environment Variables
```bash
railway variables set JWT_SECRET=your-secret-key
railway variables set JWT_REFRESH_SECRET=your-refresh-secret
railway variables set NODE_ENV=production
# ... add all other variables
```

### Step 6: Deploy
```bash
railway up
```

### Step 7: Get URL
```bash
railway domain
```

---

## Option 3: Render (Full Stack)

### Step 1: Create Database

1. Go to https://render.com
2. New → PostgreSQL
3. Create database
4. Copy internal connection string

### Step 2: Create Web Service

1. New → Web Service
2. Connect GitHub repository
3. Configure:
   - **Name**: ats-checker
   - **Environment**: Node
   - **Build Command**: `npm install && npm run db:push && npm run build`
   - **Start Command**: `npm start`

### Step 3: Add Environment Variables

Add all variables from `.env.example`

### Step 4: Deploy

Click "Create Web Service"

---

## Option 4: AWS (Advanced)

### Architecture
- **Frontend**: S3 + CloudFront
- **Backend**: ECS or Lambda
- **Database**: RDS PostgreSQL
- **Storage**: S3 for resume files

### Step 1: RDS Database
```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier ats-checker-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password <password> \
  --allocated-storage 20
```

### Step 2: Deploy with Docker

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Build and Push:**
```bash
# Build image
docker build -t ats-checker .

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker tag ats-checker:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/ats-checker:latest

docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/ats-checker:latest
```

---

## Post-Deployment Setup

### 1. SSL Certificate
- Vercel: Automatic
- Railway: Automatic
- Render: Automatic
- AWS: Use ACM (AWS Certificate Manager)

### 2. Custom Domain
```bash
# Vercel
vercel domains add your-domain.com

# Railway
railway domain your-domain.com

# Render: Add in dashboard
```

### 3. Environment Validation
Test these endpoints:
- [ ] `GET /api/health` (create this)
- [ ] `POST /api/auth/register`
- [ ] `POST /api/auth/login`
- [ ] Database connection

### 4. Monitoring Setup

**Sentry (Error Tracking):**
```bash
npm install @sentry/nextjs
```

**Vercel Analytics:**
```bash
npm install @vercel/analytics
```

Add to `layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

---

## Database Migrations

### Production Migration Strategy

1. **Never drop production data**
2. **Always backup before migration**
3. **Test migrations on staging first**

**Backup Command:**
```bash
pg_dump $DATABASE_URL > backup.sql
```

**Migration Command:**
```bash
npx prisma migrate deploy
```

---

## Performance Optimization

### 1. Enable Caching
```typescript
// Add to API routes
export const revalidate = 60 // Cache for 60 seconds
```

### 2. Database Connection Pooling
```env
DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=10"
```

### 3. Image Optimization
Next.js handles automatically with `next/image`

### 4. Bundle Analysis
```bash
npm install @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)
```

---

## Security Hardening

### 1. Rate Limiting
Install middleware:
```bash
npm install express-rate-limit
```

### 2. Helmet (Security Headers)
```bash
npm install helmet
```

### 3. CORS Configuration
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://your-domain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
        ],
      },
    ]
  },
}
```

### 4. Environment Variables
- Never commit `.env` to git
- Use secret management (AWS Secrets Manager, Vercel Secrets)
- Rotate secrets regularly

---

## Monitoring & Alerts

### 1. Uptime Monitoring
- UptimeRobot (free)
- Pingdom
- StatusCake

### 2. Application Monitoring
- New Relic
- Datadog
- Vercel Analytics

### 3. Log Aggregation
- Logtail
- Papertrail
- CloudWatch Logs (AWS)

---

## Backup Strategy

### Database Backups
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
```

### Automated Backups
- Supabase: Automatic daily backups
- Railway: Point-in-time recovery
- RDS: Automated snapshots

---

## Rollback Procedure

### Vercel
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback <deployment-url>
```

### Railway
```bash
railway rollback
```

### Database Rollback
```bash
# Restore from backup
psql $DATABASE_URL < backup.sql
```

---

## Cost Estimation

### Vercel + Supabase
- **Vercel**: $0/month (Hobby) or $20/month (Pro)
- **Supabase**: $0/month (Free tier) or $25/month (Pro)
- **Total**: $0-$45/month

### Railway
- **Starter**: $5/month
- **Developer**: $20/month
- Database included

### AWS (Estimated)
- **RDS t3.micro**: $15/month
- **ECS Fargate**: $20/month
- **S3**: $1/month
- **Total**: ~$36/month

---

## Troubleshooting

### Build Failures
```bash
# Check build logs
# Clear cache and rebuild
npm run clean
npm install
npm run build
```

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check connection string format
# Ensure IP whitelisting (Supabase/RDS)
```

### 502 Bad Gateway
- Check application logs
- Verify environment variables
- Ensure PORT is correct
- Check memory limits

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Railway Docs**: https://docs.railway.app
- **Next.js Docs**: https://nextjs.org/docs

---

**Deployment Complete! 🚀**
