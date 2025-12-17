# 🚀 Getting Started - Quick Reference

## Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] npm 9+ installed  
- [ ] PostgreSQL installed (or Supabase account)
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

## Installation (3 Options)

### Option 1: Automated Setup (Recommended)
```bash
cd /home/vishal/Desktop/ATC
./setup.sh
```
The script will:
- Install dependencies
- Create .env file
- Setup database
- Generate Prisma client
- Generate JWT secrets

### Option 2: Manual Setup
```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your configuration

# 3. Generate secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET

# 4. Setup database
createdb ats_checker
npm run db:push

# 5. Start development server
npm run dev
```

### Option 3: Docker (Coming Soon)
```bash
docker-compose up
```

## First Run

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Open browser:**
   http://localhost:3000

3. **Create account:**
   - Click "Get Started Free"
   - Fill in registration form
   - Auto-login to dashboard

4. **Test the application:**
   - Click "New Analysis"
   - Upload a resume (PDF/DOCX) or paste text
   - Paste a job description
   - Click "Analyze Resume"
   - View your ATS score!

## Quick Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run linter

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Create and run migrations
npm run db:studio        # Open Prisma Studio

# Utilities
npm run clean            # Remove .next and node_modules
npm run type-check       # Check TypeScript types
```

## Environment Variables (Minimum)

```env
DATABASE_URL="postgresql://localhost:5432/ats_checker"
JWT_SECRET="your-32-char-secret"
JWT_REFRESH_SECRET="your-32-char-refresh-secret"
```

## Project Structure

```
src/
├── app/              # Pages and API routes
├── components/       # React components
└── lib/             # Core business logic
    ├── ats-engine.ts       # ATS scoring
    ├── ai-analysis.ts      # AI insights
    ├── resume-parser.ts    # Resume parsing
    └── auth.ts             # Authentication
```

## Key Features to Test

1. **Authentication:**
   - Register new user
   - Login
   - Logout
   - Token refresh

2. **Resume Upload:**
   - PDF upload
   - DOCX upload
   - Text paste

3. **ATS Analysis:**
   - Upload resume
   - Add job description
   - View score (0-100)
   - See matched/missing skills
   - Read AI suggestions

4. **Dashboard:**
   - View statistics
   - Check scan usage
   - Browse history

5. **Subscription:**
   - Free plan: 5 scans/month
   - Scan limit enforcement
   - Monthly reset

## Troubleshooting

### Port already in use
```bash
npx kill-port 3000
```

### Database connection error
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Restart PostgreSQL
sudo service postgresql restart

# Test connection
psql -U postgres -d ats_checker -c "SELECT 1"
```

### Prisma client not generated
```bash
rm -rf node_modules/.prisma
npm run db:generate
```

### Build errors
```bash
npm run clean
npm install
npm run build
```

## Development Workflow

1. **Make changes** to code
2. **Check types:** `npm run type-check`
3. **Test locally:** `npm run dev`
4. **Build:** `npm run build`
5. **Commit:** `git commit -m "message"`
6. **Deploy:** Push to GitHub/Vercel

## API Testing

Use these tools:
- **Postman**: Import from API_DOCUMENTATION.md
- **curl**: Command-line testing
- **Thunder Client**: VS Code extension
- **Insomnia**: Alternative to Postman

Example:
```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'
```

## Database Management

### View data:
```bash
npm run db:studio
# Opens Prisma Studio at http://localhost:5555
```

### Reset database:
```bash
npx prisma migrate reset
npm run db:push
```

### Backup database:
```bash
pg_dump ats_checker > backup.sql
```

### Restore database:
```bash
psql ats_checker < backup.sql
```

## VS Code Extensions (Recommended)

- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- TypeScript Error Translator
- GitLens
- Thunder Client

## Learning Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://prisma.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://typescriptlang.org/docs

## Support

- Check `README.md` for comprehensive documentation
- See `QUICKSTART.md` for 5-minute setup
- Read `API_DOCUMENTATION.md` for API details
- Review `DEPLOYMENT.md` for production deployment

## Next Steps

1. ✅ Complete setup
2. ✅ Test core features
3. [ ] Customize branding
4. [ ] Add payment integration (Stripe)
5. [ ] Set up email service (SendGrid)
6. [ ] Deploy to production (Vercel)
7. [ ] Configure custom domain
8. [ ] Set up monitoring (Sentry)
9. [ ] Add analytics (Google Analytics)
10. [ ] Launch! 🚀

---

**Ready to build something amazing!** 💪
