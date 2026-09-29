# Bharath Waj K R · Portfolio

Production portfolio for Bharath Waj K R, focused on applied AI, backend systems, and full-stack engineering.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Radix UI primitives
- Node.js + Express contact API
- PostgreSQL
- Resend
- Render

## Repository layout

```text
.
├── src/                 # Portfolio frontend
│   ├── components/      # UI and contact workflow
│   └── App.tsx          # Portfolio composition and project data
├── server/              # Contact automation API
├── public/              # Public frontend assets
├── photo.png            # Source portrait
├── resume.pdf           # Public résumé
├── package.json         # Frontend dependencies and scripts
└── vite.config.ts       # Vite build configuration
```

## Local development

```bash
npm ci
npm run check
npm run build
```

For the contact API:

```bash
cd server
npm ci
npm start
```

## Environment

The API keeps database, email, dashboard, and model-provider credentials server-side.

Required API variables:

- `DATABASE_URL`
- `OWNER_EMAIL`
- `RESEND_API_KEY`
- `ALLOWED_ORIGIN`

Optional API variables:

- `RESEND_FROM_EMAIL`
- `GROQ_API_KEY`
- `GROQ_MODEL`
- `DASHBOARD_USER`
- `DASHBOARD_PASSWORD`
- `DEMO_MODE`

Frontend variables:

- `VITE_CONTACT_API_URL`
- `VITE_CONTACT_DASHBOARD_URL`

Only public values belong in `VITE_*` variables.

## Deployment

The frontend and contact API are separate Render services. Keep each service's production branch configuration explicit and synchronized with the intended production commit.

## Security

Never commit `.env` files, credentials, database URLs, or API keys. Rotate credentials that have ever been exposed outside the secret store. Lead data and the dashboard are private application data.

## Quality gate

Before shipping:

```bash
npm ci
npm run check
npm run build
```

For backend changes, also run the API locally and exercise health and contact validation paths.

Production portfolio claims should describe measured or verified behavior, not aspirational targets.
