# NewsFlow CMS v3

A fully serverless, dynamic, and SEO-optimized News Content Management System and AI Pipeline powered by Firebase and modern Web APIs.

---

## 🚀 Features

- **Auto Content Pipeline** — Fetch, translate, rewrite, and publish articles using 6 AI providers (Claude, GPT-4, Gemini, Groq, Mistral, Cohere)
- **SEO Ready** — History API slug routing (`?post=title-slug`), dynamic Meta/OpenGraph tags, automatic internal linking, 1-click `sitemap.xml` generator
- **Real-time Sync** — Firebase Realtime Database with live listeners (`child_added`, `child_changed`, `child_removed`)
- **Offline Fallback** — Full localStorage fallback when Firebase is not configured or unreachable
- **Secure** — Firebase database rules lock all writes to authenticated admins only
- **Performance** — Paginated grid, lazy-loaded images, Firebase `limitToLast(50)` queries

---

## 📁 File Structure

```
newsflow-cms/
├── index.html          ← Main news site (frontend + CMS)
├── pipeline.html       ← AI content pipeline tool
├── deploy.html         ← Deployment guide (visual)
├── guide.html          ← Admin guide
├── firebase.js         ← Firebase SDK loader + all DB/Auth functions
├── firebase.json       ← Firebase CLI config (hosting + database rules)
├── database.rules.json ← Firebase Realtime Database security rules
├── sitemap.xml         ← SEO sitemap (update YOUR-DOMAIN.com)
├── robots.txt          ← SEO robots file (update YOUR-DOMAIN.com)
└── README.md           ← This file
```

> ⚠️ **Important:** The database rules file must be named exactly `database.rules.json` (with a dot, not an underscore). If your file system saved it as `database_rules.json`, rename it before deploying.

---

## 🔧 Bug Fixes Applied (v3.0.1)

The following bugs were identified and fixed from v3.0:

| # | File | Bug | Fix |
|---|------|-----|-----|
| 1 | `index.html` | Google Analytics placeholder `G-XXXXXXXXXX` fires real failing HTTP requests on every page load | GA block commented out — uncomment and replace ID when ready |
| 2 | `index.html` | `setMetaTag('description', 'og:description', ...)` created one malformed `<meta>` tag with both `name` and `property` attributes set — only one attribute is recognized by search crawlers | Split into two separate calls: `setMetaTag('description', null, ...)` and `setMetaTag(null, 'og:description', ...)` |
| 3 | `index.html` | `Date.now() + Math.random()` produces float IDs (e.g. `1710000000000.4821`) — Firebase database paths cannot contain `.` — silently breaks all pipeline→Firebase syncing | Changed to `Date.now() + Math.floor(Math.random() * 10000)` |
| 4 | `index.html` | `checkPipelineQueue` and its `setInterval` called twice at the bottom of the script — double polling, double toast notifications | Removed the duplicate bottom-level `setInterval` call |
| 5 | `pipeline.html` | Same float ID bug at 2 locations — breaks pipeline article Firebase sync | Same integer-only fix applied to both occurrences |
| 6 | `firebase.json` | Missing `"database"` key — `firebase deploy` would host the site but silently skip applying `database.rules.json` — leaving the database in its previous (possibly locked/insecure) state | Added `"database": { "rules": "database.rules.json" }` |
| 7 | `robots.txt` / `sitemap.xml` | `yourdomain.com` placeholder was never replaced with a real domain | Replaced with clearly labelled `YOUR-DOMAIN.com` markers with comments |

---

## ⚙️ Setup — Part 1: Firebase Project

### Step 1 — Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com/)
2. Click **Add Project** → name it (e.g. `newsflow-cms`) → Continue
3. Disable Google Analytics for now (you can enable it later) → **Create Project**

### Step 2 — Enable Authentication

1. In the left sidebar go to **Build → Authentication**
2. Click **Get Started**
3. Go to the **Sign-in method** tab → click **Email/Password** → Enable it → Save
4. Go to the **Users** tab → click **Add user**
5. Enter your admin email and a strong password → **Add user**
   > 🔑 Save these credentials — you will use them to log in to the CMS from the website.

### Step 3 — Enable Realtime Database

1. In the left sidebar go to **Build → Realtime Database**
2. Click **Create Database**
3. Choose a server location close to your audience (e.g. `us-central1` or `europe-west1`)
4. Select **Start in locked mode** → **Enable**

### Step 4 — Apply Database Security Rules

**Method A — Firebase Console (easiest):**
1. Go to **Realtime Database → Rules** tab
2. Delete everything in the editor
3. Copy the full contents of your local `database.rules.json` file and paste it in
4. Click **Publish**

**Method B — Firebase CLI (automatically applied on deploy):**
The rules are applied automatically when you run `firebase deploy` because `firebase.json` now references `database.rules.json`. No extra steps needed.

### Step 5 — Get Your Firebase Config

1. In the left sidebar click the **Gear icon → Project Settings**
2. Scroll down to **Your apps** section
3. Click the **Web icon (`</>`)** to register a web app
4. Give it a nickname (e.g. `newsflow-web`) → click **Register app**
5. Firebase will show you a `firebaseConfig` object like this:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "newsflow-cms.firebaseapp.com",
  databaseURL: "https://newsflow-cms-default-rtdb.firebaseio.com",
  projectId: "newsflow-cms",
  storageBucket: "newsflow-cms.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

6. Open `firebase.js` in your project folder
7. Replace the placeholder values in `FIREBASE_CONFIG` with your real values:

```js
// ★★★ Replace all YOUR_... values with your real Firebase config ★★★
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSy...",              // ← your real apiKey
  authDomain:        "newsflow-cms.firebaseapp.com",
  databaseURL:       "https://newsflow-cms-default-rtdb.firebaseio.com",
  projectId:         "newsflow-cms",
  storageBucket:     "newsflow-cms.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123"
};
```

> ⚠️ Never commit your real `firebase.js` to a **public** repository without first enabling Firebase App Check or restricting your API key in the [Google Cloud Console](https://console.cloud.google.com/) to your domain only.

---

## ⚙️ Setup — Part 2: Google Analytics (Optional)

1. Go to [analytics.google.com](https://analytics.google.com/) and create a new property
2. Set up a Web data stream — enter your website URL
3. Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)
4. In `index.html`, find the commented-out Google Analytics block near the top of `<head>`
5. Uncomment it and replace both instances of `G-XXXXXXXXXX` with your real Measurement ID

---

## 🌐 Deployment — Option A: GitHub Pages (Free, Recommended)

GitHub Pages is the simplest way to host this project — free, no server needed, automatic HTTPS.

### Step 1 — Update Domain Placeholders

Before uploading, replace `YOUR-DOMAIN.com` in these two files with your actual GitHub Pages URL (`yourusername.github.io/your-repo-name`):

- `sitemap.xml` — update the two `<loc>` URLs
- `robots.txt` — update the `Sitemap:` line

### Step 2 — Create GitHub Repository

1. Log in to [github.com](https://github.com/)
2. Click **+** → **New repository**
3. Name it (e.g. `newsflow-cms`) → set it to **Public** → click **Create repository**

### Step 3 — Upload Files

**Option A — Upload via browser (no Git needed):**
1. Inside your new repository, click **Add file → Upload files**
2. Drag and drop ALL project files:
   ```
   index.html
   pipeline.html
   deploy.html
   guide.html
   firebase.js         ← make sure config is filled in first
   firebase.json
   database.rules.json ← must be this exact filename (dot, not underscore)
   sitemap.xml
   robots.txt
   README.md
   ```
3. Scroll down → click **Commit changes**

**Option B — Push via Git terminal:**
```bash
git init
git add .
git commit -m "Initial deploy"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/newsflow-cms.git
git push -u origin main
```

### Step 4 — Enable GitHub Pages

1. In your repository, click **Settings** tab
2. In the left sidebar click **Pages**
3. Under **Build and deployment** → set **Source** to `Deploy from a branch`
4. Under **Branch** → select `main` (or `master`) → folder `/` (root) → click **Save**
5. Wait 1–2 minutes → refresh the page → your live URL will appear at the top (e.g. `https://yourusername.github.io/newsflow-cms/`)

### Step 5 — Fix Direct URL Routing (SPA Fix)

Because this is a Single Page App using `?post=slug` query-string routing, GitHub Pages needs a `404.html` fallback for direct link visits.

1. Make a copy of `index.html` and rename it `404.html`
2. Upload `404.html` to your repository
3. Now direct links like `https://yourusername.github.io/newsflow-cms/?post=my-article` will work correctly when shared

### Step 6 — Add Your Domain to Firebase (Required for Auth)

Firebase Authentication will refuse login requests from unauthorized domains.

1. Go to **Firebase Console → Build → Authentication → Settings → Authorized domains**
2. Click **Add domain**
3. Enter your GitHub Pages domain: `yourusername.github.io`
4. Click **Add**

---

## 🔥 Deployment — Option B: Firebase Hosting

Firebase Hosting gives you a cleaner URL, automatic SSL, and CDN — all free on the Spark plan.

### Step 1 — Install Firebase CLI

You need [Node.js](https://nodejs.org/) installed first (v16 or higher).

```bash
npm install -g firebase-tools
```

### Step 2 — Log In

```bash
firebase login
```

A browser window will open — log in with the Google account that owns your Firebase project.

### Step 3 — Initialize Project

Run this in your project folder:

```bash
firebase init
```

When prompted:
- **Which features?** → Select `Hosting` and `Database` using spacebar → Enter
- **Project?** → Select **Use an existing project** → choose your Firebase project
- **Database Rules file?** → Press Enter to accept `database.rules.json`
- **Public directory?** → Type `.` (a single dot — the project root) → Enter
- **Single-page app (rewrite all URLs to /index.html)?** → Type `y` → Enter
- **Set up automatic builds with GitHub?** → Type `N`

### Step 4 — Deploy

```bash
firebase deploy
```

This will:
- Upload all HTML/JS files to Firebase Hosting
- Apply `database.rules.json` to your Realtime Database
- Print your live URL (e.g. `https://newsflow-cms.web.app`)

### Step 5 — (Optional) Connect a Custom Domain

1. In Firebase Console go to **Hosting → Add custom domain**
2. Enter your domain name → follow the DNS verification steps
3. Firebase provides free SSL automatically

---

## 🔒 Firebase API Key Security

Your `firebase.js` API key **will be visible in your public GitHub repository**. This is normal for Firebase web apps — the key alone cannot be abused if you:

1. **Set API key restrictions** in [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials** → click your API key → under **Application restrictions** → select **HTTP referrers** → add your domain (e.g. `yourusername.github.io/*`)
2. **Keep database rules strict** — the `database.rules.json` included in this project ensures only authenticated admins can write data
3. **Enable Firebase App Check** (optional, advanced) for additional protection

---

## 📱 Using the CMS

Once deployed:

1. Visit your live URL
2. Click **Admin Login** (top right)
3. Enter the email and password you created in Firebase Authentication → Step 2
4. **+ New Post** button appears — click it to write and publish articles
5. Visit `your-url/pipeline.html` to use the AI auto-content pipeline

---

## 🗺️ Final Checklist Before Going Live

- [ ] `firebase.js` — all `YOUR_...` placeholders replaced with real Firebase config values
- [ ] `database.rules.json` — file is named with a **dot** (not underscore)
- [ ] `sitemap.xml` — `YOUR-DOMAIN.com` replaced with your real URL
- [ ] `robots.txt` — `YOUR-DOMAIN.com` replaced with your real URL
- [ ] Firebase Authentication — your hosting domain added to **Authorized domains**
- [ ] Database Rules — published via Console or deployed via CLI
- [ ] `404.html` — copy of `index.html` created (GitHub Pages only)
- [ ] Google Analytics — `G-XXXXXXXXXX` replaced if you want tracking

---

## 🛟 Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| "Admin Login" button does nothing | Firebase not initialized | Check browser console for Firebase errors; verify `firebase.js` config |
| Login says "Firebase not ready" | `firebase.js` loaded before SDK | Check network tab — Firebase CDN scripts must load successfully |
| Posts don't sync in real time | Database rules blocking reads | Check rules are published correctly |
| Direct links (`?post=slug`) show 404 | GitHub Pages SPA routing | Create `404.html` as a copy of `index.html` |
| Firebase deploy skips database rules | Wrong filename | Rename `database_rules.json` → `database.rules.json` |
| Auth error "domain not authorized" | Domain not whitelisted | Add your domain in Firebase Auth → Settings → Authorized domains |
| Pipeline articles don't save to Firebase | Float ID in post objects | Fixed in v3.0.1 — make sure you have the latest `index.html` and `pipeline.html` |

---

## 📄 License

MIT — free to use, modify, and redistribute.
