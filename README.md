# KamerLark

## Deploy to Vercel (fast + free subdomain)

1. Push to GitHub (public or private)

- Ensure the repo contains this project (Next.js App Router).

2. Create a Vercel project

- Import from GitHub.
- Framework preset: Next.js (auto-detected).
- Root directory: repository root.

3. Configure environment variables (Project → Settings → Environment Variables)

- Add the Firebase envs using the keys from `.env.local.example`:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_DB_URL` (optional if unused)
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
  - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (optional)

4. Firebase console updates

- Auth → Settings → Authorized domains: add your `<project>.vercel.app` domain and any custom domain.
- Firestore → Indexes: create any required composite indexes (e.g., supportTickets: status asc + createdAt desc).
- Rules: deploy production Firestore Rules.

5. Deploy

- Vercel will build and deploy; you’ll get `https://<project>.vercel.app`.

## Image domains

If using Firebase Storage or external images, ensure `next.config.js` includes the domains under `images.domains`.

## Local development

- Create `.env.local` from `.env.local.example` and fill values.
- Run `npm run dev`.

## Notes

- Search page defaults to no sort/filters unless you pass query params.
- Home “See more accommodations” links to `/search?view=all`.
  This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
