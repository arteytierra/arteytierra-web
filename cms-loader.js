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
  // CURSOS
  // ═══════════════════════════════════════════
  function renderCurso(c, idx) {
    const sectionBg = c.section_bg || 'bg-blanco';
    const cardClass = c.card_style && c.card_style !== 'default' ? ' ' + c.card_style : '';

    // Card style override (online courses use transparent card)
    const cardStyle = c.card_style === 'online'
      ? ' style="background:rgba(245,240,232,0.04);border:1px solid rgba(193,127,58,0.3);"'
      : '';

    // Section padding-top: first section keeps 3rem, rest 0
    const sectionStyle = idx === 0 ? ' style="padding-top:3rem;"' : ' style="padding-top:0;"';

    // Label color depends on card style
    const labelColor = c.card_style === 'monte' ? 'var(--arena)' : 'var(--ocre)';

    const metaHTML = (c.meta || []).map(m => `
      <div class="course-meta-item">
        <div class="course-meta-label"><span class="lang-es">${esc(m.label_es || '')}</span><span class="lang-en">${esc(m.label_en || m.label_es || '')}</span></div>
        <div class="course-meta-val"><span class="lang-es">${esc(m.value_es || '')}</span><span class="lang-en">${esc(m.value_en || m.value_es || '')}</span></div>
      </div>
    `).join('');

    const taglineHTML = c.tagline_es
      ? `<p style="font-size:0.9rem;line-height:1.7;color:var(--arena);font-style:italic;margin:0;"><span class="lang-es">${esc(c.tagline_es)}</span><span class="lang-en">${esc(c.tagline_en || c.tagline_es)}</span></p>`
      : '';

    const warningHTML = c.warning_es
      ? `<p style="font-size:0.78rem;color:rgba(232,213,163,0.7);font-style:italic;"><span class="lang-es">${esc(c.warning_es)}</span><span class="lang-en">${esc(c.warning_en || c.warning_es)}</span></p>`
      : '';

    const subtitleHTML = c.subtitle_es
      ? `<p style="font-size:0.85rem;letter-spacing:0.1em;color:var(--ocre);text-transform:uppercase;font-weight:700;margin:0 0 1rem;"><span class="lang-es">${esc(c.subtitle_es)}</span><span class="lang-en">${esc(c.subtitle_en || c.subtitle_es)}</span></p>`
      : '';

    const contentsHTML = (c.contents && c.contents.length)
      ? `<h4 style="font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;color:${labelColor};margin:0 0 1rem;font-weight:800;"><span class="lang-es">${esc(c.contents_label_es || 'Contenidos')}</span><span class="lang-en">${esc(c.contents_label_en || c.contents_label_es || 'Contents')}</span></h4>
        <ul class="module-list"${c.id === 'mi-tierra-mi-casa' ? ' style="grid-template-columns:1fr;"' : ''}>
          ${c.contents.map(it => `<li><span class="lang-es">${esc(it.es || '')}</span><span class="lang-en">${esc(it.en || it.es || '')}</span></li>`).join('')}
        </ul>`
      : '';

    const scheduleHTML = (c.schedule && c.schedule.length)
      ? `<h4 style="font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;color:${labelColor};margin:${contentsHTML ? '2rem' : '0'} 0 1rem;font-weight:800;"><span class="lang-es">${esc(c.schedule_label_es || 'Cronograma')}</span><span class="lang-en">${esc(c.schedule_label_en || c.schedule_label_es || 'Schedule')}</span></h4>
        ${c.id === 'mi-tierra-mi-casa'
          ? `<p style="font-size:0.8rem;color:var(--arena);line-height:1.6;margin:0;"><span class="lang-es">${esc(c.schedule[0].day_es || '')}</span><span class="lang-en">${esc(c.schedule[0].day_en || c.schedule[0].day_es || '')}</span></p>`
          : `<div class="day-schedule">
              ${c.schedule.map(s => `
                <div class="day-block">
                  <div class="day-name"><span class="lang-es">${esc(s.day_es || '')}</span><span class="lang-en">${esc(s.day_en || s.day_es || '')}</span></div>
                  ${s.detail_es ? `<div class="day-detail"><span class="lang-es">${esc(s.detail_es)}</span><span class="lang-en">${esc(s.detail_en || s.detail_es)}</span></div>` : ''}
                </div>
              `).join('')}
            </div>`}`
      : '';

    const pricesHTML = (c.prices && c.prices.length)
      ? `<div class="price-table">
          ${c.prices.map(p => `
            <div class="price-card${p.featured ? ' featured' : ''}">
              <div class="price-label"><span class="lang-es">${esc(p.label_es || '')}</span><span class="lang-en">${esc(p.label_en || p.label_es || '')}</span></div>
              <div class="price-amount">${esc(p.amount || '')}</div>
              <div class="price-currency">${esc(p.currency || '')}</div>
            </div>
          `).join('')}
        </div>`
      : '';

    const pricesNoteHTML = c.prices_note_es
      ? `<p style="font-size:0.78rem;color:rgba(232,213,163,0.6);font-style:italic;margin-top:1rem;">${c.prices_note_es.includes('<strong>') ? c.prices_note_es : '<span class="lang-es">' + esc(c.prices_note_es) + '</span><span class="lang-en">' + esc(c.prices_note_en || c.prices_note_es) + '</span>'}</p>`
      : '';

    const inscripcionBtn = c.show_inscripcion_btn
      ? `<a href="#inscripcion" class="btn-primary"><span class="lang-es">Inscribirme →</span><span class="lang-en">Enroll →</span></a>`
      : '';

    const waMsg = encodeURIComponent(c.whatsapp_msg_es || '');
    const waBtnClass = c.whatsapp_btn_style === 'primary' ? 'btn-primary' : 'btn-outline';
    const waSvg = '<span class="icon-svg"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg></span>';
    const waBtn = `<a href="https://wa.me/5493549431594?text=${waMsg}" class="${waBtnClass}" target="_blank">${waSvg} <span class="lang-es">${esc(c.whatsapp_label_es || 'WhatsApp')}</span><span class="lang-en">${esc(c.whatsapp_label_en || c.whatsapp_label_es || 'WhatsApp')}</span></a>`;

    return `
      <section id="${esc(c.id)}" class="section ${esc(sectionBg)}"${sectionStyle}>
        <div class="section-narrow">
          <div class="course-block${cardClass}"${cardStyle}>
            <div class="course-grid">
              <div>
                <div class="section-label" style="color:${labelColor};">— <span class="lang-es">${esc(c.label_es || '')}</span><span class="lang-en">${esc(c.label_en || c.label_es || '')}</span></div>
                <h2 class="section-title" style="color:var(--blanco);"><span class="lang-es">${c.title_html_es || ''}</span><span class="lang-en">${c.title_html_en || c.title_html_es || ''}</span></h2>
                ${subtitleHTML}
                <div class="course-meta">${metaHTML}</div>
                <p style="font-size:0.95rem;line-height:1.8;color:var(--arena);margin-bottom:${taglineHTML ? '1.2rem' : '1.5rem'};"><span class="lang-es">${esc(c.description_es || '')}</span><span class="lang-en">${esc(c.description_en || c.description_es || '')}</span></p>
                ${taglineHTML}
                ${warningHTML}
              </div>
              <div>
                ${contentsHTML}
                ${scheduleHTML}
              </div>
            </div>
            <hr style="border:none;border-top:1px solid rgba(193,127,58,0.3);margin:2.5rem 0 2rem;">
            <h4 style="font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;color:${labelColor};margin:0 0 1rem;font-weight:800;"><span class="lang-es">${esc(c.prices_label_es || 'Inversión')}</span><span class="lang-en">${esc(c.prices_label_en || c.prices_label_es || 'Tuition')}</span></h4>
            ${pricesHTML}
            ${pricesNoteHTML}
            <div style="margin-top:2rem;display:flex;gap:1rem;flex-wrap:wrap;">
              ${inscripcionBtn}
              ${waBtn}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async function renderCursos() {
    const container = document.querySelector('[data-cms="cursos"]');
    if (!container) return;

    const data = await loadJSON('/_data/cursos.json');
    if (!data || !Array.isArray(data.items) || !data.items.length) return;

    const visibles = data.items.filter(c => c.active !== false);
    if (!visibles.length) return;

    container.innerHTML = visibles.map((c, i) => renderCurso(c, i)).join('');
  }

  // ═══════════════════════════════════════════
  // TESTIMONIOS
  // ═══════════════════════════════════════════
  function renderTestimonio(t) {
    const fotoHTML = t.foto
      ? `<div class="testi-foto" style="width:60px;height:60px;border-radius:50%;overflow:hidden;margin-bottom:1rem;"><img src="${esc(t.foto)}" alt="${esc(t.title)}" style="width:100%;height:100%;object-fit:cover;"></div>`
      : '';
    const lugarEs = t.lugar || '';
    const lugarEn = t.lugar_en || t.lugar || '';
    return `
      <div class="testi-card">
        ${fotoHTML}
        <p class="testi-quote"><span class="lang-es">"${esc(t.cita_es || '')}"</span><span class="lang-en">"${esc(t.cita_en || t.cita_es || '')}"</span></p>
        <div class="testi-author">— ${esc(t.title)}${lugarEs ? ' · <span class="lang-es">' + esc(lugarEs) + '</span><span class="lang-en">' + esc(lugarEn) + '</span>' : ''}</div>
      </div>
    `;
  }

  async function renderTestimonios() {
    const container = document.querySelector('[data-cms="testimonios"]');
    if (!container) return;

    const data = await loadJSON('/_data/testimonios.json');
    if (!data || !Array.isArray(data.items) || !data.items.length) return;

    container.innerHTML = data.items.map(renderTestimonio).join('');
  }

  // ═══════════════════════════════════════════
  // EQUIPO
  // ═══════════════════════════════════════════
  function renderMiembro(m) {
    const fotoHTML = m.foto
      ? `<div style="width:100%;height:280px;overflow:hidden;margin-bottom:1.2rem;background:var(--tierra);"><img src="${esc(m.foto)}" alt="${esc(m.title)}" style="width:100%;height:100%;object-fit:cover;"></div>`
      : '';
    const rolEs = m.rol || '';
    const rolEn = m.rol_en || m.rol || '';
    return `
      <div class="team-member">
        ${fotoHTML}
        <h3 class="team-name">${esc(m.title)}</h3>
        <div class="team-role"><span class="lang-es">${esc(rolEs)}</span><span class="lang-en">${esc(rolEn)}</span></div>
        <p class="team-bio"><span class="lang-es">${esc(m.bio_es || '')}</span><span class="lang-en">${esc(m.bio_en || m.bio_es || '')}</span></p>
      </div>
    `;
  }

  async function renderEquipo() {
    const container = document.querySelector('[data-cms="equipo"]');
    if (!container) return;

    const data = await loadJSON('/_data/equipo.json');
    if (!data || !Array.isArray(data.items) || !data.items.length) return;

    const sorted = [...data.items].sort((a, b) => (a.orden || 0) - (b.orden || 0));
    container.innerHTML = sorted.map(renderMiembro).join('');
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
    renderCursos();
    renderTestimonios();
    renderEquipo();
    // Próxima fase: renderNoticias()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
