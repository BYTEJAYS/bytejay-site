const projects = {
  graph: {
    title: 'Transaction Graph Engine',
    eyebrow: 'NOW PLAYING · PROJECT 01',
    description: 'A graph-native fraud detection engine that follows money across connected accounts, exposes suspicious communities, and helps investigators understand why a transaction was flagged.',
    image: '../assets/images/project-transaction-graph-doodle-v1.webp',
    url: 'https://github.com/BYTEJAYS/TRANSACTION-GRAPH-ENGINE',
    color: '#ff8a62',
  },
  control: {
    title: 'AI Control Plane',
    eyebrow: 'NOW PLAYING · PROJECT 02',
    description: 'A production governance layer for AI requests, with policy checkpoints, observability and human-readable controls for teams shipping model-powered products.',
    image: '../assets/images/project-ai-control-doodle-v1.webp',
    url: 'https://github.com/BYTEJAYS',
    color: '#91a4ff',
  },
  growth: {
    title: 'GrowthDesk',
    eyebrow: 'NOW PLAYING · PROJECT 03',
    description: 'A multi-tenant agent workspace that coordinates tools, memory and repeatable growth workflows while keeping every client environment isolated.',
    image: '../assets/images/project-growthdesk-doodle-v1.webp',
    url: 'https://github.com/BYTEJAYS',
    color: '#a78bfa',
  },
  reality: {
    title: 'Personal Reality Layer',
    eyebrow: 'NOW PLAYING · PROJECT 04',
    description: 'A private, local-first AI companion and memory layer designed to understand personal context without sending the user’s life to a remote service.',
    image: '../assets/images/project-portfolio-doodle-v1.webp',
    url: 'https://github.com/BYTEJAYS',
    color: '#66c7d5',
  },
};

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
const canvas = document.querySelector('[data-demo-canvas]');
const context = canvas?.getContext('2d');
let playing = true;
let activeKey = 'graph';
let particles = [];

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
  window.setTimeout(() => {
    if (demoImage) demoImage.src = project.image;
    if (demoTitle) demoTitle.textContent = project.title;
    if (demoDescription) demoDescription.textContent = project.description;
    if (demoEyebrow) demoEyebrow.textContent = project.eyebrow;
    if (demoLink) demoLink.href = project.url;
    if (nowTitle) nowTitle.textContent = project.title;
    buildParticles(project.color);
    stage?.classList.remove('is-changing');
    setPlaying(true);
  }, 180);
};

playButtons.forEach((button) => button.addEventListener('click', () => setPlaying(!playing)));
tracks.forEach((track) => track.addEventListener('click', () => selectProject(track.dataset.project)));
buildParticles(projects.graph.color);
setPlaying(true);
requestAnimationFrame(drawDemo);
