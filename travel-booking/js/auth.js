// js/auth.js
// Simple demo authentication helpers (client-only).
// - Demo baseline account: cassxmeme@gmail.com / Inter$form1
// - Registered accounts are saved in localStorage under 'demo_accounts'.
// - Current session stored as 'demo_session' (stores email + name).
//
// WARNING: This is demo-only. Do NOT use this for real authentication in production.

const auth = (function(){
  const ACC_KEY = 'demo_accounts';
  const SESSION = 'demo_session';

  // Demo baseline account (read-only but usable for sign-in)
  const demoAccount = { email: 'cassxmeme@gmail.com', password: 'Inter$form1', name: 'cass' };

  function loadAccounts(){
    try {
      const raw = localStorage.getItem(ACC_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch(e){
      return [];
    }
  }
  function saveAccounts(arr){
    localStorage.setItem(ACC_KEY, JSON.stringify(arr || []));
  }

  function findAccountByEmail(email){
    if(!email) return null;
    const accounts = loadAccounts();
    const fromSaved = accounts.find(a => a.email && a.email.toLowerCase() === email.toLowerCase());
    if(fromSaved) return fromSaved;
    // fallback to demo baseline
    if(email.toLowerCase() === demoAccount.email.toLowerCase()) return demoAccount;
    return null;
  }

  function login(email, password){
    const acc = findAccountByEmail(email);
    if(!acc) return { ok:false, message: 'Account not found.' };
    if(acc.password !== password) return { ok:false, message: 'Incorrect password.' };
    // set session
    const sess = { email: acc.email, name: acc.name || '', created: Date.now() };
    localStorage.setItem(SESSION, JSON.stringify(sess));
    return { ok:true, user: sess };
  }

  function register(name, email, password){
    if(!email || !password) return { ok:false, message:'Missing email or password' };
    // disallow demo email collision
    if(email.toLowerCase() === demoAccount.email.toLowerCase()){
      return { ok:false, message: 'That email is reserved by the demo. Use another email or sign in.' };
    }
    const accounts = loadAccounts();
    if(accounts.some(a=>a.email && a.email.toLowerCase()===email.toLowerCase())){
      return { ok:false, message: 'An account with that email already exists.' };
    }
    const entry = { name: name || '', email, password };
    accounts.push(entry);
    saveAccounts(accounts);
    // set session
    const sess = { email: entry.email, name: entry.name || '', created: Date.now() };
    localStorage.setItem(SESSION, JSON.stringify(sess));
    return { ok:true, user: sess };
  }

  function currentUser(){
    try {
      const raw = localStorage.getItem(SESSION);
      return raw ? JSON.parse(raw) : null;
    } catch(e){
      return null;
    }
  }

  function logout(){
    localStorage.removeItem(SESSION);
  }

  return { login, register, currentUser, logout };
})();

// ---- Spinner overlay helper (injected, non-destructive) ----
(function(){
  // inject minimal spinner CSS once
  if(!document.getElementById('demo-spinner-styles')){
    const style = document.createElement('style');
    style.id = 'demo-spinner-styles';
    style.textContent = `
      @keyframes demo-spin { to { transform: rotate(360deg); } }
      .demo-overlay {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,0.85);
        z-index: 10000;
      }
      .demo-spinner {
        width: 86px;
        height: 86px;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 18px 40px rgba(0,0,0,0.08);
        display:flex;
        align-items:center;
        justify-content:center;
        flex-direction:column;
        gap:10px;
        padding:10px;
      }
      .demo-ring {
        width:48px;
        height:48px;
        border-radius:50%;
        border:4px solid rgba(0,0,0,0.10);
        border-top-color: #1668E8;
        animation: demo-spin .9s linear infinite;
      }
      .demo-text {
        font-weight:700;
        font-size:14px;
        color:#0b1220;
      }
    `;
    document.head.appendChild(style);
  }

  // create overlay element (but keep hidden until needed)
  if(!document.getElementById('demo-spinner-overlay')){
    const overlay = document.createElement('div');
    overlay.id = 'demo-spinner-overlay';
    overlay.className = 'demo-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div class="demo-spinner" role="status" aria-live="polite" aria-busy="true">
        <div class="demo-ring" aria-hidden="true"></div>
        <div class="demo-text">Loading</div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  // helper functions
  window.__demoSpinner = {
    show: function(message){
      const ov = document.getElementById('demo-spinner-overlay');
      if(!ov) return;
      const txt = ov.querySelector('.demo-text');
      if(txt) txt.textContent = message || 'Loading';
      ov.style.display = 'flex';
    },
    hide: function(){
      const ov = document.getElementById('demo-spinner-overlay');
      if(!ov) return;
      ov.style.display = 'none';
    }
  };
})();

// Page wiring for signin/register forms (auto-detect presence)
document.addEventListener('DOMContentLoaded', function(){
  // Sign-in form (if exists)
  const signinForm = document.getElementById('signinForm');
  if(signinForm){
    signinForm.addEventListener('submit', async function(e){
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const pass = document.getElementById('password').value;
      const alertBox = document.getElementById('alertPlaceholder');
      if(alertBox) alertBox.innerHTML = '';

      const res = auth.login(email, pass);
      if(!res.ok){
        if(alertBox) alertBox.innerHTML = '<div class="alert alert-danger" role="alert">' + res.message + '</div>';
        return;
      }

      // success -> show spinner, small delay, then forward to book.html
      try {
        // show spinner w/ message
        if(window.__demoSpinner && window.__demoSpinner.show) window.__demoSpinner.show('');
      } catch(e){ /* ignore */ }

      // disable form controls while loading
      signinForm.querySelectorAll('input, button').forEach(el => el.disabled = true);

      // small delay so spinner is visible and UX feels responsive
      setTimeout(() => {
        // forward to book.html (as requested)
        window.location.href = 'book.html';
      }, 1000);
    });
  }

  // Register form
  const registerForm = document.getElementById('registerForm');
  if(registerForm){
    registerForm.addEventListener('submit', async function(e){
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const pass = document.getElementById('regPassword').value;
      const confirm = document.getElementById('regConfirm').value;
      const alertBox = document.getElementById('alertPlaceholder');
      if(alertBox) alertBox.innerHTML = '';

      if(!name || !email || !pass || !confirm){
        if(alertBox) alertBox.innerHTML = '<div class="alert alert-danger">Please fill in all fields.</div>';
        return;
      }
      if(pass !== confirm){
        if(alertBox) alertBox.innerHTML = '<div class="alert alert-danger">Passwords do not match.</div>';
        return;
      }

      const res = auth.register(name, email, pass);
      if(!res.ok){
        if(alertBox) alertBox.innerHTML = '<div class="alert alert-danger">' + res.message + '</div>';
        return;
      }

      // success -> show spinner, small delay, then forward to account.html
      try {
        if(window.__demoSpinner && window.__demoSpinner.show) window.__demoSpinner.show('Creating account...');
      } catch(e){ /* ignore */ }

      // disable form controls while loading
      registerForm.querySelectorAll('input, button').forEach(el => el.disabled = true);

      setTimeout(() => {
        window.location.href = 'account.html';
      }, 700);
    });
  }
});