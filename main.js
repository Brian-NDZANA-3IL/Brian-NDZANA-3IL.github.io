const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

let mouseX = -9999;
let mouseY = -9999;
window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Titres découpés lettre par lettre
document.querySelectorAll('[data-split]').forEach((el) => {
  const base = Number(el.dataset.delay || 0);
  let i = 0;
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words
    .map((word) => {
      const chars = [...word]
        .map((c) => `<span class="c" style="transition-delay:${base + i++ * 28}ms">${c}</span>`)
        .join('');
      return `<span class="w">${chars}</span>`;
    })
    .join(' ');
  el.setAttribute('aria-label', words.join(' '));
});

// Écran de chargement
const loader = document.getElementById('loader');
const loaderCount = document.getElementById('loaderCount');

let started = false;
function startPage() {
  if (started) return;
  started = true;
  root.classList.add('is-loaded');
  document.querySelectorAll('.hero [data-split]').forEach((el) => el.classList.add('is-visible'));
  setTimeout(() => loader.remove(), 1200);
  startTyper();
}

if (reduceMotion) {
  startPage();
} else {
  const t0 = performance.now();
  (function tick(now) {
    const t = Math.min((now - t0) / 1100, 1);
    loaderCount.textContent = Math.round(100 * (1 - Math.pow(1 - t, 2)));
    if (t < 1) requestAnimationFrame(tick);
    else setTimeout(startPage, 150);
  })(t0);
  setTimeout(startPage, 1800);
}

// Menu mobile
const burger = document.getElementById('burger');
const links = document.getElementById('navLinks');

burger.addEventListener('click', () => {
  const open = links.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', open);
});
links.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    links.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }
});

// Lien actif
const navLinks = [...links.querySelectorAll('a')];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((a) => {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
    });
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach((s) => sectionObserver.observe(s));

// Texte tapé au clavier
const typer = document.getElementById('typer');
const words = ['data science', 'machine learning', 'intelligence artificielle', 'IA générative'];

function startTyper() {
  if (reduceMotion) return;
  let w = 0;
  let len = words[0].length;
  let deleting = true;

  function step() {
    if (deleting) {
      len--;
      if (len === 0) {
        deleting = false;
        w = (w + 1) % words.length;
      }
    } else {
      len++;
    }
    typer.textContent = words[w].slice(0, len);

    let delay = deleting ? 35 : 70;
    if (!deleting && len === words[w].length) {
      deleting = true;
      delay = 2200;
    }
    setTimeout(step, delay);
  }
  setTimeout(step, 2200);
}

// Compteurs
function countUp(el) {
  const target = Number(el.dataset.count);
  const prefix = el.dataset.prefix || '';
  const format = (n) => prefix + Math.round(n).toLocaleString('fr-FR');
  if (reduceMotion) {
    el.textContent = format(target);
    return;
  }
  const start = performance.now();
  (function step(now) {
    const t = Math.min((now - start) / 1600, 1);
    el.textContent = format(target * (1 - Math.pow(1 - t, 4)));
    if (t < 1) requestAnimationFrame(step);
  })(start);
}

// Apparition au scroll
document.querySelectorAll('.skills, .edu, .about__cards').forEach((group) => {
  [...group.children].forEach((child, i) => child.style.setProperty('--stagger', i * 90 + 'ms'));
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    entry.target.querySelectorAll('[data-count]').forEach(countUp);
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal, main section:not(.hero) [data-split]').forEach((el) => revealObserver.observe(el));

// Barre de progression, nav et bandeau qui réagit au scroll
const nav = document.getElementById('nav');
const progress = document.getElementById('progress');
const track = document.getElementById('marqueeTrack');
let lastScroll = window.scrollY;
let velocity = 0;
let marqueeX = 0;

function loop() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  nav.classList.toggle('is-scrolled', y > 10);
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

  velocity += (y - lastScroll - velocity) * 0.1;
  lastScroll = y;

  if (!reduceMotion) {
    const half = track.scrollWidth / 2;
    marqueeX -= 0.6 + Math.abs(velocity) * 0.35;
    if (marqueeX <= -half) marqueeX += half;
    const skew = Math.max(-12, Math.min(12, velocity * 0.4));
    track.style.transform = `translateX(${marqueeX}px) skewX(${-skew}deg)`;
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Grille de points interactive dans le hero
const canvas = document.getElementById('dots');
const ctx = canvas.getContext('2d');
const hero = document.querySelector('.hero');
const GAP = 30;
let dots = [];
let width = 0;
let height = 0;

function buildDots() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = hero.offsetWidth;
  height = hero.offsetHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  dots = [];
  for (let y = GAP / 2; y < height; y += GAP) {
    for (let x = GAP / 2; x < width; x += GAP) {
      dots.push({ x, y, ox: 0, oy: 0, s: 0 });
    }
  }
}

function drawDots(now) {
  const rect = canvas.getBoundingClientRect();
  if (rect.bottom > 0) {
    const mx = mouseX - rect.left;
    const my = mouseY - rect.top;
    const wave = now / 1000;
    ctx.clearRect(0, 0, width, height);

    for (const d of dots) {
      const dx = d.x - mx;
      const dy = d.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const force = Math.max(0, 1 - dist / 160);

      const targetX = dist > 0 ? (dx / dist) * force * 18 : 0;
      const targetY = dist > 0 ? (dy / dist) * force * 18 : 0;
      d.ox += (targetX - d.ox) * 0.12;
      d.oy += (targetY - d.oy) * 0.12;
      d.s += (force - d.s) * 0.12;

      const ripple = (Math.sin(d.x / 90 + d.y / 140 - wave * 1.4) + 1) / 2;
      const r = 1 + ripple * 0.5 + d.s * 2.6;

      ctx.fillStyle = d.s > 0.05 ? '#2f55d4' : '#cfd5e2';
      ctx.globalAlpha = d.s > 0.05 ? 0.35 + d.s * 0.65 : 0.5 + ripple * 0.5;
      ctx.beginPath();
      ctx.arc(d.x + d.ox, d.y + d.oy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  if (!reduceMotion) requestAnimationFrame(drawDots);
}

if (!reduceMotion) {
  buildDots();
  window.addEventListener('resize', buildDots);
  requestAnimationFrame(drawDots);
}

// Effets souris (ordinateur uniquement)
if (canHover && !reduceMotion) {
  const cursor = document.getElementById('cursor');
  let cx = 0;
  let cy = 0;

  (function follow() {
    cx += (mouseX - cx) * 0.18;
    cy += (mouseY - cy) * 0.18;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(follow);
  })();

  document.addEventListener('mouseover', (e) => {
    cursor.classList.add('is-on');
    cursor.classList.toggle('is-hover', !!e.target.closest('a, button'));
  });
  document.addEventListener('mouseleave', () => cursor.classList.remove('is-on'));

  document.querySelectorAll('.magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.4}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

// Filtre des projets
const filters = document.querySelectorAll('.filter');
filters.forEach((button) => {
  button.addEventListener('click', () => {
    filters.forEach((b) => b.classList.toggle('is-active', b === button));
    const cat = button.dataset.filter;
    document.querySelectorAll('.work').forEach((work) => {
      work.classList.toggle('is-hidden', cat !== 'all' && work.dataset.cat !== cat);
    });
  });
});

document.getElementById('year').textContent = new Date().getFullYear();
