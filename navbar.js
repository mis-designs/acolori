/*!
 * navbar.js — Site Navbar + Overlay Menu Component
 * Città @ Colori Cooperativa Sociale
 *
 * - Injects fixed top navbar on every page
 * - On mobile (≤700px): hamburger opens a premium slide-in overlay menu
 * - Handles scroll transparency (transparent over hero → solid on scroll)
 * - Active page detection from URL
 *
 * Usage: <link rel="stylesheet" href="navbar.css"> in <head>
 *        <script src="navbar.js"></script> before </body>
 */
(function () {
  'use strict';

  /* ── Active-page detection ── */
  var page = window.location.pathname.split('/').pop();
  if (!page || page === '/') page = 'index.html';

  function ac(href) {
    /* Returns ' class="active"' when href matches current page */
    return href === page ? ' class="active"' : '';
  }

  /* ── SVG icons ── */
  var icons = {
    home:     '<path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>',
    servizi:  '<path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>',
    lavora:   '<path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>',
    chisiamo: '<path fill-rule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clip-rule="evenodd"/>',
    contatti: '<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>',
    phone:    '<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>',
    mail:     '<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>'
  };

  function icon20(paths) {
    return '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + paths + '</svg>';
  }

  /* ── Overlay menu item builder ── */
  function overlayItem(href, iconPaths, num, label, isActive) {
    return [
      '<a class="navOverlay-item' + (isActive ? ' active' : '') + '" href="' + href + '">',
      '  <span class="navOverlay-item-body">',
      '    <span class="navOverlay-item-icon">' + icon20(iconPaths) + '</span>',
      '    <span class="navOverlay-item-text">',
      '      <span class="navOverlay-num">' + num + '</span>',
      '      <span class="navOverlay-label">' + label + '</span>',
      '    </span>',
      '  </span>',
      '  <img class="navOverlay-arrow" src="right-arrow.png" alt="" aria-hidden="true" width="10">',
      '</a>'
    ].join('\n');
  }

  /* ── Build navbar HTML ── */
  var navHTML = [
    '<nav class="siteNav" id="siteNav" role="navigation" aria-label="Navigazione principale">',
    '  <div class="siteNav-inner">',

    /* Brand */
    '    <a class="siteNav-brand" href="index.html" aria-label="Torna alla home">',
    '      <img src="assets/img/logo.jpg" alt="Logo Città @ Colori" width="38" height="38">',
    '      <div class="siteNav-brand-text">',
    '        <strong>Città @ Colori</strong>',
    '        <span>Cooperativa Sociale</span>',
    '      </div>',
    '    </a>',

    /* Desktop nav links */
    '    <ul class="siteNav-links" id="siteNavLinks" role="list">',
    '      <li><a href="index.html"'            + ac('index.html')            + '>Home</a></li>',
    '      <li><a href="servizi.html"'          + ac('servizi.html')          + '>Servizi</a></li>',
    '      <li><a href="lavora-con-noi.html"'   + ac('lavora-con-noi.html')   + '>Lavora con noi</a></li>',
    '      <li><a href="chi-siamo.html"'         + ac('chi-siamo.html')         + '>Chi siamo</a></li>',
    '      <li><a href="contatti.html"'         + ac('contatti.html')         + '>Contatti</a></li>',
    '    </ul>',

    /* Actions */
    '    <div class="siteNav-actions">',
    '      <a class="siteNav-phone" href="tel:+393889009306" aria-label="Chiamaci">+39 388 900 9306</a>',
    '      <a class="siteNav-cta"   href="contatti.html">Richiedi preventivo</a>',
    '    </div>',

    /* Hamburger — triggers overlay on mobile */
    '    <button',
    '      class="siteNav-hamburger"',
    '      id="siteNavHamburger"',
    '      type="button"',
    '      aria-label="Apri menu"',
    '      aria-expanded="false"',
    '      aria-controls="navOverlay"',
    '    >',
    '      <img class="siteNav-hamburger-img" src="assets/img/menu.png" alt="" aria-hidden="true" width="22" height="22">',
    '    </button>',

    '  </div>',
    '</nav>'
  ].join('\n');

  /* ── Build overlay HTML ── */
  var overlayHTML = [
    '<div class="navOverlay" id="navOverlay" role="dialog" aria-modal="true"',
    '     aria-label="Menu di navigazione" aria-hidden="true">',

    /* Backdrop (click closes) */
    '  <div class="navOverlay-backdrop" id="navOverlayBackdrop"></div>',

    /* Slide-in panel */
    '  <div class="navOverlay-panel">',

    /* Header */
    '    <div class="navOverlay-head">',
    '      <a class="navOverlay-brand" href="index.html" aria-label="Home">',
    '        <img src="assets/img/logo.jpg" alt="Logo Città @ Colori" width="34" height="34">',
    '        <div class="navOverlay-brand-text">',
    '          <strong>Città @ Colori</strong>',
    '          <span>Cooperativa Sociale</span>',
    '        </div>',
    '      </a>',
    '      <button class="navOverlay-close" id="navOverlayClose" type="button" aria-label="Chiudi menu">',
    '        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
    '          <line x1="18" y1="6" x2="6" y2="18"/>',
    '          <line x1="6" y1="6" x2="18" y2="18"/>',
    '        </svg>',
    '      </button>',
    '    </div>',

    /* Nav links */
    '    <nav class="navOverlay-nav" aria-label="Menu principale">',
    overlayItem('index.html',          icons.home,      '01', 'Home',         page === 'index.html'),
    overlayItem('servizi.html',        icons.servizi,   '02', 'Servizi',      page === 'servizi.html'),
    overlayItem('lavora-con-noi.html', icons.lavora,    '03', 'Lavora con noi', page === 'lavora-con-noi.html'),
    overlayItem('chi-siamo.html',       icons.chisiamo,  '04', 'Chi siamo',    page === 'chi-siamo.html'),
    overlayItem('contatti.html',       icons.contatti,  '05', 'Contatti',     page === 'contatti.html'),
    '    </nav>',

    /* Footer */
    '    <div class="navOverlay-foot">',
    '      <p class="navOverlay-foot-label">Contattaci</p>',
    '      <a href="tel:+393889009306">',
    '        <span class="navOverlay-foot-icon">' + icon20(icons.phone) + '</span>',
    '        +39 388 900 9306',
    '      </a>',
    '      <a href="mailto:cittaacolori@gmail.com">',
    '        <span class="navOverlay-foot-icon">' + icon20(icons.mail) + '</span>',
    '        cittaacolori@gmail.com',
    '      </a>',
    '      <a class="navOverlay-cta" href="contatti.html">',
    '        Richiedi preventivo',
    '      </a>',
    '    </div>',

    '  </div>', /* /panel */
    '</div>'    /* /overlay */
  ].join('\n');

  /* ── Inject into DOM ── */
  function inject() {
    document.body.insertAdjacentHTML('afterbegin', navHTML);
    document.body.insertAdjacentHTML('beforeend', overlayHTML);
    init();
  }

  if (document.body) {
    inject();
  } else {
    document.addEventListener('DOMContentLoaded', inject);
  }

  /* ── Initialise behaviour ── */
  function init() {
    var nav      = document.getElementById('siteNav');
    var burger   = document.getElementById('siteNavHamburger');
    var overlay  = document.getElementById('navOverlay');
    var backdrop = document.getElementById('navOverlayBackdrop');
    var closeBtn = document.getElementById('navOverlayClose');
    var hasHero  = !!document.querySelector('.heroTop');
    var isOpen   = false;
    var scrollY  = 0;

    /* Non-hero pages: solid background from load */
    if (!hasHero) nav.classList.add('is-solid');

    /* ── Scroll transparency ── */
    function onScroll() {
      nav.classList.toggle('is-scrolled', window.scrollY > 50);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ── Body scroll lock (iOS-safe) ── */
    function lockScroll() {
      scrollY = window.scrollY;
      document.body.style.position  = 'fixed';
      document.body.style.top       = '-' + scrollY + 'px';
      document.body.style.width     = '100%';
      document.body.style.overflowY = 'scroll'; /* keep scrollbar space */
    }

    function unlockScroll() {
      document.body.style.position  = '';
      document.body.style.top       = '';
      document.body.style.width     = '';
      document.body.style.overflowY = '';
      window.scrollTo(0, scrollY);
    }

    /* ── Open / Close ── */
    function openMenu() {
      if (isOpen) return;
      isOpen = true;
      lockScroll();
      overlay.classList.add('is-open');
      overlay.removeAttribute('aria-hidden');
      burger.classList.add('is-active');
      burger.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      if (!isOpen) return;
      isOpen = false;
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      burger.classList.remove('is-active');
      burger.setAttribute('aria-expanded', 'false');
      /* Restore scroll after panel slides out */
      setTimeout(unlockScroll, 480);
    }

    /* Hamburger */
    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      isOpen ? closeMenu() : openMenu();
    });

    /* Backdrop click */
    backdrop.addEventListener('click', closeMenu);

    /* Close button */
    closeBtn.addEventListener('click', closeMenu);

    /* Nav link click */
    overlay.querySelectorAll('.navOverlay-item, .navOverlay-cta').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });

    /* Escape key */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) closeMenu();
    });

    /* Close if window resizes past mobile breakpoint */
    window.addEventListener('resize', function () {
      if (isOpen && window.innerWidth > 700) closeMenu();
    }, { passive: true });
  }

})();
