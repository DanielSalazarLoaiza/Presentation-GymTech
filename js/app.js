// Estado de tema en localStorage
const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const radialMenu = document.querySelector('.radial-menu');
const radialToggle = document.querySelector('.radial-toggle');
const views = Array.from(document.querySelectorAll('.view'));
const heroIconWrap = document.getElementById('heroIconWrap');
const heroIcon = document.getElementById('heroIcon');
// Nueva imagen del hero
const heroImageWrap = document.getElementById('heroImageWrap');
const heroImage = document.getElementById('heroImage');
const pdfBtn = document.getElementById('pdfViewerBtn');
const pdfModal = document.getElementById('pdfModal');
const pdfClose = document.getElementById('pdfClose');

function applyTheme(theme) {
  body.classList.remove('theme-dark', 'theme-light');
  body.classList.add(theme);
  localStorage.setItem('gymtech-theme', theme);
}

// Inicializar tema desde almacenamiento o por defecto oscuro
const savedTheme = localStorage.getItem('gymtech-theme') || 'theme-dark';
applyTheme(savedTheme);

// Alternar tema
themeToggle.addEventListener('click', () => {
  const next = body.classList.contains('theme-dark') ? 'theme-light' : 'theme-dark';
  applyTheme(next);
});

// Menú radial abrir/cerrar
radialToggle.addEventListener('click', () => {
  const isOpen = radialMenu.classList.toggle('open');
  radialToggle.setAttribute('aria-expanded', String(isOpen));
});

// Navegación por hash a una sola vista
function showView(id) {
  views.forEach(v => {
    const match = v.id === id;
    v.hidden = !match;
    if (match) {
      // Reinicia y aplica animación de entrada
      v.classList.remove('enter');
      void v.offsetWidth;
      v.classList.add('enter');
    }
  });
}

// ----- Visor de imágenes con zoom (+, −, reset)
function setupImageViewer(container) {
  const img = container.querySelector('.viewer-img');
  const buttons = container.querySelectorAll('.btn-zoom');
  if (!img || buttons.length === 0) return;
  let scale = 1;
  function apply() {
    img.style.transform = `scale(${scale})`;
  }
  function onLoad() {
    scale = 1; // Imagen se ajusta por CSS para encajar completa
    apply();
  }
  img.addEventListener('load', onLoad);
  if (img.complete) onLoad();
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'in') scale = Math.min(scale * 1.2, 5);
      else if (action === 'out') scale = Math.max(scale / 1.2, 0.5);
      else scale = 1;
      apply();
    });
  });
}

document.querySelectorAll('.image-viewer').forEach(setupImageViewer);

function navigateFromHash() {
  const hash = location.hash.replace('#', '') || 'inicio';
  showView(hash);
}

// Interceptar clicks para cambiar vistas y cerrar el menú radial
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    const id = href.slice(1);
    if (document.getElementById(id)) {
      e.preventDefault();
      location.hash = `#${id}`;
      radialMenu.classList.remove('open');
      radialToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

window.addEventListener('hashchange', navigateFromHash);
navigateFromHash();

// Cerrar menú al seleccionar un item
document.querySelectorAll('.radial-item').forEach(a => {
  a.addEventListener('click', () => {
    radialMenu.classList.remove('open');
    radialToggle.setAttribute('aria-expanded', 'false');
  });
});

// Accesibilidad: cerrar con Escape
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    radialMenu.classList.remove('open');
    radialToggle.setAttribute('aria-expanded', 'false');
    if (!pdfModal.hidden) {
      pdfModal.hidden = true;
    }
  }
});

// Abrir visor PDF
pdfBtn.addEventListener('click', () => {
  pdfModal.hidden = false;
});

// Cerrar visor PDF
pdfClose.addEventListener('click', () => {
  pdfModal.hidden = true;
});

// Cerrar al hacer clic en el fondo (fuera del diálogo)
pdfModal.addEventListener('click', (e) => {
  if (e.target === pdfModal) {
    pdfModal.hidden = true;
  }
});

// Interacción del ícono del hero: movimiento según el mouse
if (heroIconWrap && heroIcon) {
  const RANGE = 20; // desplazamiento máximo en px
  let rafId = null;
  let targetX = 0, targetY = 0;

  function applyTransform() {
    heroIcon.style.transform = `translate(${targetX}px, ${targetY}px)`;
    rafId = null;
  }

  heroIconWrap.addEventListener('mousemove', (e) => {
    const rect = heroIconWrap.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 a 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    targetX = x * RANGE * 2;
    targetY = y * RANGE * 2;
    if (!rafId) rafId = requestAnimationFrame(applyTransform);
  });

  heroIconWrap.addEventListener('mouseleave', () => {
    targetX = 0; targetY = 0;
    if (!rafId) rafId = requestAnimationFrame(applyTransform);
  });
}

// Parallax para la imagen del hero
if (heroImageWrap && heroImage) {
  const RANGE = 16; // desplazamiento máximo en px
  let rafId = null;
  let targetX = 0, targetY = 0;

  function applyTransform() {
    heroImage.style.transform = `translate(${targetX}px, ${targetY}px) scale(1.06)`;
    rafId = null;
  }

  heroImageWrap.addEventListener('mousemove', (e) => {
    const rect = heroImageWrap.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    targetX = x * RANGE * 2;
    targetY = y * RANGE * 2;
    if (!rafId) rafId = requestAnimationFrame(applyTransform);
  });

  heroImageWrap.addEventListener('mouseleave', () => {
    targetX = 0; targetY = 0;
    if (!rafId) rafId = requestAnimationFrame(applyTransform);
  });
}

// Fondo reactivo al mouse en todas las vistas
document.querySelectorAll('.view').forEach(view => {
  view.addEventListener('pointermove', (e) => {
    const rect = view.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    view.style.setProperty('--bg-x', `${x}%`);
    view.style.setProperty('--bg-y', `${y}%`);
  });
});