// Client-side password gate using SHA-256.
// Note: this prevents casual access but is not cryptographically secure —
// anyone who views source can find the hash. Suitable for shared-link privacy.

const AUTH = (() => {
  const HASH = '37a138b52b97c182b4a6ceb115fb870a68d574e6a6fe5fe0bea56f5ddac51fb1';
  const KEY  = 'sea_econ_auth';

  async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function isUnlocked() {
    return localStorage.getItem(KEY) === HASH;
  }

  function showGate() {
    const overlay = document.createElement('div');
    overlay.id = 'auth-overlay';
    overlay.innerHTML = `
      <div id="auth-box">
        <div id="auth-logo">Seattle Econ</div>
        <div id="auth-subtitle">Economic Dashboard</div>
        <input type="password" id="auth-input" placeholder="Enter password" autocomplete="current-password">
        <button id="auth-btn">Unlock</button>
        <div id="auth-error"></div>
      </div>`;
    document.body.appendChild(overlay);

    const input = document.getElementById('auth-input');
    const btn   = document.getElementById('auth-btn');
    const error = document.getElementById('auth-error');

    async function attempt() {
      const hash = await sha256(input.value);
      if (hash === HASH) {
        localStorage.setItem(KEY, HASH);
        overlay.remove();
      } else {
        error.textContent = 'Incorrect password.';
        input.value = '';
        input.focus();
        overlay.querySelector('#auth-box').style.animation = 'shake 0.3s ease';
        setTimeout(() => overlay.querySelector('#auth-box').style.animation = '', 300);
      }
    }

    btn.addEventListener('click', attempt);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') attempt(); });
    setTimeout(() => input.focus(), 50);
  }

  function init() {
    if (!isUnlocked()) showGate();
  }

  return { init };
})();

AUTH.init();
