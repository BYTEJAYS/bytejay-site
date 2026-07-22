// mark that JS is active so pre-animation "hidden" states only apply with JS on
document.documentElement.classList.add('js');

// ===== Opening composition: blur resolves as hero layers settle into place =====
(function siteEntrance() {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let safetyTimer;
  let completed = false;

  // Reloads, history returns, and direct section links should restore their
  // state immediately instead of replaying the homepage-only composition.
  if (root.classList.contains('site-intro-skip')) {
    root.classList.remove('site-entering', 'site-intro-active');
    root.classList.add('site-intro-complete');
    queueMicrotask(() => window.dispatchEvent(new Event('siteintrocomplete')));
    return;
  }

  const finish = () => {
    if (completed) return;
    completed = true;
    root.classList.remove('site-entering', 'site-intro-active');
    root.classList.add('site-entered');
    window.clearTimeout(safetyTimer);
    window.dispatchEvent(new Event('siteintrocomplete'));
  };

  // If the page is cached while the intro is mid-flight, complete it on
  // restoration rather than resuming a stale, partially painted timeline.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) finish();
  });

  if (reduceMotion) {
    finish();
    return;
  }

  // Two frames guarantee the browser paints the prepared state before the
  // staggered CSS entrance begins. Keep scrolling locked until it resolves.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    root.classList.remove('site-entering');
    root.classList.add('site-entered');
    window.setTimeout(finish, 1900);
  }));

  // Never leave the page in its prepared state if loading is interrupted.
  safetyTimer = window.setTimeout(finish, 2800);
}());

// ===== Scroll reveal (blur-in titles + fade-up elements) =====
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('[data-reveal], [data-reveal-title]').forEach((el, i) => {
  el.style.transitionDelay = (Math.min(i % 4, 3) * 40) + 'ms';
  io.observe(el);
});

// ===== Card entrance: flip open + drop into place once, when scrolled into view =====
const flipCards = [...document.querySelectorAll('.work__grid .card, .testimonials__grid .card')];
if (flipCards.length) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    flipCards.forEach((card) => card.classList.add('flip-in', 'card--interactive'));
  } else {
    const cardIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('flip-in');
          window.setTimeout(() => e.target.classList.add('card--interactive'), 1200);
          cardIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -12% 0px' });
    flipCards.forEach((card) => cardIO.observe(card));
  }
}

// ===== Particle project cards: restrained pointer depth + opposing visual drift =====
if (
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches
) {
  document.querySelectorAll('[data-project-card]').forEach((card) => {
    let rect;
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const resetProjectCard = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      rect = undefined;
      card.style.setProperty('--card-rx', '0deg');
      card.style.setProperty('--card-ry', '0deg');
      card.style.setProperty('--image-x', '0px');
      card.style.setProperty('--image-y', '0px');
    };

    card.addEventListener('pointerenter', () => { rect = card.getBoundingClientRect(); });
    card.addEventListener('pointermove', (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!rect) rect = card.getBoundingClientRect();
        const x = (pointerX - rect.left) / rect.width - 0.5;
        const y = (pointerY - rect.top) / rect.height - 0.5;
        card.style.setProperty('--card-rx', `${(-y * 4.5).toFixed(2)}deg`);
        card.style.setProperty('--card-ry', `${(x * 4.5).toFixed(2)}deg`);
        card.style.setProperty('--image-x', `${(-x * 12).toFixed(2)}px`);
        card.style.setProperty('--image-y', `${(-y * 12).toFixed(2)}px`);
      });
    });
    card.addEventListener('pointerleave', resetProjectCard);
    card.addEventListener('pointercancel', resetProjectCard);
  });
}

// ===== Hero synapse: role-aware keyword field revealed by hover, focus, or touch =====
(function heroSynapseField() {
  const panel = document.querySelector('.hero-panel');
  const trigger = document.querySelector('[data-synapse-trigger]');
  const canvas = document.querySelector('[data-hero-synapse]');
  const roleItems = [...document.querySelectorAll('.hero__title-item[data-role]')];
  if (!panel || !trigger || !canvas || !roleItems.length) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const roleWords = {
    backend: ['apis', 'systems', 'python', 'fastapi', 'postgresql', 'redis', 'async', 'queues', 'security', 'scale', 'graphs', 'services', 'data', 'workers', 'testing', 'reliability', 'architecture', 'performance'],
    ai: ['agents', 'models', 'pytorch', 'inference', 'memory', 'tools', 'reasoning', 'orchestration', 'embeddings', 'local ai', 'evaluation', 'vision', 'graphs', 'automation', 'context', 'learning', 'retrieval', 'intelligence']
  };
  const homes = [
    [.07, .18], [.18, .1], [.31, .18], [.46, .09], [.62, .14], [.78, .1], [.91, .2],
    [.93, .36], [.92, .55], [.88, .76], [.74, .84], [.6, .76], [.45, .84], [.3, .76],
    [.15, .84], [.07, .66], [.07, .48], [.14, .32]
  ];
  const nodes = homes.map(([homeX, homeY], index) => {
    const angle = index * 2.399 + .45;
    const speed = .16 + index % 4 * .045;
    return {
      homeX,
      homeY,
      x: 0,
      y: 0,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      baseVx: Math.cos(angle) * speed,
      baseVy: Math.sin(angle) * speed,
      word: ''
    };
  });

  let width = 1;
  let height = 1;
  let titleBox = { left: 0, right: 1, top: 0, bottom: 1 };
  let currentRole = 'backend';
  let active = false;
  let frame = 0;
  let lastTime = 0;
  let lastRoleCheck = 0;
  let touchTimer = 0;
  const pointer = { x: 0, y: 0, active: false };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const setWords = (role) => {
    currentRole = roleWords[role] ? role : 'backend';
    const words = roleWords[currentRole];
    nodes.forEach((node, index) => { node.word = words[index % words.length]; });
  };
  const detectRole = () => {
    let winner = roleItems[0];
    let highestOpacity = -1;
    roleItems.forEach((item) => {
      const opacity = Number.parseFloat(getComputedStyle(item).opacity) || 0;
      if (opacity > highestOpacity) {
        highestOpacity = opacity;
        winner = item;
      }
    });
    const role = winner.dataset.role || 'backend';
    if (role !== currentRole) setWords(role);
  };
  const measureTitle = () => {
    const panelRect = panel.getBoundingClientRect();
    const titleRect = trigger.getBoundingClientRect();
    titleBox = {
      left: titleRect.left - panelRect.left,
      right: titleRect.right - panelRect.left,
      top: titleRect.top - panelRect.top,
      bottom: titleRect.bottom - panelRect.top
    };
  };
  const resize = () => {
    const bounds = panel.getBoundingClientRect();
    if (bounds.width < 1 || bounds.height < 1) return;
    const previousWidth = width;
    const previousHeight = height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.round(bounds.width);
    height = Math.round(bounds.height);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    measureTitle();
    nodes.forEach((node) => {
      if (previousWidth <= 1 || previousHeight <= 1) {
        node.x = node.homeX * width;
        node.y = node.homeY * height;
      } else {
        node.x = node.x / previousWidth * width;
        node.y = node.y / previousHeight * height;
      }
    });
    draw(0, 1);
  };

  const nearestTitlePoint = (node) => {
    const inset = width < 600 ? 8 : 20;
    return {
      x: clamp(node.x, titleBox.left + inset, titleBox.right - inset),
      y: clamp(node.y, titleBox.top + inset, titleBox.bottom - inset)
    };
  };
  const keepOutsideTitle = (node) => {
    const padding = width < 600 ? 10 : 20;
    const left = titleBox.left - padding;
    const right = titleBox.right + padding;
    const top = titleBox.top - padding;
    const bottom = titleBox.bottom + padding;
    if (node.x <= left || node.x >= right || node.y <= top || node.y >= bottom) return;

    const distances = [node.x - left, right - node.x, node.y - top, bottom - node.y];
    const nearest = distances.indexOf(Math.min(...distances));
    if (nearest === 0) { node.x = left; node.vx = -Math.abs(node.vx) - .25; }
    if (nearest === 1) { node.x = right; node.vx = Math.abs(node.vx) + .25; }
    if (nearest === 2) { node.y = top; node.vy = -Math.abs(node.vy) - .25; }
    if (nearest === 3) { node.y = bottom; node.vy = Math.abs(node.vy) + .25; }
  };
  const updateNode = (node, delta, time, textWidth) => {
    if (pointer.active) {
      const offsetX = node.x - pointer.x;
      const offsetY = node.y - pointer.y;
      const distance = Math.max(1, Math.hypot(offsetX, offsetY));
      const radius = width < 600 ? 105 : 175;
      if (distance < radius) {
        const force = (1 - distance / radius) * (width < 600 ? .52 : .78) * delta;
        node.vx += offsetX / distance * force;
        node.vy += offsetY / distance * force;
      }
    }

    node.vx += (node.baseVx - node.vx) * .008 * delta;
    node.vy += (node.baseVy - node.vy) * .008 * delta;
    node.vx += Math.sin(time * .00045 + node.homeX * 11) * .0024 * delta;
    node.vy += Math.cos(time * .00038 + node.homeY * 13) * .0024 * delta;
    const speed = Math.hypot(node.vx, node.vy);
    const maximum = width < 600 ? 2.2 : 3.2;
    if (speed > maximum) {
      node.vx = node.vx / speed * maximum;
      node.vy = node.vy / speed * maximum;
    }
    node.x += node.vx * delta;
    node.y += node.vy * delta;

    const horizontalPad = textWidth * .5 + 10;
    const verticalPad = width < 600 ? 18 : 24;
    if (node.x < horizontalPad) { node.x = horizontalPad; node.vx = Math.abs(node.vx); }
    if (node.x > width - horizontalPad) { node.x = width - horizontalPad; node.vx = -Math.abs(node.vx); }
    if (node.y < verticalPad) { node.y = verticalPad; node.vy = Math.abs(node.vy); }
    if (node.y > height - verticalPad) { node.y = height - verticalPad; node.vy = -Math.abs(node.vy); }
    keepOutsideTitle(node);
  };

  function draw(time, delta) {
    ctx.clearRect(0, 0, width, height);
    const fontSize = width < 600 ? 12 : width < 900 ? 15 : 18;
    ctx.font = `italic 500 ${fontSize}px Newsreader, Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    nodes.forEach((node) => {
      const textWidth = ctx.measureText(node.word).width;
      if (time > 0 && !reduceMotion) updateNode(node, delta, time, textWidth);
      const target = nearestTitlePoint(node);
      const gradient = ctx.createLinearGradient(node.x, node.y, target.x, target.y);
      gradient.addColorStop(0, 'rgba(17,17,17,.28)');
      gradient.addColorStop(1, 'rgba(17,17,17,.08)');
      ctx.strokeStyle = gradient;
      ctx.lineWidth = width < 600 ? .65 : .85;
      ctx.beginPath();
      ctx.moveTo(node.x, node.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
    });

    nodes.forEach((node, index) => {
      const pulse = .74 + Math.sin(time * .0016 + index * .7) * .14;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#555552';
      ctx.fillText(node.word, node.x, node.y);
      ctx.globalAlpha = .42;
      ctx.fillStyle = '#171717';
      ctx.fillRect(node.x - 1.2, node.y + (width < 600 ? 9 : 12), 2.4, 2.4);
      ctx.globalAlpha = 1;
    });
  }

  const animate = (time) => {
    frame = 0;
    if (!active || document.hidden) return;
    if (time - lastRoleCheck > 320) {
      detectRole();
      lastRoleCheck = time;
    }
    const delta = lastTime ? Math.min(2, (time - lastTime) / 16.667) : 1;
    lastTime = time;
    draw(time, delta);
    frame = requestAnimationFrame(animate);
  };
  const startLoop = () => {
    if (reduceMotion) {
      draw(0, 1);
      return;
    }
    if (!frame && active && !document.hidden) frame = requestAnimationFrame(animate);
  };
  const updatePointer = (event) => {
    const bounds = panel.getBoundingClientRect();
    pointer.x = event.clientX - bounds.left;
    pointer.y = event.clientY - bounds.top;
  };
  const show = (event) => {
    window.clearTimeout(touchTimer);
    if (event) panel.classList.add('synapse-pointer-active');
    detectRole();
    measureTitle();
    active = true;
    pointer.active = Boolean(event && Number.isFinite(event.clientX));
    if (pointer.active) updatePointer(event);
    canvas.classList.add('is-active');
    panel.classList.add('synapse-active');
    lastTime = 0;
    startLoop();
  };
  const hide = () => {
    active = false;
    pointer.active = false;
    canvas.classList.remove('is-active');
    panel.classList.remove('synapse-active');
    panel.classList.remove('synapse-pointer-active');
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };
  const hideAfterTouch = (delay = 1200) => {
    window.clearTimeout(touchTimer);
    touchTimer = window.setTimeout(hide, delay);
  };

  trigger.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') show(event);
  });
  trigger.addEventListener('pointermove', (event) => {
    if (!active) return;
    pointer.active = true;
    updatePointer(event);
  });
  trigger.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') hide();
  });
  trigger.addEventListener('pointerdown', (event) => {
    show(event);
    if (event.pointerType === 'touch') hideAfterTouch(2600);
  });
  trigger.addEventListener('pointerup', (event) => {
    if (event.pointerType === 'touch') hideAfterTouch(1400);
  });
  trigger.addEventListener('focus', () => show());
  trigger.addEventListener('blur', hide);

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(panel);
  setWords(currentRole);
  resize();
  document.fonts?.load('italic 500 18px Newsreader').then(() => draw(0, 1));
  document.addEventListener('visibilitychange', startLoop);
  window.addEventListener('pagehide', (event) => {
    if (event.persisted) return;
    window.clearTimeout(touchTimer);
    if (frame) cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    document.removeEventListener('visibilitychange', startLoop);
  });
})();

// ===== Project particles: one shared, visibility-aware canvas loop =====
(function projectParticleVisuals() {
  const canvases = [...document.querySelectorAll('[data-particle-visual]')];
  if (!canvases.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const TAU = Math.PI * 2;
  const palette = {
    paper: '#f9f7f2',
    ink: '#171717',
    mid: '#777773',
    light: '#c7c4bd',
    faint: '#dedbd4'
  };

  const lerp = (a, b, amount) => a + (b - a) * amount;
  const fract = (value) => value - Math.floor(value);
  const pointBetween = (a, b, amount) => ({
    x: lerp(a.x, b.x, amount),
    y: lerp(a.y, b.y, amount)
  });
  const quadraticPoint = (a, control, b, amount) => {
    const inverse = 1 - amount;
    return {
      x: inverse * inverse * a.x + 2 * inverse * amount * control.x + amount * amount * b.x,
      y: inverse * inverse * a.y + 2 * inverse * amount * control.y + amount * amount * b.y
    };
  };
  const dot = (ctx, x, y, radius, color = palette.ink, alpha = 1) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
  };
  const stroke = (ctx, a, b, color = palette.light, width = 1, alpha = 1) => {
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  };
  const ring = (ctx, x, y, radius, color = palette.ink, width = 1, alpha = 1) => {
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 1;
  };
  const dottedSegment = (ctx, a, b, count, phase = 0, color = palette.mid) => {
    for (let index = 0; index <= count; index += 1) {
      const amount = index / count;
      const point = pointBetween(a, b, amount);
      const pulse = 0.75 + Math.sin(phase + index * 0.72) * 0.25;
      dot(ctx, point.x, point.y, 1.05 + pulse * 0.35, color, 0.42 + pulse * 0.32);
    }
  };
  const drawBackdrop = (state) => {
    const { ctx, width, height, seed } = state;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = palette.paper;
    ctx.fillRect(0, 0, width, height);
    for (let index = 0; index < 28; index += 1) {
      const x = fract(Math.sin((index + 1) * (seed + 13.17)) * 9482.31) * width;
      const y = (0.08 + fract(Math.sin((index + 4) * (seed + 7.73)) * 7126.14) * 0.57) * height;
      dot(ctx, x, y, index % 5 === 0 ? 1.15 : 0.72, palette.mid, index % 5 === 0 ? 0.2 : 0.11);
    }
  };

  const drawGraph = (state, time) => {
    drawBackdrop(state);
    const { ctx, width, height, pointer } = state;
    const sourceNodes = [
      [.14, .31, .5], [.32, .2, .2], [.55, .25, .8], [.79, .18, .35],
      [.82, .42, .65], [.61, .5, .15], [.36, .45, .9], [.18, .57, .3],
      [.45, .63, .7], [.74, .61, .45]
    ];
    const nodes = sourceNodes.map(([x, y, depth]) => ({
      x: x * width + (pointer.x - .5) * depth * 10,
      y: y * height + (pointer.y - .5) * depth * 8
    }));
    const edges = [[0, 1], [1, 2], [2, 3], [0, 6], [1, 6], [2, 5], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [5, 9], [2, 4]];
    const tracedEdges = new Set([1, 5, 8, 10]);

    edges.forEach(([from, to], index) => {
      const traced = tracedEdges.has(index);
      stroke(ctx, nodes[from], nodes[to], traced ? palette.ink : palette.light, traced ? 1.35 : .85, traced ? .48 : .72);
      const progress = fract(time * (traced ? .00016 : .0001) + index * .137);
      const traveller = pointBetween(nodes[from], nodes[to], progress);
      const trail = pointBetween(nodes[from], nodes[to], Math.max(0, progress - .055));
      dot(ctx, trail.x, trail.y, traced ? 1.2 : .85, palette.mid, .32);
      dot(ctx, traveller.x, traveller.y, traced ? 2.25 : 1.45, palette.ink, traced ? .92 : .62);
    });

    const activeIndex = Math.floor(time / 680) % nodes.length;
    nodes.forEach((node, index) => {
      ring(ctx, node.x, node.y, index === activeIndex ? 7.4 : 5.2, index === activeIndex ? palette.ink : palette.mid, index === activeIndex ? 1.25 : .8, index === activeIndex ? .75 : .65);
      dot(ctx, node.x, node.y, index % 3 === 0 ? 2.4 : 1.85, palette.ink, .88);
    });
    const pulse = fract(time / 680);
    ring(ctx, nodes[activeIndex].x, nodes[activeIndex].y, 8 + pulse * 8, palette.ink, .8, .38 * (1 - pulse));
  };

  const drawGovernance = (state, time) => {
    drawBackdrop(state);
    const { ctx, width, height, pointer } = state;
    const centerY = height * .405 + (pointer.y - .5) * 5;
    const start = { x: width * .1, y: centerY };
    const end = { x: width * .9, y: centerY };
    const gates = [.33, .5, .67].map((x) => ({ x: width * x, y: centerY }));
    stroke(ctx, start, end, palette.light, 1, .75);

    ring(ctx, start.x, start.y, 15, palette.mid, 1, .65);
    for (let index = 0; index < 9; index += 1) {
      const angle = index / 9 * TAU + time * .00012;
      const radius = 5 + (index % 3) * 3.2;
      dot(ctx, start.x + Math.cos(angle) * radius, start.y + Math.sin(angle) * radius, 1.35, palette.ink, .78);
    }

    gates.forEach((gate, index) => {
      const phase = fract(time * .00022 + index * .28);
      ctx.save();
      ctx.setLineDash([2, 4]);
      ring(ctx, gate.x, gate.y, 15 + phase * 3, palette.mid, 1, .62);
      ctx.restore();
      ring(ctx, gate.x, gate.y, 8.5, palette.ink, 1, .8);
      stroke(ctx, { x: gate.x - 4, y: gate.y }, { x: gate.x - 1, y: gate.y + 3 }, palette.ink, 1.2, .9);
      stroke(ctx, { x: gate.x - 1, y: gate.y + 3 }, { x: gate.x + 5, y: gate.y - 4 }, palette.ink, 1.2, .9);
    });

    for (let index = 0; index < 22; index += 1) {
      const progress = fract(time * (.00007 + index % 4 * .000006) + index / 22);
      const x = lerp(start.x, end.x, progress);
      const gatePull = gates.reduce((total, gate) => total + Math.exp(-Math.pow((x - gate.x) / 18, 2)), 0);
      const wave = Math.sin(index * 2.1 + time * .002) * 8 * (1 - Math.min(1, gatePull));
      dot(ctx, x, centerY + wave, index % 5 === 0 ? 2 : 1.25, index % 5 === 0 ? palette.ink : palette.mid, .5 + (index % 5 === 0 ? .35 : .12));
    }

    [-11, 0, 11].forEach((offset, index) => {
      const x = end.x - 3 + (index % 2) * 3;
      ctx.strokeStyle = index === Math.floor(time / 700) % 3 ? palette.ink : palette.mid;
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 7, centerY + offset - 4, 14, 8);
    });
  };

  const drawGrowth = (state, time) => {
    drawBackdrop(state);
    const { ctx, width, height, pointer } = state;
    const sources = [[.16, .25], [.36, .18], [.64, .2], [.82, .29]].map(([x, y], index) => ({
      x: x * width + (pointer.x - .5) * (index % 2 ? 7 : -7),
      y: y * height + (pointer.y - .5) * 5
    }));
    const hub = { x: width * .47, y: height * .49 };

    sources.forEach((source, index) => {
      const control = { x: lerp(source.x, hub.x, .56), y: hub.y - 10 - index * 3 };
      ctx.strokeStyle = palette.light;
      ctx.lineWidth = .9;
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.quadraticCurveTo(control.x, control.y, hub.x, hub.y);
      ctx.stroke();
      ring(ctx, source.x, source.y, 9, palette.mid, .9, .62);
      for (let dotIndex = 0; dotIndex < 4; dotIndex += 1) {
        const angle = dotIndex / 4 * TAU + time * (.00016 + index * .000018);
        dot(ctx, source.x + Math.cos(angle) * 5, source.y + Math.sin(angle) * 5, 1.35, palette.ink, .8);
      }
      const progress = fract(time * .00013 + index * .22);
      const particle = quadraticPoint(source, control, hub, progress);
      dot(ctx, particle.x, particle.y, 2, palette.ink, .88);
    });

    const growthPath = [hub, { x: width * .55, y: height * .43 }, { x: width * .63, y: height * .45 }, { x: width * .7, y: height * .34 }, { x: width * .82, y: height * .27 }];
    growthPath.slice(0, -1).forEach((point, index) => stroke(ctx, point, growthPath[index + 1], palette.ink, 1.3, .68));
    growthPath.forEach((point, index) => dot(ctx, point.x, point.y, index === 0 ? 3.2 : 2, palette.ink, .9));
    for (let index = 0; index < 8; index += 1) {
      const segment = index % (growthPath.length - 1);
      const progress = fract(time * .00018 + index * .19);
      const point = pointBetween(growthPath[segment], growthPath[segment + 1], progress);
      dot(ctx, point.x, point.y, index % 3 === 0 ? 2.1 : 1.2, palette.ink, .72);
    }

    const sproutPhase = Math.sin(time * .0014) * 2;
    stroke(ctx, hub, { x: hub.x, y: hub.y - 24 }, palette.mid, 1, .7);
    stroke(ctx, { x: hub.x, y: hub.y - 17 }, { x: hub.x - 12 - sproutPhase, y: hub.y - 27 }, palette.mid, 1, .65);
    stroke(ctx, { x: hub.x, y: hub.y - 13 }, { x: hub.x + 12 + sproutPhase, y: hub.y - 23 }, palette.mid, 1, .65);
    dot(ctx, hub.x - 12 - sproutPhase, hub.y - 27, 2, palette.ink, .8);
    dot(ctx, hub.x + 12 + sproutPhase, hub.y - 23, 2, palette.ink, .8);
  };

  const drawPortfolio = (state, time) => {
    drawBackdrop(state);
    const { ctx, width, height, pointer } = state;
    const driftX = (pointer.x - .5) * 8;
    const driftY = (pointer.y - .5) * 6;
    const frame = {
      left: width * .13 + driftX,
      right: width * .87 + driftX,
      top: height * .16 + driftY,
      bottom: height * .58 + driftY
    };
    const phase = time * .003;
    dottedSegment(ctx, { x: frame.left, y: frame.top }, { x: frame.right, y: frame.top }, 25, phase);
    dottedSegment(ctx, { x: frame.left, y: frame.bottom }, { x: frame.right, y: frame.bottom }, 25, phase + 1);
    dottedSegment(ctx, { x: frame.left, y: frame.top }, { x: frame.left, y: frame.bottom }, 15, phase + 2);
    dottedSegment(ctx, { x: frame.right, y: frame.top }, { x: frame.right, y: frame.bottom }, 15, phase + 3);
    dottedSegment(ctx, { x: frame.left, y: frame.top + 24 }, { x: frame.right, y: frame.top + 24 }, 25, phase + 4);
    [0, 1, 2].forEach((index) => dot(ctx, frame.left + 14 + index * 10, frame.top + 12, 2, index === 2 ? palette.mid : palette.ink, .8));

    const blockTop = frame.top + 48;
    [0, 1, 2].forEach((index) => {
      const left = frame.left + 16 + index * (width * .2);
      const right = left + width * .13;
      const bottom = blockTop + height * .105;
      dottedSegment(ctx, { x: left, y: blockTop }, { x: right, y: blockTop }, 6, phase + index);
      dottedSegment(ctx, { x: left, y: bottom }, { x: right, y: bottom }, 6, phase + index + 1);
      dottedSegment(ctx, { x: left, y: blockTop }, { x: left, y: bottom }, 4, phase + index + 2);
      dottedSegment(ctx, { x: right, y: blockTop }, { x: right, y: bottom }, 4, phase + index + 3);
    });

    const cubeCenter = { x: width * .59 + driftX, y: height * .49 + driftY };
    const size = Math.min(width, height) * .065;
    const rotation = Math.sin(time * .00065) * .16;
    const rotatePoint = (x, y) => ({
      x: cubeCenter.x + x * Math.cos(rotation) - y * Math.sin(rotation),
      y: cubeCenter.y + x * Math.sin(rotation) + y * Math.cos(rotation)
    });
    const front = [rotatePoint(-size, -size * .55), rotatePoint(size, -size * .55), rotatePoint(size, size * .55), rotatePoint(-size, size * .55)];
    const back = front.map((point) => ({ x: point.x + size * .52, y: point.y - size * .42 }));
    for (let index = 0; index < 4; index += 1) {
      dottedSegment(ctx, front[index], front[(index + 1) % 4], 5, phase + index, palette.ink);
      dottedSegment(ctx, back[index], back[(index + 1) % 4], 5, phase + index + 1, palette.mid);
      dottedSegment(ctx, front[index], back[index], 4, phase + index + 2, palette.mid);
    }
    const orbit = time * .0012;
    dot(ctx, cubeCenter.x + Math.cos(orbit) * size * 2.1, cubeCenter.y + Math.sin(orbit) * size, 2.2, palette.ink, .9);

    const cursor = { x: width * .31 + driftX * .5, y: height * .36 + driftY * .5 };
    stroke(ctx, cursor, { x: cursor.x + 3, y: cursor.y + 18 }, palette.ink, 1.2, .8);
    stroke(ctx, { x: cursor.x + 3, y: cursor.y + 18 }, { x: cursor.x + 8, y: cursor.y + 12 }, palette.ink, 1.2, .8);
    stroke(ctx, { x: cursor.x + 8, y: cursor.y + 12 }, cursor, palette.ink, 1.2, .8);
  };

  const drawBrain = (state, time) => {
    drawBackdrop(state);
    const { ctx, width, height, pointer, seed } = state;
    const cx = width * .5 + (pointer.x - .5) * 8;
    const cy = height * .4 + (pointer.y - .5) * 6;
    const rx = width * .3;
    const ry = height * .25;
    const phase = time * .003;

    // brain silhouette — a gyrus-wobbled ellipse, drawn as dotted arcs
    let prev = null;
    for (let i = 0; i <= 48; i += 1) {
      const a = i / 48 * TAU - Math.PI / 2;
      const wob = 1 + Math.sin(a * 7 + time * .0006) * .05 + Math.sin(a * 13 - time * .0004) * .03;
      const p = { x: cx + Math.cos(a) * rx * wob, y: cy + Math.sin(a) * ry * wob };
      if (prev) dottedSegment(ctx, prev, p, 4, phase + i * .2, i % 3 === 0 ? palette.ink : palette.mid);
      prev = p;
    }

    // central fissure dividing the two hemispheres
    for (let i = 0; i < 8; i += 1) {
      const t0 = i / 8, t1 = (i + 1) / 8;
      const p0 = { x: cx + Math.sin(t0 * TAU + time * .0008) * rx * .05, y: cy - ry * .82 + ry * 1.64 * t0 };
      const p1 = { x: cx + Math.sin(t1 * TAU + time * .0008) * rx * .05, y: cy - ry * .82 + ry * 1.64 * t1 };
      stroke(ctx, p0, p1, palette.mid, .9, .5);
    }

    // neuron nodes scattered across both hemispheres
    const nodes = [];
    for (let i = 0; i < 16; i += 1) {
      const h = fract(Math.sin((i + 1) * (seed + 7.3)) * 4137.11);
      const g = fract(Math.sin((i + 3) * (seed + 3.1)) * 9931.77);
      const side = i % 2 === 0 ? -1 : 1;
      let ux = (.14 + h * .74) * side;
      let uy = (g - .5) * 1.7;
      const rr = Math.hypot(ux, uy);
      if (rr > .94) { ux *= .94 / rr; uy *= .94 / rr; }
      nodes.push({
        x: cx + ux * rx * .92 + Math.sin(time * .0009 + i) * 1.4,
        y: cy + uy * ry * .92 + Math.cos(time * .0011 + i) * 1.2
      });
    }

    // synapses — each neuron links to its two nearest neighbours, with a travelling signal
    const edges = [];
    nodes.forEach((n, i) => {
      nodes.map((m, j) => ({ j, d: i === j ? 1e9 : Math.hypot(n.x - m.x, n.y - m.y) }))
        .sort((a, b) => a.d - b.d).slice(0, 2)
        .forEach(({ j }) => { if (i < j) edges.push([i, j]); });
    });
    edges.forEach(([a, b], index) => {
      stroke(ctx, nodes[a], nodes[b], palette.light, .8, .6);
      const sig = pointBetween(nodes[a], nodes[b], fract(time * .00013 + index * .17));
      dot(ctx, sig.x, sig.y, 1.5, palette.ink, .68);
    });

    // firing neurons
    const activeIndex = Math.floor(time / 600) % nodes.length;
    nodes.forEach((n, i) => {
      const firing = i === activeIndex;
      dot(ctx, n.x, n.y, firing ? 2.5 : 1.9, palette.ink, .9);
      if (firing) {
        const pulse = fract(time / 600);
        ring(ctx, n.x, n.y, 4 + pulse * 9, palette.ink, 1, .5 * (1 - pulse));
      } else if (i % 3 === 0) {
        ring(ctx, n.x, n.y, 4.6, palette.mid, .8, .5);
      }
    });

    // brainstem — a short tail below the centre
    let stem = { x: cx, y: cy + ry * .8 };
    for (let i = 1; i <= 3; i += 1) {
      const p = { x: cx + Math.sin(time * .001 + i) * 2, y: cy + ry * .8 + i * (ry * .16) };
      stroke(ctx, stem, p, palette.mid, 1, .55);
      dot(ctx, p.x, p.y, 1.6, palette.ink, .78);
      stem = p;
    }
  };

  const drawers = {
    graph: drawGraph,
    governance: drawGovernance,
    growth: drawGrowth,
    portfolio: drawPortfolio,
    brain: drawBrain
  };

  const states = canvases.map((canvas, index) => {
    const state = {
      canvas,
      ctx: canvas.getContext('2d', { alpha: false }),
      type: canvas.dataset.particleVisual,
      width: 1,
      height: 1,
      seed: 11 + index * 17,
      active: false,
      pointer: { x: .5, y: .5, active: false }
    };
    const card = canvas.closest('[data-project-card]');
    let pointerBounds;

    if (finePointer && card) {
      card.addEventListener('pointerenter', () => {
        pointerBounds = card.getBoundingClientRect();
        state.pointer.active = true;
      });
      card.addEventListener('pointermove', (event) => {
        if (!pointerBounds) pointerBounds = card.getBoundingClientRect();
        state.pointer.x = (event.clientX - pointerBounds.left) / pointerBounds.width;
        state.pointer.y = (event.clientY - pointerBounds.top) / pointerBounds.height;
      });
      card.addEventListener('pointerleave', () => {
        pointerBounds = undefined;
        state.pointer.active = false;
        state.pointer.x = .5;
        state.pointer.y = .5;
      });
    }
    return state;
  });

  const render = (state, time) => {
    const draw = drawers[state.type];
    if (draw && state.ctx) draw(state, time);
  };
  const resize = (state) => {
    const bounds = state.canvas.getBoundingClientRect();
    if (bounds.width < 1 || bounds.height < 1 || !state.ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = Math.round(bounds.width);
    state.height = Math.round(bounds.height);
    state.canvas.width = Math.round(state.width * dpr);
    state.canvas.height = Math.round(state.height * dpr);
    state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    state.ctx.lineCap = 'round';
    state.ctx.lineJoin = 'round';
    render(state, reduceMotion ? 0 : performance.now());
  };

  let animationFrame = 0;
  const tick = (time) => {
    animationFrame = 0;
    if (document.hidden) return;
    let hasVisibleCanvas = false;
    states.forEach((state) => {
      if (!state.active) return;
      hasVisibleCanvas = true;
      render(state, time);
    });
    if (hasVisibleCanvas) animationFrame = requestAnimationFrame(tick);
  };
  const ensureLoop = () => {
    if (!reduceMotion && !document.hidden && !animationFrame) animationFrame = requestAnimationFrame(tick);
  };

  const resizeObserver = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      const state = states.find((item) => item.canvas === entry.target);
      if (state) resize(state);
    });
  });
  states.forEach((state) => resizeObserver.observe(state.canvas));

  const visibilityObserver = reduceMotion ? null : new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const state = states.find((item) => item.canvas === entry.target);
      if (!state) return;
      state.active = entry.isIntersecting;
      if (state.active) ensureLoop();
    });
  }, { threshold: .04, rootMargin: '120px 0px' });
  if (visibilityObserver) states.forEach((state) => visibilityObserver.observe(state.canvas));

  document.addEventListener('visibilitychange', ensureLoop);
  window.addEventListener('pagehide', (event) => {
    if (event.persisted) return;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    resizeObserver.disconnect();
    visibilityObserver?.disconnect();
    document.removeEventListener('visibilitychange', ensureLoop);
  });
})();

// ===== Statement: a reversible, compositor-friendly word reveal =====
const stmt = document.querySelector('[data-reveal-words]');
if (stmt) {
  const raw = stmt.innerHTML;
  // keep the leading <b>From</b>, split the rest into word spans
  const bold = stmt.querySelector('b');
  const boldHTML = bold ? bold.outerHTML : '';
  const rest = raw.replace(boldHTML, '').trim();
  stmt.innerHTML = boldHTML + ' ' + rest.split(/\s+/)
    .map((w) => `<span class="rw" style="color:var(--gray-light)">${w}</span>`)
    .join(' ');
  const words = [...stmt.querySelectorAll('.rw')];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce) {
    words.forEach((word) => { word.style.color = 'var(--ink)'; });
  } else if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    const wordTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: stmt,
        start: 'top 82%',
        end: 'bottom 28%',
        scrub: true,
        invalidateOnRefresh: true
      }
    });
    words.forEach((word, index) => {
      wordTimeline.to(word, { color: '#111111', duration: 1, ease: 'none' }, index * 0.58);
    });
  }
}

// ===== Nav: pill expands into a full menu panel =====
const nav = document.querySelector('.nav');
const menuBtn = document.querySelector('.nav__menu');
if (nav && menuBtn) {
  const buddyImg = nav.querySelector('.nav__buddy-img');
  const buddyBubble = nav.querySelector('.nav__buddy-bubble');
  const buddyJokes = [
    'My code works. I won\'t touch it.',
    'I debug with good vibes.',
    'Backend: where the magic hides.',
    'That bug was a feature audition.',
    'Anyway, here\'s Wonderwall.'
  ];
  const buddy = nav.querySelector('.nav__buddy');
  const buddyScenes = [
    { name: 'wave', src: 'waveSrc', lines: ['Hi!', 'Oh, hey!', 'Good to see you.'], min: 3600, max: 5200 },
    { name: 'concert', src: 'guitarSrc', lines: ['Tiny concert!', 'One more song?', 'Practising my riffs.'], min: 5200, max: 7200 },
    { name: 'reading', src: 'idleSrc', lines: ['Just one more chapter…', 'Reading the docs.', 'Plot twist: no bugs.'], min: 5000, max: 7500 },
    { name: 'dog', src: 'idleSrc', lines: ['Who\'s a good dog?', 'Walkies?', 'My pair programmer!'], min: 5000, max: 7200 },
    { name: 'resting', src: 'idleSrc', lines: ['Power nap…', 'Compiling dreams.', 'brb, recharging.'], min: 3800, max: 5600 },
    { name: 'joke', src: 'waveSrc', lines: buddyJokes, min: 4200, max: 6200 }
  ];
  let lastBuddyMode = -1;
  let buddyTimer = 0;
  const playBuddyMoment = () => {
    if (!buddy || !buddyImg || !buddyBubble || !nav.classList.contains('open')) return;
    let mode = Math.floor(Math.random() * buddyScenes.length);
    if (mode === lastBuddyMode) mode = (mode + 1) % buddyScenes.length;
    lastBuddyMode = mode;
    const scene = buddyScenes[mode];
    buddy.className = `nav__buddy is-${scene.name}`;
    const baseSrc = buddyImg.dataset[scene.src];
    const nextSrc = new URL(baseSrc, window.location.href).href;
    if (buddyImg.src !== nextSrc) buddyImg.src = baseSrc;
    buddyBubble.textContent = scene.lines[Math.floor(Math.random() * scene.lines.length)];
    clearTimeout(buddyTimer);
    buddyTimer = window.setTimeout(playBuddyMoment, scene.min + Math.random() * (scene.max - scene.min));
  };
  const toggle = (open) => {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) playBuddyMoment();
    else {
      clearTimeout(buddyTimer);
      if (buddy) buddy.className = 'nav__buddy';
    }
  };
  menuBtn.addEventListener('click', (e) => { e.stopPropagation(); toggle(!nav.classList.contains('open')); });
  buddyImg?.addEventListener('click', (e) => { e.stopPropagation(); playBuddyMoment(); });
  nav.querySelectorAll('.nav__panel a').forEach((a) => a.addEventListener('click', () => toggle(false)));
  document.addEventListener('click', (e) => { if (!e.target.closest('.nav')) toggle(false); });
  // nav visibility is driven by the hero ScrollTrigger below (setNavHidden)
  window.__setNavHidden = (hidden) => {
    nav.classList.toggle('nav--hidden', hidden);
    if (hidden) toggle(false);
  };
}

// ===== Card pointer tilt (fine pointers only; rAF-throttled) =====
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    let rect;
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    card.addEventListener('pointerenter', () => { rect = card.getBoundingClientRect(); });
    card.addEventListener('pointermove', (e) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!rect) rect = card.getBoundingClientRect();
        const x = (pointerX - rect.left) / rect.width - 0.5;
        const y = (pointerY - rect.top) / rect.height - 0.5;
        card.style.transform = `translate3d(0,-8px,0) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
      });
    });
    card.addEventListener('pointerleave', () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      rect = undefined;
      card.style.transform = '';
    });
  });
}

// ===== Contact form: deliver messages through FormSubmit =====
const form = document.querySelector('.contact__form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const note = form.querySelector('.contact__note');
    const button = form.querySelector('.btn-submit');
    const label = form.querySelector('.btn-submit__label');
    if (!button || !label) return;

    button.disabled = true;
    label.textContent = 'Sending message...';
    form.classList.add('is-running');
    if (note) note.hidden = true;

    try {
      const payload = Object.fromEntries(new FormData(form).entries());
      const response = await fetch('https://formsubmit.co/ajax/codes404z@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || result.success === false || result.success === 'false') {
        throw new Error('Message delivery failed');
      }

      form.reset();
      if (note) {
        note.innerHTML = '<strong>[OK]</strong> Message delivered. I’ll get back to you soon.';
        note.hidden = false;
      }
    } catch (error) {
      if (note) {
        note.innerHTML = '<strong>[ERROR]</strong> Message could not be sent. Please email <a href="mailto:codes404z@gmail.com">codes404z@gmail.com</a> directly.';
        note.hidden = false;
      }
    } finally {
      form.classList.remove('is-running');
      button.disabled = false;
      label.textContent = 'Execute message.send()';
    }
  });
}

// Reveal social shortcuts only when their related content has been reached.
(function contextualFloaters() {
  const about = document.getElementById('about');
  const work = document.getElementById('work');
  const contact = document.getElementById('contact');
  if (!about || !work || !contact) return;

  let frame = 0;
  const sync = () => {
    frame = 0;
    const triggerLine = window.innerHeight * 0.76;
    const beforeContact = contact.getBoundingClientRect().top > triggerLine;
    document.body.classList.toggle(
      'floater-instagram-visible',
      beforeContact && about.getBoundingClientRect().top <= triggerLine
    );
    document.body.classList.toggle(
      'floater-github-visible',
      beforeContact && work.getBoundingClientRect().top <= triggerLine
    );
  };
  const queueSync = () => {
    if (frame) return;
    frame = requestAnimationFrame(sync);
  };

  sync();
  window.addEventListener('scroll', queueSync, { passive: true });
  window.addEventListener('resize', queueSync);
}());

// Keep fixed action chips clear of the contact terminal while it is active.
const contactSection = document.getElementById('contact');
if (contactSection) {
  const terminal = contactSection.querySelector('.terminal');
  const reduceTerminalMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let terminalBooted = false;

  const delay = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));
  const typedNodes = terminal ? [...terminal.querySelectorAll('[data-terminal-type]')] : [];
  const outputNodes = terminal ? [...terminal.querySelectorAll('[data-terminal-output]')] : [];
  const secureText = terminal ? terminal.querySelector('.terminal__secure-text') : null;

  typedNodes.forEach((node) => {
    node.dataset.terminalText = node.textContent.trim();
    node.textContent = '';
  });
  if (terminal) terminal.classList.add('terminal--armed');

  const typeCommand = async (node, speed) => {
    if (!node) return;
    const text = node.dataset.terminalText || '';
    node.classList.add('is-typing');
    for (let index = 0; index < text.length; index += 1) {
      node.textContent += text[index];
      await delay(text[index] === ' ' ? speed * 1.7 : speed);
    }
    node.classList.remove('is-typing');
  };

  const completeTerminalImmediately = () => {
    typedNodes.forEach((node) => { node.textContent = node.dataset.terminalText || ''; });
    outputNodes.forEach((node) => node.classList.add('is-visible'));
    if (secureText) secureText.textContent = 'channel ready';
    if (terminal) terminal.classList.add('terminal--ready', 'terminal--booted');
  };

  const bootTerminal = async () => {
    if (!terminal || terminalBooted) return;
    terminalBooted = true;
    if (reduceTerminalMotion) {
      completeTerminalImmediately();
      return;
    }

    terminal.classList.add('terminal--booting');
    if (secureText) secureText.textContent = 'connecting...';
    await delay(140);
    await typeCommand(typedNodes[0], 31);
    await delay(120);
    outputNodes[0]?.classList.add('is-visible');
    await delay(330);
    outputNodes[1]?.classList.add('is-visible');
    await delay(210);
    if (secureText) secureText.textContent = 'channel ready';
    terminal.classList.remove('terminal--booting');
    terminal.classList.add('terminal--ready');
    await delay(170);
    await typeCommand(typedNodes[1], 22);
    terminal.classList.add('terminal--booted');
  };

  const contactObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      document.body.classList.toggle('contact-in-view', entry.isIntersecting);
      if (entry.isIntersecting) bootTerminal();
    });
  }, { threshold: 0.12 });
  contactObserver.observe(contactSection);
}

// ===== Hero portrait: measured, sticky hero-to-about bridge (GSAP + ScrollTrigger + Lenis) =====
(function heroScene() {
  const scene = document.getElementById('heroScene');
  const card = document.getElementById('heroCard');
  const underlay = document.querySelector('.hero-card-underlay');
  const shadow = document.querySelector('.hero-card__shadow');
  const heroYear = document.querySelector('.hero__year');
  if (!scene || !card || typeof gsap === 'undefined') return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LenisCtor = window.Lenis && (window.Lenis.default || window.Lenis);
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.ticker.lagSmoothing(0);

  // Dismiss after ©2026, remain hidden during the entire upward journey,
  // and restore only when the document reaches its top boundary.
  let navDismissed = false;
  const dismissNav = () => {
    if (navDismissed) return;
    navDismissed = true;
    if (window.__setNavHidden) window.__setNavHidden(true);
  };
  const restoreNavAtTop = () => {
    // Lenis can settle a few subpixels above zero after a fast reverse scroll.
    if (!navDismissed || window.scrollY > 16) return;
    navDismissed = false;
    if (window.__setNavHidden) window.__setNavHidden(false);
  };
  window.addEventListener('scroll', restoreNavAtTop, { passive: true });

  const navDismissTrigger = heroYear ? ScrollTrigger.create({
    id: 'nav-after-hero-year',
    trigger: heroYear,
    start: 'bottom top',
    onEnter: dismissNav,
    onRefresh: (self) => {
      if (window.scrollY >= self.start) dismissNav();
    }
  }) : null;

  // Reduced motion is handled in CSS: no sticky bridge and a normal portrait in About.
  if (reduce) {
    window.addEventListener('pagehide', (event) => {
      if (event.persisted) return;
      window.removeEventListener('scroll', restoreNavAtTop);
      navDismissTrigger?.kill();
    });
    return;
  }

  let lenis;
  let ticker;
  let anchorClick;
  let syncLenisSize;
  let resumeAfterIntro;

  // One Lenis instance, driven by GSAP's ticker and connected to ScrollTrigger.
  if (LenisCtor) {
    lenis = new LenisCtor({
      lerp: 0.11,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.88,
      touchMultiplier: 1
    });
    lenis.on('scroll', ScrollTrigger.update);
    ticker = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    window.__lenis = lenis;

    // Prevent wheel input from advancing ScrollTrigger while the opening
    // composition is still resolving. Resume both systems on the same frame.
    if (document.documentElement.classList.contains('site-intro-active')) {
      lenis.stop();
      resumeAfterIntro = () => requestAnimationFrame(() => {
        lenis.start();
        lenis.resize();
        ScrollTrigger.refresh();
        ScrollTrigger.update();
      });
      window.addEventListener('siteintrocomplete', resumeAfterIntro, { once: true });
    }

    syncLenisSize = () => lenis.resize();
    ScrollTrigger.addEventListener('refreshInit', syncLenisSize);

    anchorClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -10, duration: 0.9 });
    };
    document.addEventListener('click', anchorClick);
  }

  const mm = gsap.matchMedia();
  mm.add({ desktop: '(min-width: 901px)', compact: '(max-width: 900px)' }, (context) => {
    const travel = () => Math.min(context.conditions.compact ? window.innerHeight * 0.08 : 114, 114);

    gsap.set(card, {
      y: travel,
      scale: 0.5,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      z: 0,
      transformOrigin: '50% 50%',
      force3D: true
    });
    gsap.set(underlay, {
      y: travel,
      scale: 0.5,
      rotationY: 0,
      opacity: 0.12,
      z: -14,
      transformOrigin: '50% 50%',
      force3D: true
    });
    gsap.set(shadow, { y: travel, opacity: 0.08, scale: 0.42, force3D: true });

    // One primary trigger: 0–100% maps to exactly one viewport of scroll,
    // matching the measured transition on the live reference.
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'hero-portrait-bridge',
        trigger: scene,
        start: 'top top',
        end: () => `+=${window.innerHeight}`,
        // A very short scrub softens frame-to-frame wheel deltas without
        // making the portrait feel detached from the page.
        scrub: 0.12,
        invalidateOnRefresh: true,
        onLeave: () => scene.classList.add('hero-settled'),
        onEnterBack: () => scene.classList.remove('hero-settled')
      }
    });

    tl.to(card, {
      duration: 1,
      y: 0,
      scale: 1,
      rotationY: 180,
      z: 0
    }, 0)
      .to(underlay, { duration: 1, y: 0, scale: 1, rotationY: 180 }, 0)
      .to(underlay, { duration: 0.5, opacity: 0.42, z: -22 }, 0)
      .to(underlay, { duration: 0.5, opacity: 0.06, z: -8 }, 0.5)
      .to(shadow, { duration: 1, y: 0 }, 0)
      .to(shadow, { duration: 0.5, opacity: 0.28, scale: 0.82 }, 0)
      .to(shadow, { duration: 0.5, opacity: 0.06, scale: 0.72 }, 0.5);

    return () => tl.kill();
  });

  // Recalculate once fonts and the eager portrait settle.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());

  // A persisted pagehide means the browser is placing this page in its
  // back-forward cache. Keep the scene alive so Back can resume it intact.
  window.addEventListener('pagehide', (event) => {
    if (event.persisted) return;
    scene.classList.remove('hero-settled');
    window.removeEventListener('scroll', restoreNavAtTop);
    if (navDismissTrigger) navDismissTrigger.kill();
    mm.revert();
    if (anchorClick) document.removeEventListener('click', anchorClick);
    if (resumeAfterIntro) window.removeEventListener('siteintrocomplete', resumeAfterIntro);
    if (syncLenisSize) ScrollTrigger.removeEventListener('refreshInit', syncLenisSize);
    if (ticker) gsap.ticker.remove(ticker);
    if (lenis) {
      lenis.destroy();
      if (window.__lenis === lenis) delete window.__lenis;
    }
  });

  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    const restoredY = window.scrollY;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      lenis?.resize();
      lenis?.scrollTo(restoredY, { immediate: true, force: true });
      ScrollTrigger.refresh();
      ScrollTrigger.update();
      restoreNavAtTop();
    }));
  });
})();

// ===== About: pencil-write reveal — text inks in char-by-char with a ✏️ following the line =====
(function pencilWrite() {
  const nodes = [...document.querySelectorAll('[data-write]')];
  if (!nodes.length) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  nodes.forEach((el) => {
    const text = el.textContent;
    el.textContent = '';
    const frag = document.createDocumentFragment();
    for (const ch of text) {
      const s = document.createElement('span');
      s.className = 'w-ch';
      s.textContent = ch;
      if (ch === ' ') s.style.whiteSpace = 'pre';
      frag.appendChild(s);
    }
    el.appendChild(frag);
    el._chars = [...el.querySelectorAll('.w-ch')];
    const pen = document.createElement('span');
    pen.className = 'write-pencil';
    pen.textContent = '✏️';
    pen.setAttribute('aria-hidden', 'true');
    el.appendChild(pen);
    el._pen = pen;
  });

  if (reduce) {
    nodes.forEach((el) => { el.classList.add('done'); el._chars.forEach((c) => c.classList.add('inked')); el._pen.remove(); });
    return;
  }

  const perChar = 22; // ms per character
  function writeEl(el) {
    return new Promise((res) => {
      el.classList.add('writing');
      const chars = el._chars, pen = el._pen, N = chars.length;
      pen.classList.add('on');
      let start = null;
      function step(ts) {
        if (start === null) start = ts;
        const n = Math.min(N, Math.floor((ts - start) / perChar));
        for (let i = 0; i < n; i++) if (!chars[i].classList.contains('inked')) chars[i].classList.add('inked');
        const cur = chars[Math.min(n, N - 1)];
        if (cur) pen.style.transform = 'translate(' + (cur.offsetLeft + cur.offsetWidth - 2) + 'px,' + (cur.offsetTop - cur.offsetHeight * 0.55) + 'px)';
        if (n >= N) { el.classList.add('done'); pen.classList.remove('on'); setTimeout(() => pen.remove(), 220); res(); return; }
        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  let started = false;
  async function runAll() { if (started) return; started = true; for (const el of nodes) await writeEl(el); }

  const trigger = document.querySelector('#about') || nodes[0];
  const io2 = new IntersectionObserver((ents) => {
    ents.forEach((e) => { if (e.isIntersecting) { runAll(); io2.disconnect(); } });
  }, { threshold: 0.12 });
  io2.observe(trigger);
})();

// ===== About lamp: pull-cord physics ported from bytejay-framer's lampPullPhysics —
// a damped spring with pointer-driven tension. Grab the bead and it eases toward the
// pointer through a stiff damped spring (never pinned, so no ball-like throw); release
// and a softer spring + gravity hangs it home. Pulling past a threshold (or a tap /
// Enter) toggles the "lights": the section dims and the blurred story resolves. It
// drops into the corner when About is entered, then stays pinned. Scroll up = off. =====
(function aboutLamp() {
  const about = document.getElementById('about');
  const lamp = document.querySelector('[data-lamp]');
  if (!about || !lamp) return;
  const path = lamp.querySelector('.lamp__cord-path');
  const bead = lamp.querySelector('.lamp__bead');
  const hint = lamp.querySelector('.lamp__hint');
  const heroYear = document.querySelector('.hero__year');   // ©2026 line — the cord drops in once this scrolls past
  const heroScene = document.getElementById('heroScene');   // scene wrapper — drives the red-card blur
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  // ---- geometry (local px in the fixed lamp layer) ----
  const anchor = { x: 26, y: 0 };     // cord ceiling point
  const rest = { x: 26, y: 240 };     // bead resting point
  const pullThreshold = 70;           // downward pull past rest that arms the toggle
  let wallL = -60;                    // viewport's left edge, in local coords
  const measureWall = () => { wallL = 10 - lamp.getBoundingClientRect().left; };
  const limits = () => ({ left: wallL, right: 146, top: 200, bottom: 370 });

  // ---- spring state ----
  const state = {
    x: rest.x, y: rest.y, vx: 0, vy: 0, targetX: rest.x, targetY: rest.y,
    dragging: false, pointerId: null, moved: false, maxPull: 0,
    frame: 0, lastTime: 0, startClientX: 0, startClientY: 0,
    grabOffsetX: 0, grabOffsetY: 0, suppressClick: false, suppressTimer: 0, deployed: false, dropping: false
  };

  // ---- lights: the dark room + resolved text (scoped to #about) and the lit cord ----
  let on = false;
  const restHint = () => on ? 'lights on' : 'pull to read';
  const setLights = (next) => {
    if (next === on) return;
    on = next;
    about.classList.toggle('lights-on', on);
    lamp.classList.toggle('is-lit', on);
    if (heroScene) heroScene.classList.toggle('lights-on', on);   // unblurs the red portrait card
    bead.setAttribute('aria-pressed', String(on));
    if (hint && !state.dragging) hint.textContent = restHint();
  };

  // ---- render: a bowing cubic cord + a bead that leans into the swing ----
  const render = () => {
    const lateral = state.x - anchor.x;
    const length = state.y - anchor.y;
    const sway = clamp(state.vx * 0.016, -15, 15);
    const c1x = anchor.x + lateral * 0.12 - sway * 0.08;
    const c2x = state.x - lateral * 0.2 - sway;
    path.setAttribute('d', `M${anchor.x} ${anchor.y} C${c1x.toFixed(2)} ${(anchor.y + length * 0.34).toFixed(2)} ${c2x.toFixed(2)} ${(anchor.y + length * 0.72).toFixed(2)} ${state.x.toFixed(2)} ${state.y.toFixed(2)}`);
    const rot = clamp(lateral * 0.12 + state.vx * 0.018, -14, 14);
    bead.style.transform = `translate(${state.x.toFixed(2)}px,${state.y.toFixed(2)}px) translate(-50%,0) rotate(${rot.toFixed(2)}deg)`;
    lamp.classList.toggle('is-armed', state.maxPull >= pullThreshold && state.dragging);
    if (hint && state.dragging) hint.textContent = state.maxPull >= pullThreshold ? 'release' : restHint();
  };
  const layoutHint = () => { if (hint) hint.style.transform = `translate(${rest.x}px, ${rest.y + 40}px) translateX(-50%)`; };

  // ---- integrator: pointer-tension spring while dragging, hang spring on release ----
  const stop = () => { if (state.frame) cancelAnimationFrame(state.frame); state.frame = 0; state.lastTime = 0; };
  const tick = (time) => {
    state.frame = 0;
    const dt = state.lastTime ? Math.min((time - state.lastTime) / 1000, 0.032) : 1 / 60;
    state.lastTime = time;
    const lim = limits();

    if (state.dragging) {
      const stiffness = 560, damping = 34;
      state.vx += ((state.targetX - state.x) * stiffness - state.vx * damping) * dt;
      state.vy += ((state.targetY - state.y) * stiffness - state.vy * damping) * dt;
    } else {
      // neutral point sits above rest; gravity pulls it down into equilibrium for a natural hang
      const spring = 105, damping = 12.8, gravity = 1365;
      const neutralY = rest.y - gravity / spring;
      state.vx += ((rest.x - state.x) * spring - state.vx * damping) * dt;
      state.vy += ((neutralY - state.y) * spring + gravity - state.vy * damping) * dt;
    }
    state.x += state.vx * dt;
    state.y += state.vy * dt;

    if (state.dropping && state.y >= lim.top) state.dropping = false;   // the drop has fallen into normal range
    if (state.y > lim.bottom) { state.y = lim.bottom; state.vy *= -0.24; }
    else if (state.y < lim.top && !state.dropping) { state.y = lim.top; state.vy = Math.abs(state.vy) * 0.2; }
    if (state.x < lim.left || state.x > lim.right) { state.x = clamp(state.x, lim.left, lim.right); state.vx *= -0.28; }

    render();
    const settled = !state.dragging &&
      Math.abs(state.x - rest.x) < 0.08 && Math.abs(state.y - rest.y) < 0.08 &&
      Math.abs(state.vx) < 0.35 && Math.abs(state.vy) < 0.35;
    if (settled) {
      state.x = rest.x; state.y = rest.y; state.vx = 0; state.vy = 0; state.maxPull = 0; state.dropping = false;
      lamp.classList.remove('is-armed');
      if (hint) hint.textContent = restHint();
      render(); stop(); return;
    }
    state.frame = requestAnimationFrame(tick);
  };
  const start = () => { if (!state.frame && !motionQuery.matches) state.frame = requestAnimationFrame(tick); };

  // ---- pointer interaction ----
  const pointFromEvent = (e) => { const b = lamp.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
  const onPointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    const p = pointFromEvent(e);
    state.dragging = true; state.pointerId = e.pointerId; state.moved = false; state.maxPull = 0;
    state.startClientX = e.clientX; state.startClientY = e.clientY;
    state.grabOffsetX = p.x - state.x; state.grabOffsetY = p.y - state.y;
    state.targetX = state.x; state.targetY = state.y;
    lamp.classList.add('is-dragging');
    bead.setPointerCapture?.(e.pointerId);
    measureWall();
    if (motionQuery.matches) { state.x = state.targetX; state.y = state.targetY; render(); } else start();
  };
  const onPointerMove = (e) => {
    if (!state.dragging || e.pointerId !== state.pointerId) return;
    const p = pointFromEvent(e);
    const lim = limits();
    state.targetX = clamp(p.x - state.grabOffsetX, lim.left, lim.right);
    state.targetY = clamp(p.y - state.grabOffsetY, lim.top, lim.bottom);
    state.maxPull = Math.max(state.maxPull, state.targetY - rest.y);
    state.moved ||= Math.hypot(e.clientX - state.startClientX, e.clientY - state.startClientY) > 5;
    if (motionQuery.matches) { state.x = state.targetX; state.y = state.targetY; render(); } else start();
  };
  const releasePointer = (e, cancelled = false) => {
    if (!state.dragging || (e.pointerId !== undefined && e.pointerId !== state.pointerId)) return;
    if (!cancelled && Number.isFinite(e.clientX)) {
      const p = pointFromEvent(e);
      const lim = limits();
      const finalY = clamp(p.y - state.grabOffsetY, lim.top, lim.bottom);
      state.maxPull = Math.max(state.maxPull, finalY - rest.y);
      state.moved ||= Math.hypot(e.clientX - state.startClientX, e.clientY - state.startClientY) > 5;
    }
    const shouldToggle = !cancelled && state.maxPull >= pullThreshold;
    state.dragging = false; state.pointerId = null;
    state.suppressClick = state.moved;
    window.clearTimeout(state.suppressTimer);
    state.suppressTimer = window.setTimeout(() => { state.suppressClick = false; }, 0);
    state.targetX = rest.x; state.targetY = rest.y;
    lamp.classList.remove('is-dragging', 'is-armed');
    if (hint) hint.textContent = restHint();
    if (shouldToggle) setLights(!on);
    if (motionQuery.matches) { state.x = rest.x; state.y = rest.y; state.vx = 0; state.vy = 0; state.maxPull = 0; render(); stop(); } else start();
  };
  const simulatePull = () => {                                      // tap / keyboard: toggle with a small tug
    setLights(!on);
    if (motionQuery.matches) return;
    state.vy = Math.max(state.vy, 720);
    state.vx += on ? 46 : -46;
    state.maxPull = pullThreshold;
    start();
  };

  bead.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', releasePointer);
  window.addEventListener('pointercancel', (e) => releasePointer(e, true));
  bead.addEventListener('click', (e) => {
    if (state.suppressClick) { state.suppressClick = false; e.preventDefault(); return; }
    simulatePull();
  });
  bead.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); simulatePull(); }
  });

  // ---- deploy (drop in) once we've scrolled past ©2026; then persist ----
  let leaveTimer = 0;
  const deploy = () => {
    if (state.deployed) return;
    window.clearTimeout(leaveTimer);
    lamp.classList.remove('is-leaving');
    state.deployed = true;
    lamp.hidden = false;
    measureWall(); layoutHint();
    if (motionQuery.matches) { state.x = rest.x; state.y = rest.y; render(); return; }
    state.x = rest.x; state.y = 0; state.vx = 0; state.vy = 0; state.dropping = true;   // drop the cord from the ceiling
    render(); start();
  };
  // Retract the cord with an animation (fade + drift up) instead of snapping it away.
  const finalizeVanish = () => {
    lamp.hidden = true; lamp.classList.remove('is-leaving');
    state.x = rest.x; state.y = rest.y; state.vx = 0; state.vy = 0; state.maxPull = 0;
    render();
  };
  const vanish = () => {
    if (!state.deployed) return;
    state.deployed = false; state.dropping = false;
    setLights(false);
    if (motionQuery.matches) { stop(); finalizeVanish(); return; }
    lamp.classList.add('is-leaving');                 // CSS fades opacity → 0 and drifts it up
    window.clearTimeout(leaveTimer);
    leaveTimer = window.setTimeout(() => { stop(); finalizeVanish(); }, 520);
  };
  // How far the ©2026 line's bottom sits from the top of the viewport (falls back to
  // About's own position if that line is ever missing).
  const yearBottom = () => {
    const r = heroYear && heroYear.getBoundingClientRect();
    return r ? r.bottom : about.getBoundingClientRect().top - 18;
  };
  const DEPLOY_AT = 8;    // ©2026 has scrolled up past the top → drop the cord in
  const RETRACT_AT = 60;  // ©2026 has come back onto the screen → retract (hysteresis gap)

  // Deploy the moment we're past ©2026 (any scroll — a narrow one-frame window would be
  // skipped by the site's scroll cadence); retract once it's clearly back on screen.
  let lastY = window.scrollY, upAccum = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY, dy = y - lastY; lastY = y;
    const yb = yearBottom();
    if (!state.deployed) {
      if (yb <= DEPLOY_AT) deploy();
    } else {
      if (yb >= RETRACT_AT) vanish();
      if (dy < -1) { upAccum -= dy; if (on && upAccum > 36) setLights(false); }
      else if (dy > 1) upAccum = 0;
    }
  }, { passive: true });

  // Direct deep-links / reloads can land already past ©2026 — deploy without a scroll.
  requestAnimationFrame(() => { if (!state.deployed && yearBottom() <= DEPLOY_AT) deploy(); });

  // Leaving About entirely also turns the lights off.
  new IntersectionObserver((ents) => {
    ents.forEach((e) => { if (!e.isIntersecting) setLights(false); });
  }, { threshold: 0 }).observe(about);

  window.addEventListener('resize', () => { measureWall(); layoutHint(); });
  render();
})();

// ===== Journey departure: a treasure scroll drops before the island loads =====
// Clicking "Journey" shouldn't hard-cut to a blank page while the WebGL island
// boots. Instead we darken the room, drop a rolled map from above, prefetch the
// journey document + its chunks, then navigate — the journey page paints the
// same dark backdrop and unfolds that very scroll into a route across Jay's
// chapters. The two documents share a backdrop so the hop is invisible.
(function journeyDeparture() {
  const link = document.querySelector('a[href="/journey/"], a[href="/journey"]');
  if (!link) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let leaving = false;

  // Warm the destination on intent (hover/focus) so navigation is near-instant.
  let warmed = false;
  const warm = () => {
    if (warmed) return; warmed = true;
    [
      '/journey/',
      '/_next/static/chunks/app/journey/page-59d19a1ad7a16946.js',
      '/_next/static/chunks/276.ab31ee0a949415fb.js',
      '/_next/static/chunks/945-bae57af0201e0822.js',
    ].forEach((href) => {
      const l = document.createElement('link');
      l.rel = href.endsWith('/') ? 'prefetch' : 'preload';
      if (l.rel === 'preload') l.as = 'script';
      l.href = href; document.head.appendChild(l);
    });
  };
  link.addEventListener('pointerenter', warm, { once: true });
  link.addEventListener('focus', warm, { once: true });

  const go = () => { window.location.href = '/journey/'; };

  link.addEventListener('click', (e) => {
    // respect new-tab / modified clicks
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (leaving) return; leaving = true;
    warm();
    try { sessionStorage.setItem('bytejay:jrny-depart', '1'); } catch (err) {}
    try { window.__lenis && window.__lenis.stop(); } catch (err) {}

    if (reduce) { go(); return; }

    // Build the departure overlay: same dark backdrop + a rolled scroll dropping in.
    const ov = document.createElement('div');
    ov.className = 'jrny-depart';
    ov.setAttribute('aria-hidden', 'true');
    ov.innerHTML =
      '<div class="jd-vignette"></div>' +
      '<div class="jd-scroll">' +
        '<div class="jd-rod jd-rod--top"></div>' +
        '<div class="jd-roll"></div>' +
        '<div class="jd-rod jd-rod--bottom"></div>' +
      '</div>' +
      '<p class="jd-word">Charting the route…</p>';
    document.body.appendChild(ov);

    // Drop the scroll with weight + a small landing overshoot (GSAP if present).
    const scroll = ov.querySelector('.jd-scroll');
    const word = ov.querySelector('.jd-word');
    if (window.gsap) {
      const tl = window.gsap.timeline();
      tl.to(ov, { opacity: 1, duration: 0.28, ease: 'power2.out' }, 0)
        .fromTo(scroll,
          { yPercent: -170, rotate: -3 },
          { yPercent: 0, rotate: 0, duration: 0.92, ease: 'back.out(1.5)' }, 0.06)
        .to(scroll, { rotate: 1.1, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0.9)
        .fromTo(word, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5 }, 0.6);
    } else {
      requestAnimationFrame(() => ov.classList.add('is-in'));
    }

    // Navigate once the scroll has visibly landed (min beat), continuing on arrival.
    setTimeout(go, 1050);
  });
})();
