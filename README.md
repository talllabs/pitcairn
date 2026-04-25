# Pitcairn Comms Hub

A magic-link authenticated social media content calendar for the Pitcairn Island tourism team.

**Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · Supabase (Postgres + Auth) · Cloudinary · Vercel

---

## Setup

### 1. Clone & install

```bash
git clone <repo-url>
cd pitcairn
npm install
```

### 2. Supabase — create project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In **SQL Editor**, run the following:

```sql
create table posts (
  id uuid primary key default gen_random_uuid(),
  month text not null,
  date_label text,
  title text not null,
  caption text,
  status text check (status in ('needs_content','pending','ready','posted')) default 'needs_content',
  asset_needed text,
  format text check (format in ('photo','video','photo_video')),
  provider text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table photos (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  cloudinary_url text not null,
  cloudinary_public_id text not null,
  uploaded_at timestamptz default now()
);

create table suggestions (
  id uuid primary key default gen_random_uuid(),
  proposed_date text,
  theme text not null,
  notes text,
  submitted_by_name text,
  created_at timestamptz default now()
);
```

3. Under **Authentication → Providers**, make sure **Email** is enabled.
4. Under **Authentication → URL Configuration**, set:
   - **Site URL**: `https://your-vercel-domain.vercel.app` (update after deploying)
   - **Redirect URLs**: add `https://your-vercel-domain.vercel.app/auth/callback` and `http://localhost:3000/auth/callback`
5. Under **Authentication → Settings**, disable "Enable email confirmations" and disable public signups.
6. Under **Authentication → Users**, manually invite these five emails:
   - `ally.labriola@gmail.com`
   - `comms@pitcairn.gov.pn`
   - `administrator@pitcairn.gov.pn`
   - `tourism@pitcairn.gov.pn`
   - `GM-External@pitcairn.gov.pn`

### 3. Supabase env vars

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → **Settings → API** → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → **Settings → API** → `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → **Settings → API** → `service_role` key (**keep secret — server only**) |

### 4. Cloudinary — create account & get keys

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier is plenty).
2. From the **Dashboard** home page:

| Variable | Where to find it |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard → top of the page, labelled "Cloud name" |
| `CLOUDINARY_API_KEY` | Cloudinary Dashboard → API Keys section |
| `CLOUDINARY_API_SECRET` | Cloudinary Dashboard → API Keys section (click reveal) |

### 5. Fill in `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=AbcDefGhiJklMnoPqrStuVwx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 6. Seed the database

```bash
npx tsx scripts/seed.ts
```

This inserts 31 pre-written posts across April–September 2026 and an Evergreen section.

### 7. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), enter one of the five authorised emails, click the magic link in your inbox.

---

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import the project in [vercel.com](https://vercel.com).
3. Add all six environment variables in **Project → Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `NEXT_PUBLIC_SITE_URL` → set to your Vercel URL, e.g. `https://pitcairn-comms-hub.vercel.app`
4. Deploy. After first deploy, go back to Supabase and update the Site URL and redirect URL to the Vercel domain.

---

## Pages

| Route | Description |
|---|---|
| `/` | Magic link login |
| `/calendar` | Posts grouped by month with filter tabs |
| `/post/[id]` | Post detail — edit caption, status, upload photos |
| `/suggest` | Submit a post suggestion |
| `/admin` | View all suggestions (auth protected) |

## API Routes

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload image to Cloudinary, insert `photos` row |
| `DELETE` | `/api/upload` | Delete from Cloudinary and `photos` table |
