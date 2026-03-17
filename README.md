# NewsFlow CMS v3

A fully serverless, dynamic, and SEO-optimized News Content Management System and AI Pipeline powered by Firebase and modern Web APIs.

## 🚀 Features
- **Auto Content Pipeline:** Fetch, translate, rewrite, and publish articles using the top 6 AI Providers (Claude, GPT, Gemini, Groq, Mistral, Cohere).
- **SEO Ready:** Complete History API slug routing (`?post=title-slug`), dynamic Meta/OpenGraph tags, automatic internal category linking, and a 1-click `sitemap.xml` generator.
- **Performance:** Optimized Firebase Database loading (`limitToLast`, `.on("child_added")`), image lazy-loading, and frontend pagination.
- **Secure:** Enforced Firebase database rules to protect API quotas. XSS-safe DOM node rendering.

---

## 🛠️ Setup Instructions (Firebase)

To make this site live and functional, you need to connect it to a free Firebase project.

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and name it (e.g., `NewsFlow`).
3. (Optional) Enable Google Analytics during setup.

### 2. Enable Authentication
1. Inside your Firebase project, go to **Build > Authentication**.
2. Click **Get Started**, then go to the **Sign-in method** tab.
3. Enable **Email/Password**.
4. Go to the **Users** tab and click **Add User**. Create an Admin email and password (you will use this to log into the CMS).

### 3. Enable Realtime Database
1. Go to **Build > Realtime Database**.
2. Click **Create Database** (choose a location close to your audience).
3. Start in **Locked Mode**.

### 4. Connect the Code to Firebase (`firebase.js`)
1. In the Firebase console sidebar, click the **Gear Icon (Project Settings)**.
2. Scroll down to "Your apps" and click the **Web icon (</>)** to add a web app.
3. Register the app. Firebase will give you a configuration object (`firebaseConfig`).
4. Open the `firebase.js` file in your local project folder.
5. Replace the placeholder values in the `FIREBASE_CONFIG` object with your actual keys from step 3.

---

## 🔒 Security Rules Setup

You need to apply the rules provided in `database.rules.json` to your Firebase project to secure your data from unauthorized edits.

### Method A (Via Firebase Console):
1. Go to **Realtime Database > Rules**.
2. Delete the existing rules and copy-paste the exact contents of your local `database.rules.json` file.
3. Click **Publish**.

### Method B (Via Firebase CLI):
If you deploy your site using the Firebase CLI (see Hosting section below), it will automatically apply the rules from your local `database.rules.json` file based on your `firebase.json` configuration.

---

## 🌐 Hosting & Deployment

The easiest way to host this website globally for free is via **Firebase Hosting**.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed before proceeding.

### 1. Install Firebase CLI
Open your terminal (Command Prompt, PowerShell, or VS Code Terminal) and run:
`npm install -g firebase-tools`

### 2. Login to Firebase
`firebase login`
This will open a browser window for you to log into your Google/Firebase account.

### 3. Initialize Project
Navigate to your project folder in the terminal:
`cd path/to/NewsFlow-CMS-v3`

Run the initialization command:
`firebase init`

Answer the prompts exactly as follows:
- **Which features do you want to set up?**
  Select `Realtime Database` and `Hosting` (use Spacebar to select, Enter to confirm).
- **Project Setup:** Select `Use an existing project` and pick your Firebase project.
- **What file should be used for Database Rules?** Keep default (`database.rules.json`) and answer `No` if it asks to overwrite it.
- **What do you want to use as your public directory?** Type `.` and hit Enter.
- **Configure as a single-page app (rewrite all urls to /index.html)?** Type `Yes` (`y`).
- **Set up automatic builds and deploys with GitHub?** Type `No` (`n`).
- **File index.html already exists. Overwrite?** **VERY IMPORTANT: Type `No` (`n`)**!

### 4. Deploy!
Run the deployment command:
`firebase deploy`

Within a few seconds, Firebase will give you a **Hosting URL** (e.g., `https://your-project.web.app`). Your NewsFlow CMS is now LIVE! 🎉

*(You can later attach a custom domain like `mywebsite.com` for free from the Firebase Hosting console).*
