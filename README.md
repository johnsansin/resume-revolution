# CV Maker

Build professional, ATS-friendly resumes in minutes. A fast, privacy-first web app with curated
templates, live preview, and one-click PDF export.

## Features

- Modern, responsive templates (10+ styles)
- Real-time live preview as you edit
- AI-powered wording suggestions
- Save, manage, and iterate on multiple resumes in the cloud
- Export to high-quality PDF
- Secure authentication via **Supabase** (email/password + password reset)
- Responsive: works on desktop, tablet, and mobile

## Tech stack

- **React 18** + **TypeScript** + **Vit**e for a snappy dev/build experience
- **TanStack React Query** for data fetching
- **React Hook Form** + **Zod** for type-safe forms and validation
- **Tailwind CSS** (shadcn/ui components) for styling
- **Supabase** for auth, database, storage, and (optional) edge functions
- **react-pdf** / **@react-pdf/renderer** for PDF generation
- **React Router v6** for routing

## Development

```bash
# install (npm)
npm ci

# run dev server
npm run dev
# open http://localhost:8080

# lint / typecheck
npm run lint        # eslint
npx tsc --noEmit    # typescript checks

# production build
npm run build
```

### Environment

Copy `.env.example` (if provided) to `.env` and fill in your Supabase project values:

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key / publishable key>
VITE_SUPABASE_PROJECT_ID=<project-id>
```

## Project Structure

```
src/
  App.tsx          # routes (/, /auth, /dashboard, /admin/*)
  pages/           # Landing, Auth, Dashboard, admin pages, 404
  components/      # UI blocks: cv forms, builder, sidebar, admin
  contexts/        # AuthContext + CVContext (state)
  integrations/supabase/  # client, types
  hooks/           # shared React hooks
  lib/             # helpers
public/            # static assets (favicon, logo, manifest, sw)
```

## Supabase setup

The project uses the Supabase JS client. Make sure your Supabase project has the expected
schema (tables like `profiles`, CV-related rows, etc.) and that Auth is configured with email
confirmations / password recovery as needed.

## Deploying

1. Build:
   ```bash
   npm run build
   ```
2. Serve the static `dist/` from any static host (Vercel, Netlify, Cloudflare Pages, S3, nginx, etc.)
3. Configure your domain's DNS and HTTPS.
4. Ensure `VITE_SUPABASE_*` env vars point to your production Supabase project when building.

## License

MIT
