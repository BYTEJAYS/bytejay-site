/**
 * "Are You OK?" — Master Page Controller
 * Handles page entrance sequencing, component orchestration, and exit flows.
 */

import { CatModel } from './js/CatModel.js';

document.addEventListener('DOMContentLoaded', () => {
  const viewport = document.getElementById('ayo-viewport');
  const catCanvas = document.getElementById('cat-canvas');
  const catContainer = document.getElementById('ayo-cat-container');
  const leaveBtn = document.getElementById('ayo-leave-btn');
  const mainTitle = document.getElementById('ayo-title-main');

  // Initialize 3D Cat component
  new CatModel(catCanvas, catContainer);

  // Interactive Hello! / Hii! morph
  let isHii = false;
  if (mainTitle) {
    mainTitle.addEventListener('click', () => {
      isHii = !isHii;
      const text = isHii ? 'Hii!' : 'Hello!';
      mainTitle.innerHTML = text.split('').map((char, i) => {
        return `<span class="ayo-char" style="--i:${i}">${char}</span>`;
      }).join('');
    });
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
