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

// ── Language toggle (persist via localStorage) ──
const STORAGE_KEY = 'ayt-lang';
function applyLang(lang) {
  document.body.classList.toggle('en', lang === 'en');
  document.documentElement.lang = lang;
  try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
}
function toggleLang() {
  const current = document.body.classList.contains('en') ? 'en' : 'es';
  applyLang(current === 'es' ? 'en' : 'es');
}
// On load, restore preference
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'en') applyLang('en');
} catch (e) {}

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
