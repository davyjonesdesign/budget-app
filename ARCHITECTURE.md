# Budget App - Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                     USER DEVICES                        │
│  📱 Mobile (iOS/Android)  💻 Desktop  🌐 Web Browser   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                   │
│  ┌───────────────────────────────────────────────────┐ │
│  │  App Router Pages                                  │ │
│  │  • Landing (/)                                     │ │
│  │  • Auth (/auth/login, /auth/signup)               │ │
│  │  • Dashboard (/dashboard)                         │ │
│  │  • Transactions (/transactions)                   │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │  React Components                                  │ │
│  │  • Calendar Views (Month/Week/Day)                │ │
│  │  • Transaction Forms                              │ │
│  │  • UI Components (Button, Card, etc)              │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Styling & PWA                                     │ │
│  │  • Tailwind CSS (mobile-first)                    │ │
│  │  • PWA Manifest (installable)                     │ │
│  │  • Responsive breakpoints                         │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│               SUPABASE (Backend Services)               │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Authentication                                    │ │
│  │  • Email/Password                                  │ │
│  │  • OAuth (Google, etc) - optional                 │ │
│  │  • Password reset                                 │ │
│  │  • JWT tokens                                     │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database                              │ │
│  │  • Users (managed by Supabase Auth)               │ │
│  │  • Accounts                                       │ │
│  │  • Transactions                                   │ │
│  │  • Debts                                          │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Row Level Security (RLS)                         │ │
│  │  • Users only see their own data                  │ │
│  │  • Automatic permission enforcement               │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Real-time Subscriptions (optional)               │ │
│  │  • Live data updates across devices               │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 HOSTING (Vercel)                        │
│  • Automatic deployments from Git                      │
│  • Edge network (fast globally)                        │
│  • HTTPS by default                                    │
│  • Preview deployments                                 │
└─────────────────────────────────────────────────────────┘
```

## Data Flow Example: Adding a Transaction

```
1. User fills form on mobile
   │
   ▼
2. Frontend validates input (React)
   │
   ▼
3. Supabase client sends data
   │
   ▼
4. Supabase Auth checks JWT token
   │
   ▼
5. RLS policy verifies user owns this account
   │
   ▼
6. Transaction inserted into PostgreSQL
   │
   ▼
7. Real-time update sent to all user's devices
   │
   ▼
8. UI updates instantly (optimistic update)
```

## Database Schema

```
┌─────────────┐
│   users     │ (managed by Supabase Auth)
└─────────────┘
       │
       │ user_id (FK)
       ▼
┌─────────────┐
│  accounts   │
│─────────────│
│ id (PK)     │
│ user_id     │
│ name        │
│ type        │
│ balance     │
└─────────────┘
       │
       │ account_id (FK)
       ▼
┌─────────────┐
│transactions │
│─────────────│
│ id (PK)     │
│ user_id     │
│ account_id  │
│ type        │
│ amount      │
│ date        │
│ recurring   │
└─────────────┘

┌─────────────┐
│   debts     │
│─────────────│
│ id (PK)     │
│ user_id     │
│ name        │
│ balance     │
│ min_payment │
└─────────────┘
```

## Technology Choices Explained

### Frontend: Next.js 14
✅ Server-side rendering (fast initial load)
✅ App Router (modern, clean structure)
✅ Automatic code splitting
✅ Easy deployment to Vercel
✅ Great TypeScript support

### Styling: Tailwind CSS
✅ Mobile-first utilities
✅ No CSS files to manage
✅ Consistent design system
✅ Small bundle size
✅ Fast development

### Backend: Supabase
✅ Free tier (perfect for MVP)
✅ Real-time subscriptions
✅ Built-in auth
✅ Automatic API generation
✅ Row-level security
✅ No server management

### Hosting: Vercel
✅ Free tier
✅ Automatic HTTPS
✅ Deploy via Git push
✅ Edge network (fast)
✅ Preview deployments

## Scaling Path

### MVP (Now)
- Single user accounts
- Manual data entry
- Basic calendar views
- Up to ~100 users

### Growth Phase (3-6 months)
- Shared family accounts
- Bank account sync (Plaid)
- Mobile apps (React Native)
- ~1,000 users

### Scale Phase (1 year+)
- Multi-tenancy
- Advanced analytics
- Custom integrations
- 10,000+ users

## Security Features

✅ All data encrypted in transit (HTTPS)
✅ Passwords hashed (Supabase Auth)
✅ Row-level security prevents data leaks
✅ JWT tokens expire automatically
✅ No credit card data stored (use Stripe)
✅ Environment variables for secrets

## Cost Breakdown (Monthly)

**Free Tier (0-1,000 users)**
- Vercel: Free
- Supabase: Free
- Domain: $12/year
- Total: ~$1/month

**Growth Tier (1,000-10,000 users)**
- Vercel Pro: $20
- Supabase Pro: $25
- Domain: $12/year
- Total: ~$46/month

**Scale Tier (10,000+ users)**
- Vercel Enterprise: ~$200
- Supabase Enterprise: ~$200
- Total: ~$400/month

Revenue from 10,000 users at $5/mo = $50,000/mo
Profit: ~$49,600/mo 💰
