/* ============================================================
   GRAMMAR DETECTIVE — Shared Auth & Score Logic
   auth.js
   ============================================================
   Exported helpers: GD object
   Used by: all pages
   ============================================================ */

const GD = {

  /* ---------- localStorage keys ---------- */
  KEYS: {
    users:   'gd_users',
    current: 'gd_current',
    scores:  'gd_scores',
  },

  /* ---------- Getters ---------- */
  getUsers()   { return JSON.parse(localStorage.getItem(this.KEYS.users)   || '{}'); },
  getCurrent() { return JSON.parse(localStorage.getItem(this.KEYS.current) || 'null'); },
  getScores()  { return JSON.parse(localStorage.getItem(this.KEYS.scores)  || '{}'); },

  /* ---------- Setters ---------- */
  saveUsers(u)   { localStorage.setItem(this.KEYS.users,   JSON.stringify(u)); },
  saveCurrent(u) { localStorage.setItem(this.KEYS.current, JSON.stringify(u)); },
  saveScores(s)  { localStorage.setItem(this.KEYS.scores,  JSON.stringify(s)); },

  /* ---------- Auth ---------- */
  logout() {
    localStorage.removeItem(this.KEYS.current);
    window.location.href = 'index.html';
  },

  /* ---------- Score helpers ---------- */
  saveActivityScore(actId, correct, total) {
    const user = this.getCurrent();
    if (!user) return;
    const scores = this.getScores();
    if (!scores[user.username]) scores[user.username] = {};
    scores[user.username][actId] = {
      correct,
      total,
      label: correct + '/' + total,
      date:  new Date().toLocaleDateString('en-MY'),
    };
    this.saveScores(scores);
  },

  getActivityScore(actId) {
    const user = this.getCurrent();
    if (!user) return null;
    return (this.getScores()[user.username] || {})[actId] || null;
  },

  /* ---------- Score message ---------- */
  scoreMsg(correct, total) {
    const p = correct / total;
    if (p === 1)    return "🏆 Perfect score! You're a Grammar Detective!";
    if (p >= 0.8)   return '🌟 Excellent work! Almost perfect!';
    if (p >= 0.6)   return '👍 Good job! Keep practising!';
    if (p >= 0.4)   return '📖 Review the notes and try again.';
    return '💪 Keep going — every detective improves!';
  },

  /* ---------- Nav injection ---------- */
  injectNav() {
    const nav = document.getElementById('gd-nav');
    if (!nav) return;
    const user = this.getCurrent();
    const rightHtml = user
      ? `<div class="nav-right">
           <span class="nav-user">👤 ${user.name.split(' ')[0]}</span>
           <a href="dashboard.html" class="btn btn-outline-tan btn-sm">Dashboard</a>
           <button onclick="GD.logout()" class="btn btn-yellow btn-sm">Logout</button>
         </div>`
      : `<div class="nav-right">
           <a href="login.html"  class="btn btn-outline-tan btn-sm">Login</a>
           <a href="signup.html" class="btn btn-yellow btn-sm">Sign Up</a>
         </div>`;
    nav.innerHTML =
      `<a class="nav-logo" href="index.html">Grammar <span>Detective</span> 🔍</a>` +
      rightHtml;
  },

  /* ---------- Guard: redirect if not logged in ---------- */
  requireAuth(redirectBack) {
    if (!this.getCurrent()) {
      const next = redirectBack ? '?next=' + encodeURIComponent(window.location.pathname) : '';
      window.location.href = 'login.html' + next;
    }
  },
};

/* Auto-inject nav on every page */
document.addEventListener('DOMContentLoaded', () => GD.injectNav());