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
  /* Nube de pixeles: port de PixelCloud.kt de la app. Nubes de luz cuyo borde se deshace en pixeles
     con matriz de Bayer; se mueven despacio todo el tiempo. */
  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  var LAYOUTS = [
    [[0.22, 0.30, 0.34], [0.80, 0.22, 0.30]],
    [[0.50, 1.04, 0.64], [1.05, 0.26, 0.40]],
    [[0.92, 1.02, 0.60], [0.00, 0.28, 0.42]],
    /* franjas al pie, como en la portada de la app */
    [[0.04, 1.00, 0.20], [0.36, 1.08, 0.18], [0.66, 1.02, 0.20], [0.98, 0.98, 0.21], [0.50, 1.30, 0.26]]
  ];
  var INNER = 0.58, OUTER = 1.12, SPEED = reduce ? 0.15 : 0.45, STEP_MS = 90;
  function pixels(host) {
    var li = (parseInt(host.getAttribute('data-pixels'), 10) || 0) % LAYOUTS.length;
    var layout = LAYOUTS[li];
    var tint = host.getAttribute('data-tint') || '255,255,255';
    var base = parseFloat(host.getAttribute('data-alpha') || '0.1');
    var CELL = parseInt(host.getAttribute('data-cell') || '8', 10);
    var cv = document.createElement('canvas');
    cv.className = 'pixel-canvas';
    host.appendChild(cv);
    var ctx = cv.getContext('2d');
    var visible = true, w = 0, h = 0, dpr = 1, last = 0, start = performance.now(), seed = [], cols = 0, rows = 0;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = host.clientWidth; h = host.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      cols = Math.floor(w / CELL) + 1; rows = Math.floor(h / CELL) + 1;
      seed = new Array(cols * rows);
      for (var k = 0; k < seed.length; k++) seed[k] = (Math.floor((k * 2654435761) / 128) % 65536) / 65535;
      draw(performance.now());
    }
    function draw(now) {
      var t = (now - start) / 1000 * SPEED;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      var n = layout.length, cx = [], cy = [], r = [], unit = Math.max(w, 900);
      for (var q = 0; q < n; q++) {
        var c = layout[q];
        cx[q] = c[0] * w + Math.sin(t * 0.35 + q * 1.7) * 0.04 * w;
        cy[q] = c[1] * h + Math.cos(t * 0.28 + q * 2.3) * 0.03 * h;
        r[q] = c[2] * unit * (1 + 0.07 * Math.sin(t * 0.6 + q * 1.1));
      }
      var fill = 'rgba(' + tint + ',' + base + ')';
      ctx.fillStyle = fill;
      for (var j = 0; j < rows; j++) {
        for (var i = 0; i < cols; i++) {
          var px = (i + 0.5) * CELL, py = (j + 0.5) * CELL, d = 1e9;
          for (var m = 0; m < n; m++) {
            var dx = px - cx[m], dy = py - cy[m];
            var dn = Math.sqrt(dx * dx + dy * dy) / r[m];
            if (dn < d) d = dn;
          }
          if (d >= OUTER + 0.15) continue;
          var s = seed[j * cols + i];
          var edge = d <= INNER ? 1 : (OUTER - d) / (OUTER - INNER);
          var p = edge >= 1 ? 1 : edge + 0.15 * Math.sin(t * 1.6 + s * 6.2832);
          if (p <= 0 || p * 16 <= BAYER[(j & 3) * 4 + (i & 3)]) continue;
          var dot = p >= 1 ? CELL : CELL * (0.55 + 0.45 * Math.min(p, 1));
          var twinkle = p >= 1 && s > 0.88;
          if (twinkle) ctx.fillStyle = 'rgba(' + tint + ',' + (base * (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 2.2 + s * 40)))).toFixed(3) + ')';
          ctx.fillRect(i * CELL + (CELL - dot) / 2, j * CELL + (CELL - dot) / 2, dot, dot);
          if (twinkle) ctx.fillStyle = fill;
        }
      }
    }
    function loop(now) {
      if (visible && !document.hidden && now - last >= STEP_MS) { last = now; draw(now); }
      requestAnimationFrame(loop);
    }
    size();
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(host); else window.addEventListener('resize', size);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(host);
    requestAnimationFrame(loop);
  }
  document.querySelectorAll('[data-pixels]').forEach(pixels);
})();
