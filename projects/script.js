const projects = {
  site: {
    title: 'bytejay-site',
    eyebrow: 'NOW PLAYING · REPOSITORY 01',
    description: 'ByteJay’s interactive personal portfolio, combining a cinematic hero journey, animated project visuals, a 3D timeline and playful interface experiments.',
    image: '../assets/images/project-portfolio-doodle-v1.webp',
    url: 'https://github.com/BYTEJAYS/bytejay-site',
    color: '#1ed760',
    tools: 'HTML · CSS · JavaScript · Vercel',
  },
  profile: {
    title: 'BYTEJAYS',
    eyebrow: 'NOW PLAYING · REPOSITORY 02',
    description: 'A terminal-style GitHub profile that presents ByteJay’s engineering identity, current work and technical interests through a command-line interface.',
    image: '../assets/images/project-ai-control-doodle-v1.webp',
    url: 'https://github.com/BYTEJAYS/BYTEJAYS',
    color: '#1ed760',
    tools: 'Python · Terminal UI',
  },
  graph: {
    title: 'Transaction Graph Engine',
    eyebrow: 'NOW PLAYING · REPOSITORY 03',
    description: 'A graph-native fraud detection engine that follows money across connected accounts, exposes suspicious communities, and helps investigators understand why a transaction was flagged.',
    image: '../assets/images/project-transaction-graph-doodle-v1.webp',
    url: 'https://github.com/BYTEJAYS/TRANSACTION-GRAPH-ENGINE',
    color: '#1ed760',
    tools: 'Python · NetworkX',
  },
  bling: {
    title: 'bling-blue-team',
    eyebrow: 'NOW PLAYING · REPOSITORY 04',
    description: 'A forensic fraud-detection engine created for the Union Bank of India hackathon, using a three-tier machine-learning pipeline, XGBoost, SHAP explainability and STR report generation.',
    image: '../assets/images/project-growthdesk-doodle-v1.webp',
    url: 'https://github.com/BYTEJAYS/bling-blue-team',
    color: '#b3b3b3',
    tools: 'Python · XGBoost · SHAP',
  },
};

requestAnimationFrame(() => requestAnimationFrame(() => {
  document.documentElement.classList.remove('projects-entering');
}));

const splitMotionText = (element) => {
  if (!element || element.querySelector('.motion-char')) return;
  const lines = element.innerText.split('\n').map((line) => line.trim()).filter(Boolean);
  const label = lines.join(' ');
  let index = 0;
  element.setAttribute('aria-label', label);
  element.innerHTML = lines.map((line) => [...line].map((char) => char === ' '
    ? '<span class="motion-space" aria-hidden="true"></span>'
    : `<span class="motion-char" style="--char-index:${index++}" aria-hidden="true">${char}</span>`
  ).join('')).join('<br />');
};
splitMotionText(document.querySelector('.playlist-copy h1'));
splitMotionText(document.querySelector('.player-library__head h2'));

const tracks = [...document.querySelectorAll('[data-track]')];
const playButtons = [...document.querySelectorAll('[data-play]')];
const bars = document.querySelector('.bars');
const status = document.querySelector('[data-status]');
const nowTitle = document.querySelector('[data-now-title]');
const stage = document.querySelector('[data-project-stage]');
const demoImage = document.querySelector('[data-demo-image]');
const demoTitle = document.querySelector('[data-demo-title]');
const demoDescription = document.querySelector('[data-demo-description]');
const demoLink = document.querySelector('[data-demo-link]');
const demoEyebrow = document.querySelector('.project-stage__eyebrow');
const demoTools = document.querySelector('[data-demo-tools]');
const canvas = document.querySelector('[data-demo-canvas]');
const context = canvas?.getContext('2d');
const modal = document.querySelector('[data-project-modal]');
const progress = document.querySelector('[data-progress]');
const currentTime = document.querySelector('[data-current-time]');
let playing = true;
let activeKey = 'site';
let particles = [];
let elapsed = 0;
let lastFrame = 0;
tracks.forEach((track, index) => track.style.setProperty('--track-index', index));
document.querySelectorAll('[data-player-track]').forEach((track, index) => track.style.setProperty('--player-index', index));

const buildParticles = (color) => {
  particles = Array.from({length: 54}, (_, index) => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: index % 7 === 0 ? 5 : 2.2,
    speed: .25 + Math.random() * 1.2,
    phase: Math.random() * Math.PI * 2,
    color: index % 6 === 0 ? '#ffffff' : color,
  }));
};

const drawDemo = (time = 0) => {
  if (playing && modal && !modal.hidden) {
    if (lastFrame) elapsed = (elapsed + (time - lastFrame) / 1000) % 18;
    if (progress) progress.style.width = `${elapsed / 18 * 100}%`;
    if (currentTime) currentTime.textContent = `0:${String(Math.floor(elapsed)).padStart(2, '0')}`;
  }
  lastFrame = time;
  if (context && canvas) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle, index) => {
      if (playing) {
        particle.x += particle.speed;
        particle.y += Math.sin(time * .002 + particle.phase) * .35;
        if (particle.x > canvas.width + 10) particle.x = -10;
      }
      context.beginPath();
      context.fillStyle = particle.color;
      context.globalAlpha = .45 + Math.sin(time * .002 + index) * .22;
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
      if (index % 5 === 0) {
        context.strokeStyle = particle.color;
        context.globalAlpha = .14;
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(canvas.width / 2 + Math.sin(time * .001 + index) * 120, canvas.height / 2);
        context.stroke();
      }
    });
    context.globalAlpha = 1;
  }
  requestAnimationFrame(drawDemo);
};

const setPlaying = (next) => {
  playing = next;
  document.body.classList.toggle('playlist-playing', playing);
  playButtons.forEach((button) => {
    button.textContent = playing ? 'Ⅱ' : '▶';
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? 'Pause project demo' : 'Play project demo');
  });
  bars?.classList.toggle('is-playing', playing);
  if (status) status.textContent = playing ? `Playing ${projects[activeKey].title}` : 'Demo paused';
};

const selectProject = (key) => {
  const project = projects[key];
  if (!project) return;
  activeKey = key;
  stage?.classList.add('is-changing');
  tracks.forEach((track) => track.classList.toggle('is-current', track.dataset.project === key));
  document.querySelectorAll('[data-player-track]').forEach((track) => track.classList.toggle('is-current', track.dataset.playerTrack === key));
  window.setTimeout(() => {
    if (demoImage) demoImage.src = project.image;
    if (demoTitle) demoTitle.textContent = project.title;
    if (demoDescription) demoDescription.textContent = project.description;
    if (demoEyebrow) demoEyebrow.textContent = project.eyebrow;
    if (demoTools) demoTools.textContent = project.tools;
    if (demoLink) demoLink.href = project.url;
    if (nowTitle) nowTitle.textContent = project.title;
    buildParticles(project.color);
    elapsed = 0;
    stage?.classList.remove('is-changing');
    setPlaying(true);
  }, 180);
};

playButtons.forEach((button) => button.addEventListener('click', () => setPlaying(!playing)));
const openPlayer = (key) => {
  if (modal) modal.hidden = false;
  document.body.classList.add('modal-open');
  requestAnimationFrame(() => requestAnimationFrame(() => modal?.classList.add('is-open')));
  selectProject(key);
  window.setTimeout(() => document.querySelector('[data-close-player]')?.focus(), 220);
};
const searchInput = document.querySelector('[data-project-search]');
const filterButtons = [...document.querySelectorAll('[data-filter]')];
let activeFilter = 'all';
const filterProjects = () => {
  const query = (searchInput?.value || '').trim().toLowerCase();
  tracks.forEach((track) => {
    const matchesText = track.textContent.toLowerCase().includes(query);
    const matchesLanguage = activeFilter === 'all' || track.dataset.language === activeFilter;
    track.hidden = !(matchesText && matchesLanguage);
  });
};
searchInput?.addEventListener('input', filterProjects);
filterButtons.forEach((button) => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
  filterProjects();
}));
const closePlayer = () => {
  modal?.classList.remove('is-open');
  setPlaying(false);
  window.setTimeout(() => {
    if (modal) modal.hidden = true;
    document.body.classList.remove('modal-open');
  }, 610);
};
const moveProject = (direction) => {
  const keys = Object.keys(projects);
  const index = keys.indexOf(activeKey);
  selectProject(keys[(index + direction + keys.length) % keys.length]);
};
tracks.forEach((track) => track.addEventListener('click', () => openPlayer(track.dataset.project)));
document.querySelectorAll('[data-player-track]').forEach((track) => track.addEventListener('click', () => selectProject(track.dataset.playerTrack)));
document.querySelectorAll('[data-close-player]').forEach((button) => button.addEventListener('click', closePlayer));
document.querySelector('[data-previous-project]')?.addEventListener('click', () => moveProject(-1));
document.querySelector('[data-next-project]')?.addEventListener('click', () => moveProject(1));
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal && !modal.hidden) closePlayer();
});
buildParticles(projects.site.color);
setPlaying(true);
requestAnimationFrame(drawDemo);

// ===== Supari-inspired physical motion layer =====
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hero = document.querySelector('.playlist-hero');
const turntable = document.querySelector('.turntable');
const heroStar = document.querySelector('.playlist-star');
const projectScreen = document.querySelector('.project-stage__screen');
let pointerFrame = 0;

if (!reduceMotion) {
  requestAnimationFrame(() => document.body.classList.add('supari-motion-ready'));

  window.addEventListener('pointermove', (event) => {
    if (pointerFrame) return;
    pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;
      document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`);
      document.documentElement.style.setProperty('--motion-x', `${((x - .5) * 32).toFixed(2)}px`);
      document.documentElement.style.setProperty('--motion-y', `${((y - .5) * 26).toFixed(2)}px`);
    });
  }, {passive: true});

  hero?.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    turntable?.style.setProperty('--hero-tilt-x', `${(-y * 7).toFixed(2)}deg`);
    turntable?.style.setProperty('--hero-tilt-y', `${(x * 9).toFixed(2)}deg`);
    heroStar?.style.setProperty('--star-x', `${(x * 24).toFixed(1)}px`);
    heroStar?.style.setProperty('--star-y', `${(y * 24).toFixed(1)}px`);
  });
  hero?.addEventListener('pointerleave', () => {
    turntable?.style.removeProperty('--hero-tilt-x');
    turntable?.style.removeProperty('--hero-tilt-y');
    heroStar?.style.removeProperty('--star-x');
    heroStar?.style.removeProperty('--star-y');
  });

  projectScreen?.addEventListener('pointermove', (event) => {
    const rect = projectScreen.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    projectScreen.style.setProperty('--screen-rotate-x', `${(-y * 5).toFixed(2)}deg`);
    projectScreen.style.setProperty('--screen-rotate-y', `${(x * 7).toFixed(2)}deg`);
  });
  projectScreen?.addEventListener('pointerleave', () => {
    projectScreen.style.removeProperty('--screen-rotate-x');
    projectScreen.style.removeProperty('--screen-rotate-y');
  });

  document.querySelectorAll('.hero-play,.play-button,.project-transport__play,.project-modal__close').forEach((button) => {
    button.classList.add('is-magnetic');
    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect();
      button.style.setProperty('--magnet-x', `${(event.clientX - rect.left - rect.width / 2) * .2}px`);
      button.style.setProperty('--magnet-y', `${(event.clientY - rect.top - rect.height / 2) * .2}px`);
    });
    button.addEventListener('pointerleave', () => {
      button.style.removeProperty('--magnet-x');
      button.style.removeProperty('--magnet-y');
    });
  });

  tracks.forEach((track) => track.addEventListener('pointermove', (event) => {
    const rect = track.getBoundingClientRect();
    track.style.setProperty('--track-x', `${event.clientX - rect.left}px`);
  }));
}
