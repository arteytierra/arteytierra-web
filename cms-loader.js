// ═══════════════════════════════════════════
// CMS LOADER — carga contenido editable desde Decap
// ═══════════════════════════════════════════
// Este archivo lee los JSON de _data/ y los renderea
// en los containers correspondientes de cada página.

(function () {
  'use strict';

  // Helper: escapar HTML para evitar XSS desde el CMS
  function esc(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Helper: fetch con manejo de errores
  async function loadJSON(path) {
    try {
      const res = await fetch(path, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn(`[cms-loader] No se pudo cargar ${path}:`, e.message);
      return null;
    }
  }

  // ═══════════════════════════════════════════
  // PROYECTOS
  // ═══════════════════════════════════════════
  function renderProyecto(p) {
    const galeria = (p.galeria || []).filter(Boolean);
    const slidesHTML = galeria.length
      ? galeria.map((url, i) => {
          const src = typeof url === 'string' ? url : (url.url || '');
          return `<div class="slide"><img src="${esc(src)}" alt="${esc(p.title)} — foto ${i + 1}" loading="lazy"></div>`;
        }).join('')
      : '<div class="slide"><div style="background:var(--negro);width:100%;height:100%;"></div></div>';

    const dotsHTML = galeria.length > 1
      ? galeria.map((_, i) => `<button class="dot${i === 0 ? ' active' : ''}" aria-label="${i + 1}"></button>`).join('')
      : '<button class="dot active" aria-label="1"></button>';

    const counter = galeria.length || 1;

    return `
      <div${p.id ? ` id="${esc(p.id)}"` : ''} class="project-card" data-type="${esc(p.tipo || 'otro')}">
        <div class="proj-carousel">
          <div class="slides">${slidesHTML}</div>
          <button class="arrow prev" aria-label="Anterior">‹</button>
          <button class="arrow next" aria-label="Siguiente">›</button>
          <div class="proj-counter">1 / ${counter}</div>
          <div class="dots">${dotsHTML}</div>
        </div>
        <div class="proj-info">
          <div class="proj-type"><span class="lang-es">${esc(p.tipo_label_es || '')}</span><span class="lang-en">${esc(p.tipo_label_en || p.tipo_label_es || '')}</span></div>
          <div class="proj-name">${esc(p.title)}</div>
          <div class="proj-meta">${esc(p.ubicacion || '')}${p.anio ? ' · ' + esc(p.anio) : ''}</div>
          <p class="proj-desc"><span class="lang-es">${esc(p.descripcion_es || '')}</span><span class="lang-en">${esc(p.descripcion_en || p.descripcion_es || '')}</span></p>
          <button class="proj-toggle" onclick="toggleDesc(this)"><span class="lang-es">Ver más ↓</span><span class="lang-en">Read more ↓</span></button>
        </div>
      </div>
    `;
  }

  async function renderProyectos() {
    const container = document.querySelector('[data-cms="proyectos"]');
    if (!container) return;

    const data = await loadJSON('/_data/proyectos.json');
    if (!data || !Array.isArray(data.items)) {
      console.warn('[cms-loader] proyectos.json sin items');
      return;
    }

    const visibles = data.items.filter(p => p.activo !== false);
    if (!visibles.length) return;

    container.innerHTML = visibles.map(renderProyecto).join('');

    // Re-inicializar carruseles después de inyectar
    if (typeof window.initProjCarousel === 'function') {
      container.querySelectorAll('.proj-carousel').forEach(window.initProjCarousel);
    }
  }

  // ═══════════════════════════════════════════
  // CONFIGURACIÓN GENERAL — actualiza valores que aparecen en todas las páginas
  // ═══════════════════════════════════════════
  async function applySiteSettings() {
    const data = await loadJSON('/_data/site.json');
    if (!data) return;

    // WhatsApp links
    if (data.whatsapp) {
      const wa = data.whatsapp.replace(/\D/g, '');
      document.querySelectorAll('[data-cms-whatsapp]').forEach(a => {
        a.href = `https://wa.me/${wa}`;
      });
    }
    // Email links
    if (data.email) {
      document.querySelectorAll('[data-cms-email]').forEach(a => {
        a.href = `mailto:${data.email}`;
      });
      document.querySelectorAll('[data-cms-email-text]').forEach(el => {
        el.textContent = data.email;
      });
    }
    // Instagram
    if (data.instagram) {
      const handle = data.instagram.replace(/^@/, '');
      document.querySelectorAll('[data-cms-instagram]').forEach(a => {
        a.href = `https://instagram.com/${handle}`;
      });
    }
    // Dirección
    if (data.direccion) {
      document.querySelectorAll('[data-cms-direccion]').forEach(el => {
        el.textContent = data.direccion;
      });
    }
  }

  // ═══════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════
  function init() {
    applySiteSettings();
    renderProyectos();
    // Aquí más adelante: renderCursos(), renderTestimonios(), renderEquipo(), renderNoticias()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
