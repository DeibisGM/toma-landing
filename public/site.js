(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Menú móvil */
  var btn = document.querySelector('[data-menu-button]');
  var menu = document.querySelector('[data-menu]');
  if (btn && menu) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      menu.toggleAttribute('data-open', !open);
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) { btn.setAttribute('aria-expanded', 'false'); menu.removeAttribute('data-open'); }
    });
  }

  /* Aparición al hacer scroll */
  var items = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.setAttribute('data-visible', ''); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.95) el.setAttribute('data-visible', ''); else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.setAttribute('data-visible', ''); });
  }

  /* Botones de ejemplo (voto y ánimo) */
  document.querySelectorAll('.vote-row').forEach(function (row) {
    row.addEventListener('click', function (e) {
      var b = e.target.closest('.vote-btn');
      if (!b) return;
      row.querySelectorAll('.vote-btn').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    });
  });
  document.querySelectorAll('.mood').forEach(function (m) {
    m.addEventListener('click', function () { m.setAttribute('aria-pressed', String(m.getAttribute('aria-pressed') !== 'true')); });
  });

  /* Nube de pixeles: port fiel de PixelCloud.kt de la app (cuadrícula tenue + nubes de luz cuyo borde se deshace en pixeles con matriz de Bayer) */
  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  var LAYOUTS = [
    [[0.50, 1.04, 0.64], [1.05, 0.26, 0.40]],
    [[0.06, 0.99, 0.56], [0.98, 0.14, 0.46]],
    [[0.92, 1.02, 0.60], [0.00, 0.28, 0.42]]
  ];
  var CELL = 7, INNER = 0.58, OUTER = 1.12, SPEED = 0.3, STEP_MS = 100;
  function setup(host) {
    var layout = LAYOUTS[(parseInt(host.getAttribute('data-pixels'), 10) || 0) % LAYOUTS.length];
    var cv = document.createElement('canvas');
    cv.className = 'pixel-canvas';
    cv.setAttribute('aria-hidden', 'true');
    host.insertBefore(cv, host.firstChild);
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
      var t = reduce ? 0 : (now - start) / 1000 * SPEED;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      /* cuadrícula: una línea de 1 px cada 40 px */
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      for (var x = 40; x < w; x += 40) ctx.fillRect(x, 0, 1, h);
      for (var y = 40; y < h; y += 40) ctx.fillRect(0, y, w, 1);
      var n = layout.length, cx = [], cy = [], r = [];
      for (var q = 0; q < n; q++) {
        var c = layout[q];
        cx[q] = c[0] * w + Math.sin(t * 0.35 + q * 1.7) * 0.035 * w;
        cy[q] = c[1] * h + Math.cos(t * 0.28 + q * 2.3) * 0.02 * h;
        r[q] = c[2] * w * (1 + 0.05 * Math.sin(t * 0.6 + q * 1.1));
      }
      var base = 0.095;
      ctx.fillStyle = 'rgba(255,255,255,' + base + ')';
      for (var j = 0; j < rows; j++) {
        for (var i = 0; i < cols; i++) {
          var px = (i + 0.5) * CELL, py = (j + 0.5) * CELL, d = 1e9;
          for (var m = 0; m < n; m++) {
            var dx = px - cx[m], dy = py - cy[m];
            var dn = Math.sqrt(dx * dx + dy * dy) / r[m];
            if (dn < d) d = dn;
          }
          if (d >= OUTER + 0.1) continue;
          var s = seed[j * cols + i];
          var edge = d <= INNER ? 1 : (OUTER - d) / (OUTER - INNER);
          var p = edge >= 1 ? 1 : edge + 0.12 * Math.sin(t * 1.3 + s * 6.2832);
          if (p <= 0 || p * 16 <= BAYER[(j & 3) * 4 + (i & 3)]) continue;
          var dot = p >= 1 ? CELL : CELL * (0.55 + 0.45 * Math.min(p, 1));
          var twinkle = p >= 1 && s > 0.9;
          if (twinkle) ctx.fillStyle = 'rgba(255,255,255,' + (base * (0.5 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.9 + s * 40)))).toFixed(3) + ')';
          ctx.fillRect(i * CELL + (CELL - dot) / 2, j * CELL + (CELL - dot) / 2, dot, dot);
          if (twinkle) ctx.fillStyle = 'rgba(255,255,255,' + base + ')';
        }
      }
      /* brillo suave en el centro de cada nube */
      for (var g = 0; g < n; g++) {
        var rad = r[g] * INNER;
        var grad = ctx.createRadialGradient(cx[g], cy[g], 0, cx[g], cy[g], rad);
        grad.addColorStop(0, 'rgba(255,255,255,0.07)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(cx[g], cy[g], rad, 0, 6.2832); ctx.fill();
      }
    }
    function loop(now) {
      if (visible && now - last >= STEP_MS) { last = now; draw(now); }
      requestAnimationFrame(loop);
    }
    size();
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(host); else window.addEventListener('resize', size);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(host);
    if (!reduce) requestAnimationFrame(loop);
  }
  document.querySelectorAll('[data-pixels]').forEach(setup);
})();
