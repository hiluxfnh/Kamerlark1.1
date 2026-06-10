# KamerLark Operator Guide — the things only you can do

Work through these in order. Steps 1–3 close live security holes; do them today.
(Console layouts change occasionally — if a menu item moved, use the search box
at the top of each console.)

---

## 1. Deploy the Firestore + Storage rules  (~10 min, CRITICAL)

The rules in this repo were never deployable before (invalid syntax), so
whatever is live right now is unknown — possibly wide-open "test mode".

1. Open a terminal in the project folder.
2. Install the Firebase CLI (once):
   ```
   npm install -g firebase-tools
   ```
3. Log in:
   ```
   firebase login
   ```
   A browser window opens → choose the Google account that owns the
   **kamerlark1** Firebase project → click **Allow**.
4. Verify the CLI sees the project:
   ```
   firebase projects:list
   ```
   You should see `kamerlark1` in the list.
5. Deploy:
   ```
   firebase deploy --only firestore,storage
   ```
   Success looks like: `✔ firestore: released rules` and
   `✔ storage: released rules`.
6. Verify in the console: https://console.firebase.google.com →
   click **kamerlark1** → left sidebar **Build → Firestore Database** →
   **Rules** tab. The text shown must match `firestore.rules` in this repo
   (look for `function isAdmin()` near the top). Repeat for
   **Build → Storage → Rules**.

> If Storage was never enabled, the deploy may say so — in the console go to
> **Build → Storage → Get started → Start in production mode → Done**, then
> re-run step 5.

---

## 2. Make yourself admin  (~10 min)

Admin access now requires a Firebase "custom claim". One-time setup:

**A. Find your UID**
1. https://console.firebase.google.com → **kamerlark1** →
   **Build → Authentication** → **Users** tab.
2. Find your own account (your email) → the **User UID** column →
   hover and click the copy icon.

**B. Download a service-account key**
1. Click the **gear icon** (top of left sidebar) → **Project settings**.
2. **Service accounts** tab → button **Generate new private key** →
   **Generate key**. A `.json` file downloads.
3. Move it somewhere OUTSIDE this project folder, e.g.
   `C:\Users\hilux\secrets\kamerlark1-sa.json`. **Never commit it.**

**C. Grant the claim**
```
npm install --no-save firebase-admin
node scripts/set-admin-claim.js C:\Users\hilux\secrets\kamerlark1-sa.json <YOUR-UID>
```
Expected output: `Granted admin claim for <uid>.`

**D. Refresh your session** — sign out and back in to the app. `/admin` and
the profile tickets widget now work for you, and Firestore lets you read
support tickets.

---

## 3. Rotate the MapTiler key + restrict the Firebase key  (~15 min)

These were committed to git history, so treat them as public.

**MapTiler**
1. https://cloud.maptiler.com → sign in → left sidebar **API Keys**.
2. Find the key starting `TIM0jC...` → click it → **Delete** (or **Regenerate**).
3. Click **New key** → name it `kamerlark-prod` → under **Allowed HTTP
   origins** add your production domain(s) and `http://localhost:3000` →
   **Save** → copy the new key.
4. Put the new key in `.env.local` (`NEXT_PUBLIC_MAPTILER_KEY=...`) and later
   in Vercel env vars (step 4). The old key in `.env`/`.env.production` is
   dead — update those files too or delete them locally.

**Firebase API key** (it's public by design, but restrict where it works)
1. https://console.cloud.google.com → top project picker → choose
   **kamerlark1**.
2. Burger menu ☰ → **APIs & Services → Credentials**.
3. Under **API Keys**, click **Browser key (auto created by Firebase)**.
4. Under **Application restrictions** select **Websites** (a.k.a. HTTP
   referrers) → **Add** each of:
   - `localhost:3000/*`
   - `kamerlark1.firebaseapp.com/*`
   - `<your-app>.vercel.app/*` (after step 4)
   - your custom domain, if any: `yourdomain.com/*`
5. Click **Save**. (Takes up to 5 min to apply.)

---

## 4. Deploy to Vercel  (~20 min)

1. Push the repo to GitHub (after the commits in this session):
   ```
   git remote -v        # check you have a remote; if not:
   git remote add origin https://github.com/<you>/kamerlark.git
   git push -u origin main
   ```
2. https://vercel.com → sign in with GitHub → **Add New… → Project** →
   **Import** your kamerlark repo.
3. Framework preset auto-detects **Next.js** — leave Root Directory as `./`.
4. Expand **Environment Variables** and add (values from your local `.env`):
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
   - `NEXT_PUBLIC_MAPTILER_KEY` (the NEW rotated key)
5. Click **Deploy**. You get `https://<project>.vercel.app`.
6. Allow that domain to sign in:
   Firebase Console → **Build → Authentication** → **Settings** tab →
   **Authorized domains** → **Add domain** → enter
   `<project>.vercel.app` → **Add**.
7. Add the same domain to the API-key referrer list (step 3, Firebase key)
   and the MapTiler origin list.
8. Test on the live URL: sign in with Google, open a room, send a chat
   message, submit a help ticket.

---

## 5. Enable App Check  (~15 min, do AFTER step 4 works)

App Check blocks abusive non-app clients from your Firestore/Storage.
The client code is already wired — it activates when the env var exists.

1. Firebase Console → **Build → App Check** (under "Build" or search
   "App Check") → **Get started**.
2. Under **Apps**, click your web app → **Register** →
   provider: **reCAPTCHA v3** → it shows/asks for a reCAPTCHA site key:
   - If prompted, click the link to https://www.google.com/recaptcha/admin/create →
     label `kamerlark` → type **reCAPTCHA v3** → domains: your vercel domain +
     `localhost` → **Submit** → copy the **Site key** (and the **Secret key**
     into the App Check registration form).
3. Copy the **site key** into:
   - `.env.local`: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY=<site key>`
   - Vercel → your project → **Settings → Environment Variables** → add the
     same → **Redeploy** (Deployments tab → ⋯ on latest → Redeploy).
4. **Wait — do not enforce yet.** Use the app normally for a day, then in
   App Check → **APIs** tab check that **Cloud Firestore** shows mostly
   "Verified" requests.
5. Only then: App Check → **APIs** → **Cloud Firestore** → **Enforce**.
   Repeat for **Cloud Storage**. (Enforcing too early = every user blocked.)

---

## 6. Purge secrets from git history  (~15 min, BEFORE making repo public)

The old keys live in old commits. If the repo will ever be public/shared:

1. Install: `pip install git-filter-repo` (needs Python; or
   `pipx install git-filter-repo`).
2. Make a backup copy of the whole project folder first (plain file copy).
3. From the project folder:
   ```
   git filter-repo --invert-paths --path .env --path .env.production --path server/.env --force
   ```
4. This rewrites history; if you already pushed to GitHub before, re-add the
   remote and force-push:
   ```
   git remote add origin https://github.com/<you>/kamerlark.git
   git push --force --all origin
   ```
5. If the repo was previously public, assume the keys are compromised
   regardless — rotation (step 3) is what actually protects you.

---

## 7. Composite indexes (only if search complains)

If the search page logs `The query requires an index`, deploy the bundled
index definitions:
```
firebase deploy --only firestore:indexes
```
or click the link inside the error message — Firebase pre-fills the index
creation form; click **Create index** and wait for "Enabled".

---

## Quick verification checklist when done

- [ ] Firestore Rules tab in console shows `function isAdmin()` text
- [ ] Storage Rules tab shows the path-scoped rules
- [ ] Your account can open `/admin` after re-login
- [ ] A second (non-admin) test account CANNOT open `/admin` or read others' bookings
- [ ] Old MapTiler key returns 403 on map tiles; new one works
- [ ] Live Vercel site: login, booking, chat, help ticket all work
