# Budget App

A mobile-first budget tracking app for families to manage bills, income, and debt.

## Features

- 📅 **Month/Week/Day Views** - Multiple calendar views to track your finances
- 💰 **Bill Tracking** - Keep track of recurring and one-time expenses
- 💵 **Income Management** - Log all income sources
- 🏦 **Account Balance** - Live checking account totals
- 📊 **Debt Tracking** - Monitor debts and minimum payments
- 📱 **Mobile First** - Designed for mobile, works great on desktop too
- ☁️ **Cloud Sync** - Your data syncs across all devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS (mobile-first)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Hosting**: Vercel (recommended)

## Getting Started

### 1. Clone and Install

```bash
cd budget-app
npm install
```

### 2. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > API and copy your project URL and anon key
4. Copy `.env.local.example` to `.env.local` and add your credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set Up Database

1. Go to your Supabase project > SQL Editor
2. Copy the contents of `lib/supabase/schema.sql`
3. Paste and run it in the SQL Editor

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
budget-app/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── transactions/      # Transaction management
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # Reusable UI components
│   └── calendar/          # Calendar views
├── lib/
│   ├── supabase/          # Supabase client & schema
│   └── utils/             # Utility functions
├── types/                 # TypeScript types
└── public/                # Static assets

```

## Building Features

### Phase 1 (MVP - Week 1-2)
- [x] Project setup
- [ ] Authentication (login/signup)
- [ ] Add/edit/delete transactions
- [ ] Month calendar view
- [ ] Basic dashboard

### Phase 2 (Week 3-4)
- [ ] Week/day views
- [ ] Running balance calculations
- [ ] Recurring transactions
- [ ] Account management

### Phase 3 (Future)
- [ ] Debt tracking
- [ ] Budget goals
- [ ] Notifications
- [ ] Export data
- [ ] Dark mode

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables (same as `.env.local`)
5. Deploy!

Your app will be live at `your-app.vercel.app`

## PWA (Install as App)

The app is configured as a Progressive Web App. Users can:
- On iOS: Safari > Share > Add to Home Screen
- On Android: Chrome menu > Add to Home Screen

## Monetization Ideas

- Freemium (basic features free, premium $5-10/mo)
- One-time purchase ($20-30 lifetime)
- White-label for financial advisors
- App store version (iOS/Android) with in-app purchase

## Contributing

This is a personal project, but feel free to fork and customize!

## License

MIT
