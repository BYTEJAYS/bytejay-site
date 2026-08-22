// mark that JS is active so pre-animation "hidden" states only apply with JS on
document.documentElement.classList.add('js');

// ===== Smooth homepage → project playlist handoff =====
(function projectsDeparture() {
  const links = document.querySelectorAll('[data-projects-departure]');
  if (!links.length) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let departing = false;

  // A browser can restore this page from its back/forward cache while the
  // departure wipe is still applied. Reset it every time the homepage appears
  // so returning from Journey or Projects never leaves a black screen behind.
  window.addEventListener('pageshow', () => {
    departing = false;
    document.body.classList.remove('projects-departing');
  });

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || departing) return;
      if (reduceMotion) return;
      event.preventDefault();
      departing = true;
      document.body.classList.add('projects-departing');
      window.setTimeout(() => { window.location.href = link.href; }, 430);
    });
  });
})();

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

// ===== Hero roles + services content =====
(function expandEngineeringRoles() {
  const rotator = document.querySelector('.hero__title-rotator');
  if (rotator && !rotator.querySelector('[data-role="system"]')) {
    const item = document.createElement('span');
    item.className = 'hero__title-item hero__title-item--system';
    item.dataset.role = 'system';
    item.setAttribute('aria-hidden', 'true');
    item.innerHTML = '<span>SYSTEM</span><span>DESIGNER</span>';
    rotator.appendChild(item);

    const accessibleTitle = document.querySelector('.hero__title .sr-only');
    if (accessibleTitle) accessibleTitle.textContent = 'Backend Engineer, AI Engineer and System Designer';

    const cycleStyles = document.createElement('style');
    cycleStyles.textContent = `
      .hero__title-item{animation-name:hero-role-cycle-three;animation-duration:8.4s}
      .hero__title-item--backend{animation-delay:-.35s}
      .hero__title-item--ai{animation-delay:2.45s}
      .hero__title-item--system{animation-delay:5.25s}
      @keyframes hero-role-cycle-three{
        0%{opacity:0;transform:translate3d(0,.12em,0)}
        5%,28%{opacity:1;transform:translate3d(0,0,0)}
        33%{opacity:0;transform:translate3d(0,-.1em,0)}
        33.01%,100%{opacity:0;transform:translate3d(0,.12em,0)}
      }
    `;
    document.head.appendChild(cycleStyles);
  }

})();

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

// ===== Project-card entrance: flip open + drop into place once =====
// Cards inside a spin grid are driven by the scroll-scrubbed tumble instead
// (see projectCardTumble), so they opt out of this one and just go live.
const spinGrid = document.querySelector('[data-spin-grid]');
const flipCards = [...document.querySelectorAll('.work__grid .card')]
  .filter((card) => !card.closest('[data-spin-grid]'));
if (spinGrid) {
  spinGrid.querySelectorAll('.card').forEach((card) => {
    card.classList.add('flip-in', 'card--interactive');
  });
}
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

// ===== Playground nav: equalizer-bar sound toggle =====
(function playgroundNav() {
  const navEl = document.querySelector('[data-playground-nav]');
  const bars = [...document.querySelectorAll('[data-sound-bars] .sound-btn__bar')];
  if (!navEl) return;

  // Hides the nav when scrolling past the hero section.
  window.__setNavHidden = (hidden) => {
    navEl.classList.toggle('playground-nav--hidden', hidden);
  };

  if (!bars.length) return;

  // ---- audio: gesture-gated, feeds each bar its own slice of frequency data ----
  const audioEl = document.querySelector('[data-ambient-audio]');
  let analyser = null;
  let freqData = null;
  let audioSource = null;
  let audioCtx = null;
  let hovering = false;

  // Spread the bars across roughly the bottom two-thirds of the spectrum —
  // the top third of a 32-bin FFT is mostly silence for music — so each bar
  // reads as its own instrument register rather than a repeat of the last.
  const binForBar = (i, total, binCount) => {
    const span = Math.floor(binCount * 0.62);
    return 1 + Math.round((i / (total - 1)) * (span - 1));
  };

  let raf = 0;
  const restingHeight = 0.12;
  const barVal = bars.map(() => restingHeight);
  const barVel = bars.map(() => 0); // velocity for spring physics
  // Per-bar phase offsets for organic, staggered idle motion
  const phaseOff = [0, 2.1, 0.7, 3.2];
  // Per-bar peak heights for hover dance stagger
  const hoverPeaks = [0.65, 0.85, 0.72, 0.92];
  let hoverTime = 0; // tracks how long hover has been active

  function tick(now) {
    raf = requestAnimationFrame(tick);
    const playing = audioEl && !audioEl.paused;

    if (playing && analyser) {
      analyser.getByteFrequencyData(freqData);
    }

    // Track hover duration for progressive dance buildup
    if (hovering) hoverTime = Math.min(hoverTime + 16, 800);
    else hoverTime = Math.max(hoverTime - 32, 0);
    const hoverIntensity = hoverTime / 800; // 0..1 ramp

    for (let i = 0; i < bars.length; i++) {
      let target = restingHeight;

      if (playing && analyser) {
        const bin = binForBar(i, bars.length, freqData.length);
        // Wider range with slight overshoot for punchy feel
        target = Math.max(restingHeight, Math.min(1.05, (freqData[bin] / 255) * 1.8));
      } else {
        // Triple-sine idle wobble with breathing amplitude envelope
        const breathe = 0.85 + Math.sin(now * 0.0005) * 0.15;
        const s1 = Math.sin(now * 0.002   + phaseOff[i]) * 0.5 + 0.5;
        const s2 = Math.sin(now * 0.0011  + phaseOff[i] * 2.3) * 0.5 + 0.5;
        const s3 = Math.sin(now * 0.00055 + phaseOff[i] * 0.7) * 0.5 + 0.5;
        target = restingHeight + (s1 * 0.5 + s2 * 0.3 + s3 * 0.2) * 0.25 * breathe;
      }

      // Hover dance: bars progressively build to staggered peaks
      if (hoverIntensity > 0.01) {
        const hoverWave = Math.sin(now * 0.004 + phaseOff[i] * 1.5) * 0.5 + 0.5;
        const hoverTarget = hoverPeaks[i] * hoverWave * hoverIntensity;
        target = Math.max(target, restingHeight + hoverTarget);
      }

      // Spring physics: snappy attack, elastic overshoot, smooth decay
      const diff = target - barVal[i];
      const springK = diff > 0 ? 0.18 : 0.08;
      const damping = 0.72;
      barVel[i] = barVel[i] * damping + diff * springK;
      barVal[i] = Math.max(0, Math.min(1.05, barVal[i] + barVel[i]));

      // Dynamic border-radius: bars get rounder on peaks
      const roundness = 3 + barVal[i] * 2;
      bars[i].style.transform = `scaleY(${barVal[i].toFixed(3)})`;
      bars[i].style.borderRadius = `${roundness.toFixed(1)}px`;
    }
  }
  raf = requestAnimationFrame(tick);

  navEl.addEventListener('pointerenter', () => { hovering = true; });
  navEl.addEventListener('pointerleave', () => { hovering = false; });

  const labelEl = navEl.querySelector('[data-sound-label]');

  if (audioEl) {
    const toggleSound = async () => {
      const playing = navEl.getAttribute('aria-pressed') === 'true';
      if (playing) {
        audioEl.pause();
        navEl.setAttribute('aria-pressed', 'false');
        navEl.setAttribute('aria-label', 'Play ambient sound');
        navEl.classList.remove('is-playing');
        if (labelEl) labelEl.textContent = 'play music';
        return;
      }
      try {
        if (!audioCtx) {
          const Ctx = window.AudioContext || window.webkitAudioContext;
          audioCtx = new Ctx();
          audioSource = audioCtx.createMediaElementSource(audioEl);
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          freqData = new Uint8Array(analyser.frequencyBinCount);
          audioSource.connect(analyser);
          analyser.connect(audioCtx.destination);
          audioEl._pfAnalyser = analyser;
        }
        if (audioCtx.state === 'suspended') await audioCtx.resume();
        await audioEl.play();
        navEl.setAttribute('aria-pressed', 'true');
        navEl.setAttribute('aria-label', 'Pause ambient sound');
        navEl.classList.add('is-playing');
        if (labelEl) labelEl.textContent = 'pause';
      } catch {
        // Autoplay/decoding can fail silently on some browsers — leave the
        // toggle in its off state rather than claim sound is playing.
      }
    };

    navEl.addEventListener('click', toggleSound);
    navEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleSound();
      }
    });
  }
})();

// ===== Atmospheric Cherry Blossom Drift (from Journey baseline) =====
(function initSakura() {
  const canvas = document.getElementById('sakuraDrift');
  if (canvas && typeof window.SakuraDrift !== 'undefined') {
    new window.SakuraDrift(canvas);
  }
})();

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
      if (entry.isIntersecting) bootTerminal();
    });
  }, { threshold: 0.12 });
  contactObserver.observe(contactSection);
}

// ===== Hero portrait: measured, sticky hero-to-about bridge (GSAP + ScrollTrigger + Lenis) =====
(function heroScene() {
  const scene = document.getElementById('heroScene');
  const heroYear = document.querySelector('.hero__year');
  const heroSince = document.querySelector('.hero__since');
  const heroNavBoundary = heroYear || heroSince;
  // NOTE: this function is not just the portrait animation — it also owns
  // Lenis, the nav hide-on-scroll and anchor scrolling, so it must keep
  // running now that the card is gone. Only the card guard was dropped.
  if (!scene || typeof gsap === 'undefined') return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LenisCtor = window.Lenis && (window.Lenis.default || window.Lenis);
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.ticker.lagSmoothing(0);

  // Dismiss nav immediately when user starts scrolling down,
  // restore only when returned to the top.
  let navDismissed = false;
  const updateNavVisibility = () => {
    const y = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    const shouldHide = y > 20;
    if (shouldHide !== navDismissed) {
      navDismissed = shouldHide;
      if (window.__setNavHidden) window.__setNavHidden(navDismissed);
    }
  };
  window.addEventListener('scroll', updateNavVisibility, { passive: true });
  updateNavVisibility();

  // Reduced motion is handled in CSS: no sticky bridge and a normal portrait in About.
  if (reduce) {
    window.addEventListener('pagehide', (event) => {
      if (event.persisted) return;
      window.removeEventListener('scroll', updateNavVisibility);
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
      // Luxurious slow-inertia glide: low lerp for cinematic, weighty deceleration
      lerp: 0.045,
      duration: 1.4,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.72,
      touchMultiplier: 0.95
    });
    lenis.on('scroll', () => {
      ScrollTrigger.update();
      updateNavVisibility();
    });
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
      lenis.scrollTo(target, { offset: -10, duration: 1.4 });
    };
    document.addEventListener('click', anchorClick);
  }

  // Recalculate once fonts and the eager portrait settle.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());

  // A persisted pagehide means the browser is placing this page in its
  // back-forward cache. Keep the scene alive so Back can resume it intact.
  window.addEventListener('pagehide', (event) => {
    if (event.persisted) return;
    window.removeEventListener('scroll', restoreNavAtTop);
    if (navDismissTrigger) navDismissTrigger.kill();
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

// ===== Journey departure: warm the drive experience without a painted bridge =====
(function journeyDeparture() {
  const link = document.querySelector('a[href="/drive/"], a[href="/drive"]');
  if (!link) return;

  // Older builds inserted a full-screen departure layer and could leave it in
  // the back/forward cache. Remove any restored layer and resume smooth scroll.
  const cleanupLegacyDeparture = () => {
    document.querySelectorAll('.jrny-depart').forEach((node) => node.remove());
    try { sessionStorage.removeItem('bytejay:jrny-depart'); } catch (err) {}
    try { window.__lenis && window.__lenis.start(); } catch (err) {}
  };
  cleanupLegacyDeparture();
  window.addEventListener('pageshow', cleanupLegacyDeparture);

  // Warm the destination on intent (hover/focus) so navigation is near-instant.
  let warmed = false;
  const warm = () => {
    if (warmed) return; warmed = true;
    [
      '/drive/',
    ].forEach((href) => {
      const l = document.createElement('link');
      l.rel = 'prefetch';
      l.href = href; document.head.appendChild(l);
    });
  };
  link.addEventListener('pointerenter', warm, { once: true });
  link.addEventListener('focus', warm, { once: true });
})();

// ===== Editorial scroll motion: theatrical, image-led, and deliberately punchy =====
(function studioInspiredMotion() {
  const aboutSection = document.querySelector('.intro');
  const aboutHeading = document.querySelector('.intro__col--lead h2');
  if (aboutSection) aboutSection.style.fontFamily = "'Archivo', system-ui, sans-serif";
  if (aboutHeading) {
    aboutHeading.textContent = 'HEY!';
    aboutHeading.style.fontFamily = 'var(--studio-display)';
    aboutHeading.style.fontWeight = '900';
    aboutHeading.style.lineHeight = '.82';
    aboutHeading.style.letterSpacing = '.01em';
    aboutHeading.style.textTransform = 'uppercase';
  }
  document.querySelectorAll('.intro .intro__col').forEach((column) => {
    column.style.minWidth = '0';
    column.style.width = '100%';
  });
  document.querySelectorAll('.intro .intro__col p').forEach((paragraph) => {
    paragraph.style.maxWidth = '100%';
    paragraph.style.whiteSpace = 'normal';
    paragraph.style.overflowWrap = 'break-word';
  });
  document.querySelectorAll('.intro [data-write] .w-ch').forEach((character) => {
    character.style.whiteSpace = 'normal';
  });

  const contactTitle = document.querySelector('.contact__title');
  if (contactTitle) contactTitle.classList.add('in');
  const projectsTitle = document.querySelector('.work .section-title');
  if (projectsTitle) {
    projectsTitle.textContent = 'PROJECTS';
    projectsTitle.style.fontFamily = 'var(--studio-display)';
    projectsTitle.style.fontWeight = '900';
    projectsTitle.style.lineHeight = '.82';
    projectsTitle.style.letterSpacing = '.01em';
    projectsTitle.style.textTransform = 'uppercase';
  }
  const servicesTitle = document.querySelector('.services .section-title');
  if (servicesTitle) {
    servicesTitle.textContent = 'WHAT I BUILD';
    servicesTitle.classList.add('in');
  }

  if (
    typeof gsap === 'undefined' ||
    typeof ScrollTrigger === 'undefined' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) return;

  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll('.section-title').forEach((title, index) => {
    if (
      title.closest('.work') ||
      title.closest('.contact') ||
      title.closest('.services')
    ) return;
    gsap.fromTo(title,
      { xPercent: index % 2 ? 7 : -7, rotate: index % 2 ? 1.6 : -1.6 },
      {
        xPercent: 0,
        rotate: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: title,
          start: 'top 96%',
          end: 'top 48%',
          scrub: 0.7,
        },
      }
    );
  });

  // ===== Projects: cards travelling through depth past a fixed camera =====
  // A deterministic 3D model rather than a carousel. Every card's state is a
  // pure function of one scroll progress value, so the same scroll position
  // always yields the same frame and reverse scrolling simply runs it backwards.
  //
  //   pos = P * (n - 1)      the camera's position along the stack
  //   d   = i - pos          a card's signed distance from the camera
  //         d > 0  behind, waiting, receding into the stack
  //         d = 0  active, at z 0, square to the camera
  //         d < 0  passed, moving forward past the camera and fading out
  (function projectShowcase() {
    const grid = document.querySelector('[data-spin-grid]');
    const section = grid && grid.closest('.work');
    if (!grid || !section) return;

    const cells = [...grid.querySelectorAll('.work__cell')];
    const n = cells.length;
    if (!n) return;

    const DEBUG = /(\?|&)debugCards=1\b/.test(window.location.search);
    // ?helix=0 is the flat fan, ?helix=1 the full spiral — for visual tuning
    const HELIX_OVERRIDE = (() => {
      const m = /(?:\?|&)helix=([0-9.]+)/.exec(window.location.search);
      return m ? clamp(parseFloat(m[1]), 0, 1) : null;
    })();

    // Tuned per breakpoint: depth and rotation are reduced on smaller screens,
    // where a strong perspective reads as distortion rather than depth.
    const TIERS = [
      {
        q: '(min-width: 1025px)', persp: 1200, cardW: 0.40, cardMax: 500,
        zStep: 190, zExit: 330, rotMid: 13, rotExit: 24, xSway: 42, ySway: 24,
        xStack: 78, yStack: 46, fan: 1.6,
        helixR: 270, helixTurn: 30, helix: 0.75,
        scaleStep: 0.055, visible: 3.2, scrollPerCard: 0.78,
      },
      {
        q: '(min-width: 641px) and (max-width: 1024px)', persp: 1000, cardW: 0.54, cardMax: 420,
        zStep: 150, zExit: 270, rotMid: 10, rotExit: 18, xSway: 30, ySway: 18,
        xStack: 60, yStack: 36, fan: 1.4,
        helixR: 205, helixTurn: 26, helix: 0.70,
        scaleStep: 0.05, visible: 2.8, scrollPerCard: 0.68,
      },
      {
        q: '(max-width: 640px)', persp: 900, cardW: 0.76, cardMax: 340,
        zStep: 110, zExit: 200, rotMid: 6, rotExit: 12, xSway: 16, ySway: 12,
        xStack: 30, yStack: 22, fan: 1.0,
        helixR: 130, helixTurn: 19, helix: 0.55,
        scaleStep: 0.045, visible: 2.4, scrollPerCard: 0.58,
      },
    ];

    const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
    const clamp01 = (v) => clamp(v, 0, 1);
    // a smooth 0 -> 1 -> 0 bump across one card-length of travel, which is what
    // gives the card its arc through space instead of a straight slide
    const bump = (t) => Math.sin(Math.PI * clamp01(t));
    const smooth = (t) => t * t * (3 - 2 * t);

    let cfg = TIERS[0];
    let debugBox = null;

    /** The whole model: card index + scroll progress -> a physical state. */
    const getCardState = (i, P) => {
      const pos = P * (n - 1);
      const d = i - pos;

      if (d >= 0) {
        // waiting behind the camera, drifting forward as its turn comes
        const b = bump(Math.min(d, 1));
        const dir = i % 2 ? 1 : -1;
        // Waiting cards are placed on a helix around the stack axis — the
        // reference's arrangement — which unwinds to dead centre and square to
        // the camera at d = 0. h blends between that spiral and a flat fan, so
        // the two arrangements can be mixed rather than chosen between.
        const h = HELIX_OVERRIDE === null ? cfg.helix : HELIX_OVERRIDE;
        const theta = (cfg.helixTurn * d * Math.PI) / 180;
        const helixX = cfg.helixR * Math.sin(theta);
        // travelling round the axis also carries the card away from the camera
        const helixZ = -cfg.helixR * (1 - Math.cos(theta));
        return {
          x: (cfg.xStack * d) * (1 - h) + helixX * h + cfg.xSway * b * dir,
          y: cfg.yStack * d + cfg.ySway * b * 0.5,
          z: -cfg.zStep * d + helixZ * h,
          rotateX: -3.2 * b,
          // on the helix a card turns to face along its own tangent, so it is
          // edge-on by the time it is deep in the stack
          rotateY: (-cfg.helixTurn * d) * h - cfg.rotMid * b * dir * (1 - h),
          rotateZ: -cfg.fan * d * (1 - 0.5 * h) - 1.6 * b * dir,
          scale: Math.max(0.72, 1 - cfg.scaleStep * d),
          opacity: 1 - smooth(clamp01((d - cfg.visible) / 1.1)),
          zIndex: Math.round(600 - d * 12),
        };
      }

      // Passed the camera: continues forward, turns away, fades out. k is
      // clamped so cards long gone settle at a fixed state — their transform
      // stops changing, so the redundant-write guard skips them entirely.
      const k = Math.min(-d, 1.1);
      return {
        x: cfg.xSway * 1.1 * k * (i % 2 ? 1 : -1),
        y: -cfg.ySway * 3.2 * k,
        z: cfg.zExit * k,
        rotateX: 5 * k,
        rotateY: cfg.rotExit * k * (i % 2 ? 1 : -1),
        rotateZ: 2.4 * k * (i % 2 ? 1 : -1),
        scale: 1 + 0.07 * k,
        opacity: 1 - smooth(clamp01(k / 0.7)),
        zIndex: Math.round(600 + k * 40),
      };
    };

    const applyLayout = () => {
      const vw = window.innerWidth;
      const vh = Math.max(480, window.innerHeight);
      // 4:5, matching the artwork — but never taller than the room left beside
      // the heading inside the pinned viewport
      let w = Math.min(cfg.cardMax, vw * cfg.cardW);
      let h = w * 1.25;
      const maxH = vh * 0.66;
      if (h > maxH) { h = maxH; w = h / 1.25; }
      grid.style.setProperty('--persp', cfg.persp + 'px');
      grid.style.setProperty('--card-w', Math.round(w) + 'px');
      grid.style.setProperty('--card-h', Math.round(h) + 'px');
      grid.style.setProperty('--stage-h', Math.round(h) + 'px');
    };

    const render = (P) => {
      for (let i = 0; i < n; i += 1) {
        const cell = cells[i];
        const s = getCardState(i, P);
        // one composite transform per card; the card and everything on it move
        // together as a single physical object
        const tf =
          'translate3d(calc(-50% + ' + s.x.toFixed(1) + 'px), calc(-50% + ' +
          s.y.toFixed(1) + 'px), ' + s.z.toFixed(1) + 'px) ' +
          'rotateX(' + s.rotateX.toFixed(2) + 'deg) ' +
          'rotateY(' + s.rotateY.toFixed(2) + 'deg) ' +
          'rotateZ(' + s.rotateZ.toFixed(2) + 'deg) ' +
          'scale(' + s.scale.toFixed(3) + ')';
        // skip redundant writes: they are the expensive part of a scrub frame
        if (cell.__tf !== tf) { cell.style.transform = tf; cell.__tf = tf; }
        const op = s.opacity.toFixed(3);
        if (cell.__op !== op) { cell.style.opacity = op; cell.__op = op; }
        const zi = String(s.zIndex);
        if (cell.__zi !== zi) { cell.style.zIndex = zi; cell.__zi = zi; }
        // only the card at the camera takes clicks
        const pe = Math.abs(i - P * (n - 1)) < 0.5 ? 'auto' : 'none';
        if (cell.__pe !== pe) { cell.style.pointerEvents = pe; cell.__pe = pe; }
      }

      if (debugBox) {
        const pos = P * (n - 1);
        debugBox.textContent =
          'progress ' + P.toFixed(3) + '\nactive  ' + (Math.round(pos) + 1) + ' / ' + n +
          '\n' + cells.map((c, i) => {
            const s = getCardState(i, P);
            return String(i + 1).padStart(2, '0') +
              '  z ' + String(Math.round(s.z)).padStart(5) +
              '  s ' + s.scale.toFixed(2) +
              '  rY ' + s.rotateY.toFixed(1).padStart(6) +
              '  x ' + String(Math.round(s.x)).padStart(5) +
              '  a ' + s.opacity.toFixed(2);
          }).join('\n');
      }
    };

    const mm = gsap.matchMedia();
    TIERS.forEach((tier) => {
      mm.add(tier.q, () => {
        cfg = tier;
        grid.classList.add('is-stack');
        section.classList.add('is-showcase');
        applyLayout();
        render(0);

        if (DEBUG) {
          debugBox = document.createElement('pre');
          debugBox.className = 'work__debug';
          section.appendChild(debugBox);
        }

        const trigger = ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          // Room to breathe: each card gets most of a viewport of scroll, so a
          // transition is never crammed into a couple of hundred pixels.
          end: () => '+=' + Math.round(
            Math.max(600, window.innerHeight) * (0.5 + tier.scrollPerCard * n)
          ),
          pin: true,
          pinSpacing: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefreshInit: applyLayout,
          onUpdate: (self) => render(self.progress),
        });

        return () => {
          trigger.kill();
          grid.classList.remove('is-stack');
          section.classList.remove('is-showcase');
          ['--persp', '--card-w', '--card-h', '--stage-h'].forEach((v) => grid.style.removeProperty(v));
          if (debugBox) { debugBox.remove(); debugBox = null; }
          cells.forEach((c) => {
            c.style.transform = '';
            c.style.opacity = '';
            c.style.zIndex = '';
            c.style.pointerEvents = '';
            c.__tf = c.__op = c.__zi = c.__pe = undefined;
          });
        };
      });
    });

    window.__showcase = { render, getCardState, applyLayout, cells, cfg: () => cfg };
  })();

  // ===== Bee: wanders the contact section on a random hover path =====
  const bee = document.querySelector('[data-bee]');
  const beeHost = bee && bee.closest('.contact');
  if (bee && beeHost && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const MARGIN = 26;
    let bounds = { w: 0, h: 0 };
    // current position, velocity and the point she is drifting toward
    let x = 0, y = 0, vx = 0, vy = 0, tx = 0, ty = 0;
    let lastT = 0, nextRetarget = 0, flying = false, started = false;

    const rand = (min, max) => min + Math.random() * (max - min);

    const measure = () => {
      const r = beeHost.getBoundingClientRect();
      bounds.w = Math.max(0, r.width - bee.offsetWidth - MARGIN * 2);
      bounds.h = Math.max(0, r.height - bee.offsetHeight - MARGIN * 2);
    };

    const retarget = (now) => {
      // bias the next target away from the current one so she actually travels
      let nx, ny, tries = 0;
      do {
        nx = rand(0, bounds.w);
        ny = rand(0, bounds.h);
        tries += 1;
      } while (tries < 6 && Math.hypot(nx - tx, ny - ty) < Math.min(bounds.w, bounds.h) * 0.35);
      tx = nx; ty = ny;
      nextRetarget = now + rand(2800, 5600);
    };

    const step = (now) => {
      if (!flying) return;
      const dt = Math.min(0.05, (now - lastT) / 1000 || 0.016);
      lastT = now;

      if (now > nextRetarget) retarget(now);

      // Spring toward the target so the path curves instead of snapping, plus a
      // little jitter for insect twitch. With the x += v * dt * 60 * SPEED
      // scaling below, this behaves as a spring of natural frequency
      // sqrt(21.6 * k) rad/s and damping ratio damp / (2 * that) — so k sets how
      // quickly she crosses the section and damp sets how much she overshoots.
      // Tuned to ~2.1 rad/s and ratio ~0.62: an unhurried drift that settles
      // rather than darting.
      const k = 0.2, damp = 2.6, SPEED = 0.6;
      vx += ((tx - x) * k + rand(-6, 6)) * dt;
      vy += ((ty - y) * k + rand(-6, 6)) * dt;
      vx -= vx * damp * dt;
      vy -= vy * damp * dt;
      x += vx * dt * 60 * SPEED;
      y += vy * dt * 60 * SPEED;

      x = Math.max(0, Math.min(bounds.w, x));
      y = Math.max(0, Math.min(bounds.h, y));

      // face the direction of travel; bank slightly into the turn
      if (Math.abs(vx) > 1.2) bee.style.setProperty('--bee-flip', vx < 0 ? -1 : 1);
      const tilt = Math.max(-14, Math.min(14, vy * 0.7));
      const bob = Math.sin(now / 520) * 2;

      bee.style.transform =
        `translate3d(${(MARGIN + x).toFixed(2)}px, ${(MARGIN + y + bob).toFixed(2)}px, 0) rotate(${tilt.toFixed(2)}deg)`;

      requestAnimationFrame(step);
    };

    const start = () => {
      if (started) return;
      started = true;
      measure();
      x = rand(0, bounds.w); y = rand(0, bounds.h);
      tx = x; ty = y;
      bee.classList.add('is-flying');
      flying = true;
      lastT = performance.now();
      retarget(lastT);
      requestAnimationFrame(step);
    };

    // only fly while the section is on screen — no work when scrolled away
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!started) { start(); return; }
          if (!flying) { flying = true; lastT = performance.now(); requestAnimationFrame(step); }
        } else {
          flying = false;
        }
      });
    }, { threshold: 0.08 });
    io.observe(beeHost);

    window.addEventListener('resize', () => {
      measure();
      x = Math.min(x, bounds.w); y = Math.min(y, bounds.h);
      tx = Math.min(tx, bounds.w); ty = Math.min(ty, bounds.h);
    });
  }

  const statement = document.querySelector('.statement p');
  if (statement) {
    gsap.fromTo(statement,
      { rotate: -1.8, scale: 0.91 },
      {
        rotate: 1.2,
        scale: 1.04,
        ease: 'none',
        scrollTrigger: {
          trigger: statement,
          start: 'top 92%',
          end: 'bottom 25%',
          scrub: 0.9,
        },
      }
    );
  }

})();

// ===== Aaki: the dancing cat, stepped through her sprite grid =====
// One dance cycle rendered to a 6x5 sheet (tools/aaki/render_aaki.py). Only
// runs while the About section is on screen, so she costs nothing elsewhere.
(function aakiDance() {
  const aaki = document.querySelector('[data-aaki]');
  const sprite = aaki && aaki.querySelector('.aaki__sprite');
  const host = aaki && aaki.closest('section');
  if (!aaki || !sprite || !host) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const COLS = 6;
  const ROWS = 5;
  const FRAMES = COLS * ROWS;
  const FPS = 24;                       // her authored cycle is ~1s at 30fps
  const STEP_MS = 1000 / FPS;

  let frame = 0;
  let last = 0;
  let running = false;
  let raf = 0;

  const draw = () => {
    const col = frame % COLS;
    const row = Math.floor(frame / COLS);
    // percentage positioning: frame i sits at i/(n-1) across each axis
    sprite.style.backgroundPosition =
      `${(col / (COLS - 1)) * 100}% ${(row / (ROWS - 1)) * 100}%`;
  };

  const tick = (now) => {
    if (!running) return;
    if (now - last >= STEP_MS) {
      last = now - ((now - last) % STEP_MS);
      frame = (frame + 1) % FRAMES;
      draw();
    }
    raf = requestAnimationFrame(tick);
  };

  const start = () => {
    if (running) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };
  const stop = () => {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  draw();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => (entry.isIntersecting ? start() : stop()));
  }, { threshold: 0.05 });
  io.observe(host);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (host.getBoundingClientRect().bottom > 0) start();
  });
})();
