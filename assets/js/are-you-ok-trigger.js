/**
 * "Are You OK?" — Global Easter Egg Trigger
 * Detects the secret phrase "are you ok?" anywhere on the portfolio
 * and triggers a gentle, cinematic transition into the hidden page.
 */

(function initAreYouOkTrigger() {
  const TARGET_PHRASE = 'areyouok?';
  const TARGET_PHRASE_ALT = 'areyouok';
  let buffer = '';
  let lastKeyTime = 0;
  const TIMEOUT_MS = 3800;

  // Lightweight keyboard listener
  window.addEventListener('keydown', (e) => {
    // Ignore keystrokes inside form fields or editable containers
    const el = e.target;
    const tag = (el && el.tagName) ? el.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || (el && el.isContentEditable)) {
      return;
    }

    const key = e.key.toLowerCase();
    // Allow letters and question mark
    if (key.length !== 1 || (!/[a-z\?]/.test(key) && key !== ' ')) return;

    const now = performance.now();
    if (now - lastKeyTime > TIMEOUT_MS) {
      buffer = '';
    }
    lastKeyTime = now;

    if (key !== ' ') {
      buffer += key;
    }

    // Keep buffer trimmed
    if (buffer.length > 20) {
      buffer = buffer.slice(-12);
    }

    if (buffer.endsWith(TARGET_PHRASE) || buffer.endsWith(TARGET_PHRASE_ALT)) {
      buffer = '';
      triggerEasterEggTransition();
    }
  });

  function triggerEasterEggTransition() {
    let overlay = document.getElementById('ayo-transition-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ayo-transition-overlay';
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: #faf7f3;
        opacity: 0;
        pointer-events: all;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.75s cubic-bezier(0.22, 1, 0.36, 1);
        font-family: 'Karla', -apple-system, sans-serif;
        color: #8a8a86;
      `;
      overlay.innerHTML = `
        <div style="font-size: 24px; letter-spacing: 0.15em; opacity: 0; transition: opacity 0.4s ease 0.2s;" id="ayo-dots">...</div>
      `;
      document.body.appendChild(overlay);
    }

    // Trigger visual fade
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      const dots = document.getElementById('ayo-dots');
      if (dots) dots.style.opacity = '0.7';

      setTimeout(() => {
        window.location.href = '/are-you-ok';
      }, 850);
    });
  }
})();
