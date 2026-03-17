// ╔══════════════════════════════════════════════════════════════╗
// ║         firebase.js — NewsFlow CMS v3.0                     ║
// ║                                                              ║
// ║  SETUP:                                                      ║
// ║  1. console.firebase.google.com پر جائیں                    ║
// ║  2. Project → Web App → Config copy کریں                    ║
// ║  3. نیچے FIREBASE_CONFIG میں اپنی values ڈالیں             ║
// ║  4. یہ file GitHub پر upload کریں                           ║
// ╚══════════════════════════════════════════════════════════════╝

// ★★★ یہاں اپنا Firebase config ڈالیں ★★★
const FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL:       "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
// ★★★ اوپر والی values Firebase Console سے copy کریں ★★★

let _db          = null;
let _fbReady     = false;
let _configured  = FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY";
const _readyCBs  = [];

(function () {
  if (!_configured) {
    console.warn("firebase.js: config نہیں ڈالا — localStorage fallback");
    setTimeout(() => window.dispatchEvent(new Event("firebase-ready")), 100);
    return;
  }
  function loadScript(src, cb, errCb) {
    const s = document.createElement("script");
    s.src = src; s.onload = cb;
    s.onerror = errCb || (() => { console.error("Load failed:", src); setTimeout(() => window.dispatchEvent(new Event("firebase-ready")), 100); });
    document.head.appendChild(s);
  }
  loadScript(
    "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js",
    () => loadScript(
      "https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js",
      () => loadScript(
        "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js",
        _initFirebase,
        () => { console.error("Firebase Auth SDK failed"); setTimeout(() => window.dispatchEvent(new Event("firebase-ready")), 100); }
      ),
      () => { console.error("Firebase DB SDK failed"); setTimeout(() => window.dispatchEvent(new Event("firebase-ready")), 100); }
    )
  );
})();

function _initFirebase() {
  try {
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    _db = firebase.database();
    _fbReady = true;
    console.log("✅ NewsFlow Firebase Connected");
    window.dispatchEvent(new Event("firebase-ready"));
    _readyCBs.forEach(cb => { try { cb(); } catch(e){} });
  } catch (e) {
    console.error("Firebase init error:", e.message);
    setTimeout(() => window.dispatchEvent(new Event("firebase-ready")), 100);
  }
}

async function fbSavePost(post) {
  if (!_fbReady || !_db) { _fallbackSave(post); return { ok: false, fallback: true }; }
  try {
    const clean = JSON.parse(JSON.stringify({ ...post, updatedAt: Date.now() }, (k,v) => v === undefined ? null : v));
    // Use update to protect existing dynamic fields like views
    await _db.ref("posts/" + clean.id).update(clean);
    return { ok: true };
  } catch (e) {
    console.error("fbSavePost:", e.message);
    _fallbackSave(post);
    return { ok: false, error: e.message };
  }
}

async function fbIncrementView(id) {
  if (!_fbReady || !_db || !window.firebase) return;
  try {
    await _db.ref(`posts/${id}/views`).set(firebase.database.ServerValue.increment(1));
  } catch(e) { console.error("fbIncrementView:", e.message); }
}

async function fbLoadPosts() {
  if (!_fbReady || !_db) return _fallbackLoad();
  try {
    const snap = await _db.ref("posts").orderByChild("updatedAt").limitToLast(50).once("value");
    const data = snap.val() || {};
    return Object.values(data).sort((a, b) => (b.updatedAt||0) - (a.updatedAt||0));
  } catch (e) {
    console.error("fbLoadPosts:", e.message);
    return _fallbackLoad();
  }
}

function fbListenPosts(onAdded, onChanged, onRemoved) {
  if (!_fbReady || !_db) { _readyCBs.push(() => fbListenPosts(onAdded, onChanged, onRemoved)); return; }
  const ref = _db.ref("posts").orderByChild("updatedAt").limitToLast(50);
  ref.on("child_added", snap => onAdded(snap.val()), err => console.error("Firebase listener:", err.message));
  ref.on("child_changed", snap => onChanged(snap.val()));
  ref.on("child_removed", snap => onRemoved(snap.val()));
}

async function fbDeletePost(id) {
  if (!_fbReady || !_db) { _fallbackDelete(id); return; }
  try { await _db.ref("posts/" + id).remove(); } catch (e) { console.error("fbDeletePost:", e.message); }
}

function fbStatus() {
  return { ready: _fbReady, configured: _configured, db: _db !== null };
}

const _FB_KEY = "nf_fb_posts";

function _fallbackSave(post) {
  const posts = _fallbackLoad();
  const idx = posts.findIndex(p => String(p.id) === String(post.id));
  if (idx >= 0) posts[idx] = { ...post, updatedAt: Date.now() };
  else posts.unshift({ ...post, updatedAt: Date.now() });
  try { localStorage.setItem(_FB_KEY, JSON.stringify(posts)); } catch(e) {}
}

function _fallbackLoad() {
  try { return JSON.parse(localStorage.getItem(_FB_KEY) || "[]"); } catch(e) { return []; }
}

function _fallbackDelete(id) {
  const posts = _fallbackLoad().filter(p => String(p.id) !== String(id));
  try { localStorage.setItem(_FB_KEY, JSON.stringify(posts)); } catch(e) {}
}

function catEmoji(cat) {
  const map = { Pakistan:"🇵🇰", World:"🌍", Business:"💰", Tech:"💻", Sports:"⚽", Entertainment:"🎬", Health:"🏥" };
  return map[cat] || "📰";
}

// ==== AUTH ====
async function fbLogin(email, pass) {
  if (!_fbReady || !window.firebase || !firebase.auth) return {ok:false, error:"Firebase not ready"};
  try {
    const cred = await firebase.auth().signInWithEmailAndPassword(email, pass);
    return {ok:true, user: cred.user};
  } catch(e) { return {ok:false, error:e.message}; }
}

async function fbLogout() {
  if (_fbReady && window.firebase && firebase.auth) await firebase.auth().signOut();
}

function fbOnAuth(cb) {
  if (!_fbReady || !window.firebase || !firebase.auth) {
    _readyCBs.push(() => fbOnAuth(cb));
    return;
  }
  firebase.auth().onAuthStateChanged(user => cb(user));
}
