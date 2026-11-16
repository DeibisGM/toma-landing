(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Cabecera: línea inferior al hacer scroll */
  var header = document.querySelector('[data-header]');
  if (header) {
    var update = function () { header.toggleAttribute('data-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* Menú móvil */
  var btn = document.querySelector('[data-menu-button]');
  var menu = document.querySelector('[data-menu]');
  if (btn && menu) {
    var close = function () { btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Abrir menú'); menu.removeAttribute('data-open'); };
    btn.addEventListener('click', function () {
      if (btn.getAttribute('aria-expanded') === 'true') { close(); return; }
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'Cerrar menú');
      menu.setAttribute('data-open', '');
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    document.addEventListener('click', function (e) { if (!e.target.closest('.nav-capsule')) close(); });
  }

  /* Aparición suave al hacer scroll */
  var items = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.setAttribute('data-visible', ''); io.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.setAttribute('data-visible', ''); });
  }
})();
