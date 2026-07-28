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
  if (modal) modal.hidden = true;
  document.body.classList.remove('modal-open');
  setPlaying(false);
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
