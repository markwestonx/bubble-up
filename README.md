# 🎯 BubbleUp - Agile Backlog Management

A modern, real-time agile backlog management tool built with Next.js 15, Supabase, and Tailwind CSS. Designed for teams to manage user stories, epics, and sprint planning with drag-and-drop functionality and persistent storage.

## ✨ Features

- **58 Pre-loaded User Stories** across 11 epics (customizable)
- **Drag-and-Drop Reordering** with @dnd-kit
- **Inline Editing** for all fields (story, details, criteria, notes, owner, dependencies)
- **Status Filtering** with multi-select (NOT_STARTED, IN_PROGRESS, TESTING, BLOCKED, COMPLETE)
- **Priority Management** (CRITICAL, HIGH, MEDIUM, LOW)
- **Epic Organization** with colored visual accents
- **Real-time Sync** via Supabase
- **Multi-team Support** with Row Level Security
- **Expandable Details** sections per story
- **Persistent Storage** - survives server restarts and browser changes
- **Responsive Design** - works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works great)
- Git (optional, for version control)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

#### Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: bubbleup (or your choice)
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to you
4. Wait for project to finish provisioning (~2 minutes)

#### Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Open the file `SUPABASE_SCHEMA.sql` from this project
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click **Run** button
6. You should see "Success. No rows returned" - this is correct!

#### Get Your API Keys

1. In Supabase dashboard, go to **Project Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://yourproject.supabase.co`
   - **Anon/Public Key**: `eyJhbG...` (long string)

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
bubbleup/
├── app/
│   ├── page.tsx              # Main backlog board (ported from Sales Genie)
│   └── layout.tsx            # Root layout with React Query provider
├── lib/
│   ├── supabase.ts           # Supabase client configuration
│   └── types.ts              # TypeScript types for database
├── public/                   # Static assets
├── SUPABASE_SCHEMA.sql       # Database schema (run this in Supabase)
├── .env.local                # Your Supabase credentials (create this)
├── .env.example              # Template for environment variables
├── package.json              # Dependencies
├── tailwind.config.ts        # Tailwind CSS configuration
└── README.md                 # This file
```

## 🗄️ Database Schema

The database uses 4 main tables:

### `teams`
- Multi-tenancy support
- Each team has its own backlog

### `team_members`
- Links users to teams
- Supports roles: owner, admin, member

### `epics`
- Organize stories into epics
- Each epic has a color for visual distinction

### `stories`
- The actual user stories
- Fields: story, details, acceptance_criteria, notes, owner, dependencies
- Status: NOT_STARTED, IN_PROGRESS, TESTING, BLOCKED, COMPLETE
- Priority: CRITICAL, HIGH, MEDIUM, LOW

## 🚢 Deployment to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier works)

### Steps

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/bubbleup.git
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables**:
   - In Vercel project settings, go to **Environment Variables**
   - Add:
     - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - Click **Save**

4. **Deploy**:
   - Click "Deploy"
   - Wait ~2 minutes
   - Your app is live at `https://your-project.vercel.app`!

## 🐛 Troubleshooting

### "Missing Supabase environment variables"

**Solution**: Make sure you created `.env.local` with the correct values from your Supabase project.

### No data showing up

**Solution**:
1. Check you created a team in Supabase
2. Check you added yourself as a team member
3. Check you're signed in with the correct user
4. Check browser console for errors

### Drag-and-drop not working

**Solution**: Make sure all dependencies are installed. Run `npm install` again.

## 📚 Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Supabase** - Backend-as-a-Service (PostgreSQL + Auth + Real-time)
- **Tailwind CSS** - Utility-first CSS
- **@tanstack/react-query** - Data fetching and caching
- **@dnd-kit** - Drag-and-drop functionality
- **lucide-react** - Icons
- **Vercel** - Hosting and deployment

## 📝 License

MIT License - feel free to use this for your team or modify as needed.

## 🙏 Credits

- Backlog UI originally created for Sales Genie project
- Ported to standalone app for team-wide use

---

**Ready to start managing your backlog like a pro!** 🚀
