const business = window.NAVALHA27;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Dados comerciais (assets/config.js) ---------- */
function whatsappUrl(key) {
  const message = business.mensagens[key] || business.mensagens.geral;
  return `https://wa.me/${business.whatsapp.numero}?text=${encodeURIComponent(message)}`;
}

function applyBusinessData() {
  if (!business) return;
  const { endereco, instagram, whatsapp, horarios } = business;
  const instagramUrl = `https://www.instagram.com/${instagram.usuario}/`;
  const enderecoLinha1 = `${endereco.rua} – ${endereco.bairro}`;
  const enderecoLinha2 = `${endereco.cidade} – ${endereco.uf}`;
  const mapsQuery = `${endereco.rua} - ${endereco.bairro}, ${endereco.cidade} - ${endereco.uf}`;

  document.querySelectorAll('[data-booking]').forEach((link) => {
    link.href = whatsappUrl(link.dataset.booking);
  });

  document.querySelectorAll('[data-contact]').forEach((element) => {
    const roles = element.dataset.contact.split(' ');
    if (roles.includes('instagram-link')) element.href = instagramUrl;
    if (roles.includes('instagram-texto')) element.textContent = `@${instagram.usuario}`;
    if (roles.includes('whatsapp-texto')) element.textContent = whatsapp.exibicao;
    if (roles.includes('endereco')) {
      element.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;
      element.replaceChildren(enderecoLinha1, document.createElement('br'), enderecoLinha2);
    }
    if (roles.includes('horarios')) {
      element.replaceChildren(...horarios.map(({ dias, horas }) => {
        const row = document.createElement('div');
        const dt = document.createElement('dt');
        const dd = document.createElement('dd');
        dt.textContent = dias;
        dd.textContent = horas;
        row.append(dt, dd);
        return row;
      }));
    }
  });

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BarberShop',
    name: business.nome,
    image: new URL('assets/hero.jpg', document.baseURI).href,
    url: document.querySelector('link[rel="canonical"]')?.href || location.href,
    telephone: `+${whatsapp.numero}`,
    sameAs: [instagramUrl],
    address: {
      '@type': 'PostalAddress',
      streetAddress: endereco.rua,
      addressLocality: endereco.cidade,
      addressRegion: endereco.uf,
      addressCountry: 'BR',
    },
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  document.head.append(script);
}

applyBusinessData();

/* ---------- Menu ---------- */
const menuButton = document.querySelector('.menu-toggle');
// O ícone de menu abre um painel próprio; a linha de links do desktop nunca se move.
const navigation = document.querySelector('.nav-drawer');
const inlineLinks = [...document.querySelectorAll('.nav-links a')];
const drawerLinks = [...navigation.querySelectorAll('a')];
const navLinks = [...inlineLinks, ...drawerLinks];

function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  navigation.classList.toggle('is-open', open);
}

const isMenuOpen = () => menuButton.getAttribute('aria-expanded') === 'true';

menuButton.addEventListener('click', () => {
  const open = !isMenuOpen();
  setMenu(open);
  if (open) drawerLinks[0].focus();
});

let spyPausedUntil = 0;
document.querySelectorAll('.nav-links, .nav-drawer').forEach((menu) => menu.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link) return;
  setMenu(false);
  markCurrent(link.getAttribute('href').slice(1));
  spyPausedUntil = Date.now() + 1000;
}));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isMenuOpen()) {
    setMenu(false);
    menuButton.focus();
  }
});

document.addEventListener('click', (event) => {
  if (isMenuOpen() && !navigation.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
});

navigation.addEventListener('focusout', (event) => {
  if (isMenuOpen() && !navigation.contains(event.relatedTarget) && event.relatedTarget !== menuButton) setMenu(false);
});

function markCurrent(id) {
  navLinks.forEach((link) => {
    const current = link.getAttribute('href') === `#${id}`;
    link.classList.toggle('active', current);
    if (current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

const sections = inlineLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

function updateCurrentSection() {
  if (Date.now() < spyPausedUntil) return;
  const line = Math.min(160, window.innerHeight * 0.3);
  let current = sections[0];
  let bestTop = -Infinity;
  sections.forEach((section) => {
    const top = Math.round(section.getBoundingClientRect().top);
    // Seções lado a lado têm o mesmo topo: mantém a primeira (ordem do menu).
    if (top <= line && top > bestTop) { current = section; bestTop = top; }
  });
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = sections[sections.length - 1];
  markCurrent(current.id);
}

let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => { updateCurrentSection(); scrollTicking = false; });
}, { passive: true });
updateCurrentSection();

/* ---------- Galeria ---------- */
const gallery = document.querySelector('.gallery-track');
const photos = [...gallery.children];
const dots = [...document.querySelectorAll('.gallery-dots .dot')];
const status = document.querySelector('#carousel-status');
let currentStyle = 0;

// No celular a galeria vira uma faixa com rolagem nativa; no desktop as fotos trocam de ordem.
const isScrollMode = () => gallery.scrollWidth > gallery.clientWidth + 4;

function markDots(index) {
  dots.forEach((dot, i) => {
    const selected = i === index;
    dot.classList.toggle('selected', selected);
    dot.setAttribute('aria-pressed', String(selected));
  });
}

function selectStyle(index) {
  currentStyle = (index + photos.length) % photos.length;
  if (isScrollMode()) {
    if (gallery.children[0] !== photos[0]) gallery.replaceChildren(...photos);
    gallery.scrollTo({ left: photos[currentStyle].offsetLeft - gallery.offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' });
  } else {
    gallery.replaceChildren(...photos.slice(currentStyle), ...photos.slice(0, currentStyle));
    gallery.classList.remove('is-switching');
    void gallery.offsetWidth;
    gallery.classList.add('is-switching');
  }
  markDots(currentStyle);
  status.textContent = `Estilo ${currentStyle + 1} de ${photos.length} em destaque: ${photos[currentStyle].alt}.`;
}

gallery.addEventListener('animationend', () => gallery.classList.remove('is-switching'));
document.querySelector('.gallery-next').addEventListener('click', () => selectStyle(currentStyle + 1));
dots.forEach((dot, i) => dot.addEventListener('click', () => selectStyle(i)));

let galleryTicking = false;
gallery.addEventListener('scroll', () => {
  if (galleryTicking) return;
  galleryTicking = true;
  requestAnimationFrame(() => {
    galleryTicking = false;
    if (!isScrollMode()) return;
    const step = photos[1].offsetLeft - photos[0].offsetLeft;
    const atEnd = gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 4;
    currentStyle = atEnd ? photos.length - 1 : Math.round(gallery.scrollLeft / step);
    markDots(currentStyle);
  });
}, { passive: true });

window.addEventListener('resize', () => {
  if (isScrollMode() && gallery.children[0] !== photos[0]) { gallery.replaceChildren(...photos); selectStyle(0); }
});

let touchStartX = null;
gallery.addEventListener('touchstart', (event) => { touchStartX = event.touches[0].clientX; }, { passive: true });
gallery.addEventListener('touchend', (event) => {
  if (touchStartX === null || isScrollMode()) { touchStartX = null; return; }
  const delta = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(delta) > 40) selectStyle(currentStyle + (delta < 0 ? 1 : -1));
  touchStartX = null;
});

/* ---------- Cabeçalho ao rolar ---------- */
const header = document.querySelector('.nav');
const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

/* ---------- Revelação na rolagem ---------- */
// Só o JS esconde os elementos; sem JS (ou com movimento reduzido) tudo aparece normalmente.
const revealGroups = ['.services-grid .card', '.quotes .quote', '.team-grid .card3', '.polaroid', '.package'];
if ('IntersectionObserver' in window && !reduceMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  revealGroups.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (element.getBoundingClientRect().top < window.innerHeight * 0.9) return;
      element.style.setProperty('--i', index);
      element.classList.add('reveal');
      observer.observe(element);
    });
  });

  // Rede de segurança: se o observer não disparar, mostra o que já passou pela tela.
  const pending = () => [...document.querySelectorAll('.reveal:not(.is-in)')];
  const revealPassed = () => pending().forEach((element) => {
    if (element.getBoundingClientRect().top < window.innerHeight) element.classList.add('is-in');
  });
  window.addEventListener('scroll', () => requestAnimationFrame(revealPassed), { passive: true });
  window.addEventListener('load', () => setTimeout(revealPassed, 600));
}

/* ---------- Depoimentos ---------- */
const quotes = document.querySelector('.quotes');
const quoteDots = [...document.querySelectorAll('.quote-dots .dot')];
let currentQuote = 0;

document.querySelector('.quote-next').addEventListener('click', () => {
  quotes.append(quotes.firstElementChild);
  currentQuote = (currentQuote + 1) % quotes.children.length;
  quoteDots.forEach((dot, i) => dot.classList.toggle('selected', i === currentQuote));
  status.textContent = `Depoimento de ${quotes.firstElementChild.querySelector('h3').textContent} em destaque.`;
});
