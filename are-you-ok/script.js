/**
 * "Are You OK?" — Master Page Controller
 * Handles page entrance sequencing, component orchestration, and exit flows.
 */

import { CatModel } from './js/CatModel.js';
import { audio } from './js/Audio.js';

document.addEventListener('DOMContentLoaded', () => {
  const viewport = document.getElementById('ayo-viewport');
  const catCanvas = document.getElementById('cat-canvas');
  const catContainer = document.getElementById('ayo-cat-container');
  const leaveBtn = document.getElementById('ayo-leave-btn');
  const mainTitle = document.getElementById('ayo-title-main');

  // Initialize 3D Cat component
  new CatModel(catCanvas, catContainer);

  // High-End Flip/Morph between Hello! and Hii!
  let isHii = false;
  let isMorphing = false;

  function morphGreeting() {
    if (isMorphing || !mainTitle) return;
    isMorphing = true;
    audio.playButtonClick();

    const existingInners = mainTitle.querySelectorAll('.ayo-char-inner');
    existingInners.forEach((inner) => {
      inner.style.animation = 'none';
      inner.style.transition = 'transform 0.26s cubic-bezier(0.4, 0, 1, 1), opacity 0.2s ease, filter 0.2s ease';
      inner.style.transform = 'translateY(-120%) rotate(-8deg) scale(0.9)';
      inner.style.opacity = '0';
      inner.style.filter = 'blur(8px)';
    });

    setTimeout(() => {
      isHii = !isHii;
      const text = isHii ? 'Hii!' : 'Hello!';
      mainTitle.innerHTML = text.split('').map((char, i) => {
        return `<span class="ayo-char" style="--i:${i}"><span class="ayo-char-inner" style="--i:${i}; animation: ayo-char-slide-up 0.75s cubic-bezier(0.16, 1, 0.3, 1) calc(${i * 0.05}s) forwards;">${char}</span></span>`;
      }).join('');

      setTimeout(() => {
        isMorphing = false;
      }, 350);
    }, 200);
  }

  if (mainTitle) {
    mainTitle.addEventListener('click', morphGreeting);
  }

  // Exit transition
  function leavePage(e) {
    if (e) e.preventDefault();
    viewport.style.opacity = '0';
    viewport.style.transform = 'scale(0.98)';
    setTimeout(() => {
      window.location.href = '/';
    }, 400);
  }

  if (leaveBtn) {
    leaveBtn.addEventListener('click', leavePage);
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      leavePage();
    }
  });
});
