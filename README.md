# Arte y Tierra — Sitio web

Sitio estático bilingüe ES/EN para Arte y Tierra / Tay Pichín.

## Estructura

```
web/
├── index.html          Home — narrativa scroll completa
├── servicios.html      Bioarquitectura · Hidrología · Talleres
├── proyectos.html      Portfolio filtrable + países
├── cursos.html         Cursos detallados + Mercado Pago + transferencia
├── taypichin.html      Ecoescuela · Ecohostel · Voluntariado (preview)
├── voluntariado.html   Página dedicada al voluntariado
├── nosotros.html       Manifiesto · valores · equipo · países
├── contacto.html       Formulario completo + FAQ
├── styles.css          Sistema visual compartido
└── script.js           Toggle ES/EN + nav + filtros + clipboard
```

## Características

- Bilingüe ES/EN con persistencia (localStorage)
- Responsive (mobile + desktop)
- Sistema de marca aplicado (paleta tierra, Montserrat)
- Fotos integradas vía Google Drive embed
- Animaciones suaves en scroll
- Botones "copiar al portapapeles" para CBU/alias de Mercado Pago
- Filtros funcionales en página de proyectos
- 3 testimonios con autoría real (Diego, Franco Colavita, +1)
- 4 bios completas del equipo
- FAQ en contacto y voluntariado

## Datos integrados (cursos)

**Mercado Pago:**
- CVU: 0000003100085460774977
- Alias: arte.y.tierra

**Banco Ciudad — Palma Jonatan Gabriel:**
- Cuenta: 531-352269/7
- CBU: 0290061210000500672939

**WhatsApp:**
- Inscripciones cursos: +54 9 3549 431594
- General: +54 9 11 2759 0652

**Email:** info.arteytierra@gmail.com

## Cómo desplegar

Ver `DEPLOY.md` en la carpeta padre, o resumido:

1. https://app.netlify.com/drop
2. Drag-drop de `arteytierra-web.zip`
3. Listo en ~10 segundos

## Pendientes

- [ ] URLs reales de Booking y Airbnb (ver `taypichin.html`)
- [ ] Conectar formularios con Formspree (ver `contacto.html`, `voluntariado.html`)
- [ ] Fotos individuales del equipo (4 personas)
- [ ] Fotos descargadas localmente para mejor performance (opcional)
- [ ] Logos PNG/SVG oficiales (actualmente texto)
