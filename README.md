# CV Maker

Build professional, ATS-friendly resumes in minutes. A fast, privacy-first web app with curated
templates, live preview, and one-click PDF export.

## Features

- Modern, responsive templates (10+ styles)
- Real-time live preview as you edit
- AI-powered wording suggestions
- Save, manage, and iterate on multiple resumes in the cloud
- Export to high-quality PDF
- Secure authentication via the Express API (bcrypt + revocable JWT sessions)
- Responsive: works on desktop, tablet, and mobile

## Tech stack

- **Next.js 16** + **React 19** + **TypeScript**
- **TanStack React Query** for data fetching
- **React Hook Form** + **Zod** for type-safe forms and validation
- **Tailwind CSS** (shadcn/ui components) for styling
- **Express** + **PostgreSQL** for authentication, data storage, and administration
- **react-pdf** / **@react-pdf/renderer** for PDF generation
- **React Router v6** for routing

## Development

```bash
# install (npm)
npm ci

# run dev server
npm run dev
# open http://localhost:3000

# lint / typecheck
npm run lint        # eslint
npx tsc --noEmit    # typescript checks

# production build
npm run build
```

### Environment

Copy `.env.example` to `.env`. Copy the backend values into `server/.env`:

```
VITE_API_URL=http://localhost:3001/api
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cv_maker
JWT_SECRET=<at-least-32-random-characters>
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:3000
```

## Project Structure

```
src/
  App.tsx          # routes (/, /auth, /dashboard, /admin/*)
  views/           # Landing, Auth, Dashboard, admin pages, 404
  components/      # UI blocks: cv forms, builder, sidebar, admin
  contexts/        # AuthContext + CVContext (state)
  integrations/api/  # typed API client
  hooks/           # shared React hooks
  lib/             # helpers
public/            # static assets (favicon, logo, manifest, sw)
```

## Backend and database setup

```bash
cd server
npm ci
npm run db:setup
npm run dev
```

The setup command applies additive, idempotent schema changes. Password-reset delivery must
be connected to an email provider in production; raw reset tokens are never logged.

## Deploying

1. Build:
   ```bash
   npm run build
   ```
2. Run `npm start` or deploy the Next.js standalone output to a compatible host.
3. Configure your domain's DNS and HTTPS.
4. Proxy `/api` to the backend and configure the production environment values above.

## License

MIT
