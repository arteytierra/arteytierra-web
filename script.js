// ═══════════════════════════════════════════
// ARTE Y TIERRA — interacciones
// ═══════════════════════════════════════════

// ── Nav scroll effect ──
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });
}

// ── Language toggle (ES / EN / FR — persist via localStorage) ──
const STORAGE_KEY = 'ayt-lang';
const IN_FR = window.location.pathname.includes('/fr/');

function applyLang(lang) {
  document.body.classList.toggle('en', lang === 'en');
  document.documentElement.lang = lang;
  try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  // Update active state on lang buttons
  document.querySelectorAll('[data-setlang]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.setlang === lang);
  });
}

// Legacy toggle (kept for backward compat — cycles ES ↔ EN on non-FR pages)
function toggleLang() {
  if (IN_FR) { setLang('es'); return; }
  const current = document.body.classList.contains('en') ? 'en' : 'es';
  applyLang(current === 'es' ? 'en' : 'es');
}

// New: explicit setLang — navigates if needed
function setLang(lang) {
  const path = window.location.pathname;
  const filename = path.split('/').pop() || 'index.html';

  if (IN_FR) {
    if (lang === 'fr') return;
    // Going to root (ES or EN)
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    window.location.href = `../${filename}`;
    return;
  }
  // On root pages
  if (lang === 'fr') {
    window.location.href = `fr/${filename}`;
    return;
  }
  applyLang(lang);
}

// On load: restore preference (root only — /fr/ always shows FR)
if (!IN_FR) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en') applyLang('en');
    else applyLang('es');
  } catch (e) { applyLang('es'); }
} else {
  document.documentElement.lang = 'fr';
  // Mark FR button active
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-setlang="fr"]').forEach(b => b.classList.add('active'));
  });
}

// ── Mobile menu ──
function toggleMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.toggle('open');
}

// ── Project filter (only on Proyectos page) ──
function filterProjects(category) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  event.currentTarget.classList.add('active');
  document.querySelectorAll('.project-card').forEach(card => {
    const type = card.dataset.type;
    card.classList.toggle('hidden', category !== 'all' && type !== category);
  });
}

// ── Fade-in on scroll ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .project-card, .testi-card, .tp-item, .team-member, .process-step').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// ── Copy to clipboard (CBU, alias, etc) ──
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const original = btn.textContent;
    btn.textContent = document.body.classList.contains('en') ? 'COPIED' : 'COPIADO';
    btn.style.background = 'var(--ocre)';
    btn.style.color = 'var(--negro)';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
      btn.style.color = '';
    }, 1500);
  }).catch(() => {
    alert(document.body.classList.contains('en') ? 'Could not copy. Please copy manually.' : 'No se pudo copiar. Hacelo manualmente.');
  });
}

// ── Lightbox YouTube ──
function openLightbox(videoId) {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.querySelector('iframe').src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.querySelector('iframe').src = '';
  lb.classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// ── Carrusel de proyectos ──
window.initProjCarousel = function (el) {
  const slides = el.querySelector('.slides');
  const dots = el.querySelectorAll('.dot');
  const total = el.querySelectorAll('.slide').length;
  const counter = el.querySelector('.proj-counter');
  if (total <= 1) {
    el.querySelectorAll('.arrow, .dots, .proj-counter').forEach(n => { if (n) n.style.display = 'none'; });
    return;
  }
  let i = 0;
  const go = (n) => {
    i = (n + total) % total;
    slides.style.transform = `translateX(-${i * 100}%)`;
    dots.forEach((d, k) => d.classList.toggle('active', k === i));
    if (counter) counter.textContent = `${i + 1} / ${total}`;
  };
  const prev = el.querySelector('.arrow.prev');
  const next = el.querySelector('.arrow.next');
  if (prev) prev.addEventListener('click', e => { e.stopPropagation(); go(i - 1); });
  if (next) next.addEventListener('click', e => { e.stopPropagation(); go(i + 1); });
  dots.forEach((d, k) => d.addEventListener('click', e => { e.stopPropagation(); go(k); }));
  if (counter) counter.textContent = `1 / ${total}`;
};
document.querySelectorAll('.proj-carousel').forEach(window.initProjCarousel);

// Toggle descripción expandida en proyectos
function toggleDesc(btn) {
  const desc = btn.previousElementSibling;
  const expanded = desc.classList.toggle('expanded');
  const isEn = document.body.classList.contains('en');
  btn.innerHTML = expanded
    ? (isEn ? 'Hide ↑' : 'Cerrar ↑')
    : (isEn ? 'Read more ↓' : 'Ver más ↓');
}

// ── Form submit ──
// El formulario se envía directamente a FormSubmit (action en el HTML).
// No interceptamos el submit para que funcione el envío real.

// ── Auto-carousel para .auto-carousel (page-hero, ecohostel, etc.) ──
window.initAutoCarousel = function (el) {
  const imgs = el.querySelectorAll('img');
  if (imgs.length <= 1) return;
  const interval = parseInt(el.dataset.interval || '5000', 10);
  let i = 0;
  setInterval(() => {
    imgs[i].classList.remove('active');
    i = (i + 1) % imgs.length;
    imgs[i].classList.add('active');
  }, interval);
};
document.querySelectorAll('.auto-carousel').forEach(window.initAutoCarousel);
