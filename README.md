# AI Resume ATS Score Checker - Complete SaaS Platform

A production-ready, AI-powered SaaS application that helps job seekers optimize their resumes for Applicant Tracking Systems (ATS).

## 🚀 Features

### Core Functionality
- **ATS Score Analysis**: Get a comprehensive 0-100 score on resume ATS compatibility
- **Multi-Factor Scoring**: 
  - Skills Match (40%)
  - Experience Relevance (30%)
  - Keyword Density (20%)
  - Formatting Quality (10%)
- **Resume Parsing**: Support for PDF, DOCX, and plain text
- **AI-Powered Insights**: Intelligent analysis with actionable suggestions
- **Skill Gap Analysis**: Identify missing skills and keywords
- **Bullet Point Quality Assessment**: Evaluate experience descriptions
- **Language Quality Check**: Detect passive voice, clichés, and weak language

### SaaS Features
- **Authentication**: Secure JWT-based auth with refresh tokens
- **Subscription Management**: Free (5 scans/month) and Pro (unlimited) plans
- **Usage Tracking**: Monitor monthly scan limits
- **History & Dashboard**: Track past analyses and improvements
- **Responsive Design**: Beautiful UI with Tailwind CSS and Shadcn/UI

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  Landing • Auth • Dashboard • Analysis • Results            │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API
┌────────────────────────▼────────────────────────────────────┐
│                   API Layer (Next.js API Routes)            │
│  Auth • Resume Upload • ATS Analysis • User Management      │
└────────────────────────┬────────────────────────────────────┘
          ┌──────────────┼──────────────┐
          │              │              │
┌─────────▼─────┐ ┌─────▼──────┐ ┌────▼─────────┐
│  Auth Service │ │ ATS Engine │ │ AI Analysis  │
│  - JWT        │ │ - Parsing  │ │ - NLP        │
│  - bcrypt     │ │ - Scoring  │ │ - Insights   │
└───────────────┘ └────────────┘ └──────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              PostgreSQL Database (Prisma ORM)               │
│  Users • Resumes • Scores • Subscriptions • Tokens          │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Shadcn/UI**: High-quality components
- **Lucide Icons**: Beautiful icon library

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Prisma ORM**: Type-safe database client
- **PostgreSQL**: Production database
- **JWT**: Secure authentication
- **bcrypt**: Password hashing

### AI/NLP
- **Natural**: NLP library for keyword extraction
- **TF-IDF**: Semantic similarity analysis
- **pdf-parse**: PDF text extraction
- **mammoth**: DOCX parsing
- **Custom ATS Engine**: Multi-factor scoring algorithm

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL database
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd ATC
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```bash
# Copy example file
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ats_checker"

# JWT Secrets (generate strong random strings)
JWT_SECRET="your-super-secret-jwt-key-256-bits"
JWT_REFRESH_SECRET="your-refresh-secret-key-256-bits"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000"
API_RATE_LIMIT_MAX="100"
API_RATE_LIMIT_WINDOW="15"

# OpenAI (Optional - for enhanced AI features)
OPENAI_API_KEY="sk-your-openai-key-here"

# File Upload
MAX_FILE_SIZE="5242880"
ALLOWED_FILE_TYPES="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"

# Subscription Limits
FREE_PLAN_SCANS_PER_MONTH="5"
PRO_PLAN_SCANS_PER_MONTH="999999"

# Environment
NODE_ENV="development"
```

### 4. Database Setup

#### Create PostgreSQL Database
```bash
# Using psql
psql -U postgres
CREATE DATABASE ats_checker;
\q
```

#### Run Prisma Migrations
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Or create and run migrations
npm run db:migrate
```

#### Optional: View Database with Prisma Studio
```bash
npm run db:studio
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
ATC/
├── prisma/
│   └── schema.prisma           # Database schema
├── src/
│   ├── app/
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── resume/         # Resume management
│   │   │   ├── ats/            # ATS analysis
│   │   │   └── user/           # User management
│   │   ├── auth/               # Auth pages
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   └── ui/                 # Reusable UI components
│   └── lib/
│       ├── ai-analysis.ts      # AI analysis module
│       ├── ats-engine.ts       # ATS scoring engine
│       ├── auth.ts             # Authentication utilities
│       ├── middleware.ts       # API middleware
│       ├── prisma.ts           # Prisma client
│       ├── resume-parser.ts    # Resume parsing
│       ├── utils.ts            # Utility functions
│       └── validation.ts       # Input validation
├── .env                        # Environment variables
├── .env.example               # Environment template
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── tailwind.config.ts         # Tailwind config
└── next.config.js             # Next.js config
```

## 🔌 API Documentation

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### Resume Management

#### Upload Resume
```http
POST /api/resume/upload
Authorization: Bearer <access-token>
Content-Type: multipart/form-data

file: <resume.pdf>
```

#### Get Resumes
```http
GET /api/resume
Authorization: Bearer <access-token>
```

### ATS Analysis

#### Analyze Resume
```http
POST /api/ats/analyze
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "resumeId": "clx123...",
  "jobDescription": {
    "title": "Senior Software Engineer",
    "company": "Tech Corp",
    "description": "Full job description text...",
    "requiredSkills": ["Python", "AWS", "Docker"],
    "preferredSkills": ["Kubernetes", "React"]
  }
}
```

#### Get Analysis History
```http
GET /api/ats/history?limit=10&offset=0
Authorization: Bearer <access-token>
```

## 🎯 ATS Scoring Algorithm

### Scoring Components

1. **Skills Match (40%)**
   - Required skills matching
   - Preferred skills bonus
   - Fuzzy matching with common variations
   - Score: 0-100

2. **Experience Relevance (30%)**
   - TF-IDF semantic similarity
   - Relevant term matching
   - Context analysis
   - Score: 0-100

3. **Keyword Density (20%)**
   - Keyword presence check
   - Multiple mention rewards
   - Diminishing returns for over-optimization
   - Score: 0-100

4. **Formatting Quality (10%)**
   - Section detection (skills, experience, education)
   - Action verb usage
   - Content length validation
   - ATS-friendly structure
   - Score: 0-100

### Formula
```
Overall Score = (Skills × 0.40) + (Experience × 0.30) + 
                (Keywords × 0.20) + (Formatting × 0.10)
```

## 🚀 Deployment

### Option 1: Vercel (Recommended for Frontend)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

3. **Set Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env`

### Option 2: Database (Supabase)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Get connection string

2. **Update DATABASE_URL**
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

3. **Run Migrations**
```bash
npm run db:push
```

### Option 3: Full Stack (Railway/Render)

**Railway:**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

**Render:**
1. Create new Web Service
2. Connect GitHub repo
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration with validation
- [ ] User login and JWT token generation
- [ ] Resume upload (PDF/DOCX/text)
- [ ] Resume parsing accuracy
- [ ] ATS score calculation
- [ ] Job description analysis
- [ ] Subscription limit enforcement
- [ ] Dashboard data display
- [ ] History tracking

### Test User Flow
```
1. Register → Login
2. Upload resume
3. Paste job description
4. View ATS score and suggestions
5. Check dashboard
6. View history
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Access + refresh token rotation
- **Input Validation**: Zod schema validation
- **File Upload Limits**: Size and type restrictions
- **SQL Injection Protection**: Prisma ORM parameterized queries
- **Rate Limiting**: API endpoint protection
- **HTTPS**: Enforced in production
- **Environment Variables**: Sensitive data protection

## 📊 Database Schema

### Key Tables

**Users**: Authentication and subscription data
**Resumes**: Uploaded resume content and parsed data
**ATSScore**: Analysis results and scores
**JobDescription**: Job posting details
**RefreshToken**: JWT refresh token management

See `prisma/schema.prisma` for complete schema.

## 🎨 UI Components

Built with Shadcn/UI:
- Button
- Card
- Input
- Textarea
- Progress
- Skeleton

Customizable via `tailwind.config.ts`

## 🔧 Configuration

### Subscription Plans
Edit in `.env`:
```env
FREE_PLAN_SCANS_PER_MONTH="5"
PRO_PLAN_SCANS_PER_MONTH="999999"
```

### File Upload Limits
```env
MAX_FILE_SIZE="5242880"  # 5MB in bytes
```

### JWT Expiration
```env
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Test connection
psql -U postgres -d ats_checker
```

### Prisma Issues
```bash
# Clear Prisma cache
rm -rf node_modules/.prisma

# Regenerate client
npm run db:generate
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📈 Performance Optimization

- **Database Indexing**: Key fields indexed in Prisma schema
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic with Next.js App Router
- **Caching**: API responses cached where appropriate
- **Lazy Loading**: Components loaded on demand

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 👥 Support

For issues and questions:
- Email: support@ats-checker.com
- Documentation: [docs.ats-checker.com]
- GitHub Issues: [github.com/your-repo/issues]

## 🎯 Roadmap

- [ ] Integration with LinkedIn
- [ ] Cover letter optimization
- [ ] Chrome extension
- [ ] Mobile app (React Native)
- [ ] Advanced AI with GPT-4
- [ ] Resume templates
- [ ] A/B testing for resumes
- [ ] Interview preparation tools

## 🌟 Credits

Built with:
- Next.js
- Prisma
- PostgreSQL
- Tailwind CSS
- Shadcn/UI
- Natural NLP
- TypeScript

---

**Made with ❤️ for job seekers worldwide**
# IntegrityAI
