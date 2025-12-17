# Quick Start Guide

## Setup in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Create PostgreSQL database
createdb ats_checker

# Copy environment file
cp .env.example .env

# Edit .env with your database URL
# DATABASE_URL="postgresql://user:password@localhost:5432/ats_checker"

# Initialize database
npm run db:push
```

### 3. Run Application
```bash
npm run dev
```

Visit: http://localhost:3000

### 4. Test the Application

**Create Account:**
1. Go to http://localhost:3000/auth/register
2. Register with email and password
3. Auto-login to dashboard

**Upload & Analyze:**
1. Click "New Analysis"
2. Upload a resume PDF or paste text
3. Add a job description
4. Click "Analyze Resume"
5. View your ATS score and suggestions!

## Default Test Accounts

For testing, create accounts manually or use these credentials after seeding:

```
Email: test@example.com
Password: Test1234
```

## Common Issues

**Port Already in Use:**
```bash
# Kill process on port 3000
npx kill-port 3000
```

**Database Connection Error:**
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Restart PostgreSQL
sudo service postgresql restart
```

**Prisma Client Error:**
```bash
# Regenerate Prisma client
npm run db:generate
```

## Environment Variables (Minimum Required)

```env
DATABASE_URL="postgresql://localhost:5432/ats_checker"
JWT_SECRET="your-secret-key-min-32-chars-long"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"
```

## Production Checklist

- [ ] Set strong JWT secrets
- [ ] Configure production DATABASE_URL
- [ ] Set NODE_ENV="production"
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Add rate limiting
- [ ] Configure CORS properly
- [ ] Set up CI/CD pipeline

## Next Steps

1. Customize subscription plans in `.env`
2. Add payment integration (Stripe)
3. Set up email notifications (SendGrid)
4. Deploy to Vercel + Supabase
5. Add analytics (Google Analytics)
6. Configure domain and SSL
