/**
 * Interactive Site Decorations — Journey / Folio Baseline Edition
 *
 * 1. Jukebox floating music notes when ambient track plays.
 * 2. Interactive whisper flame motes around the About pull-cord lamp.
 * 3. Sparkle dust near decorative vignettes.
 */
(function () {
  'use strict';

  // ===== 1. Jukebox floating music notes =====
  const navEl = document.querySelector('[data-playground-nav]');
  const audioEl = document.querySelector('[data-ambient-audio]');
  const symbols = ['♪', '♫', '♩', '♬', '✦'];
  let noteInterval = null;

  function spawnNote() {
    if (!navEl || !audioEl || audioEl.paused) return;

    const note = document.createElement('span');
    note.className = 'floating-music-note';
    note.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    
    // Spawn randomly along the width of the particle field
    const rect = navEl.getBoundingClientRect();
    const x = rect.left + 20 + Math.random() * (rect.width - 40);
    const y = rect.top + rect.height * 0.5;

    note.style.left = x + 'px';
    note.style.top = y + 'px';
    note.style.setProperty('--drift-x', `${(Math.random() - 0.3) * 60}px`);
    note.style.setProperty('--rot', `${(Math.random() - 0.5) * 40}deg`);
    note.style.animationDuration = `${1.8 + Math.random() * 1.2}s`;

    document.body.appendChild(note);

    setTimeout(() => {
      note.remove();
    }, 3200);
  }

  function startNotes() {
    if (noteInterval) return;
    noteInterval = setInterval(spawnNote, 700);
  }

  function stopNotes() {
    if (noteInterval) {
      clearInterval(noteInterval);
      noteInterval = null;
    }
  }

  if (audioEl) {
    audioEl.addEventListener('play', startNotes);
    audioEl.addEventListener('pause', stopNotes);
    audioEl.addEventListener('ended', stopNotes);
  }
})();
