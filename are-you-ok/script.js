/**
 * "Are You OK?" — Master Page Controller
 * Handles 3D model initialization and exit navigation flows.
 */

import { CatModel } from './js/CatModel.js';

document.addEventListener('DOMContentLoaded', () => {
  const viewport = document.getElementById('ayo-viewport');
  const catCanvas = document.getElementById('cat-canvas');
  const catContainer = document.getElementById('ayo-cat-container');
  const leaveBtn = document.getElementById('ayo-leave-btn');

  // Initialize 3D Cat component
  new CatModel(catCanvas, catContainer);

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
