(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scrollFns = [];
  function onScroll(fn) { scrollFns.push(fn); fn(); }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; scrollFns.forEach(function (f) { f(); }); });
  }, { passive: true });
  window.addEventListener('resize', function () { scrollFns.forEach(function (f) { f(); }); });

  /* Cabecera */
  var header = document.querySelector('[data-header]');
  if (header) onScroll(function () { header.toggleAttribute('data-scrolled', window.scrollY > 12); });

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

  /* Aparición al hacer scroll */
  var items = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.setAttribute('data-visible', ''); io.unobserve(en.target); countUp(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.setAttribute('data-visible', ''); });
  }

  /* Números que cuentan hacia arriba */
  function countUp(root) {
    if (reduce) return;
    root.querySelectorAll('[data-count]').forEach(function (el) {
      var to = parseInt(el.getAttribute('data-count'), 10), t0 = performance.now(), dur = 1400;
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(to * e));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }

  /* Abanico del hero: se abre al hacer scroll */
  var stage = document.querySelector('[data-stage]');
  if (stage && !reduce) onScroll(function () {
    var p = Math.max(0, Math.min(1, window.scrollY / (window.innerHeight * 0.8)));
    stage.style.setProperty('--sp', p.toFixed(3));
  });

  /* Manifiesto: las palabras se encienden al avanzar */
  var statement = document.querySelector('[data-words]');
  if (statement) {
    var words = statement.querySelectorAll('.w');
    onScroll(function () {
      var r = statement.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = reduce ? 1 : (vh * 0.85 - r.top) / (r.height + vh * 0.3);
      var lit = Math.round(Math.max(0, Math.min(1, p)) * words.length);
      for (var i = 0; i < words.length; i++) words[i].classList.toggle('on', i < lit);
    });
  }

  /* Votos del boleto: se mueven solos hasta que alguien toca */
  document.querySelectorAll('.vote-row').forEach(function (row) {
    var btns = row.querySelectorAll('.vote-btn'), timer = null, idx = 0;
    function select(b) { btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); }
    row.addEventListener('click', function (e) {
      var b = e.target.closest('.vote-btn');
      if (!b) return;
      if (timer) { clearInterval(timer); timer = null; }
      select(b);
    });
    if (row.hasAttribute('data-autovote') && !reduce) {
      timer = setInterval(function () {
        if (!row.getBoundingClientRect().height) return;
        idx = (idx + 1) % btns.length; select(btns[idx]);
      }, 1800);
    }
  });
  document.querySelectorAll('.mood').forEach(function (m) {
    m.addEventListener('click', function () { m.setAttribute('aria-pressed', String(m.getAttribute('aria-pressed') !== 'true')); });
  });

  /* «Para hoy»: los fondos rotan */
  document.querySelectorAll('[data-spot]').forEach(function (spot) {
    var bgs = spot.querySelectorAll('.cinema-bg img'), ts = spot.querySelectorAll('.spot-title'), picks = spot.querySelectorAll('.pick'), i = 0, timer = null, SLIDE = 6000;
    if (bgs.length < 2) return;
    spot.style.setProperty('--slide', SLIDE + 'ms');
    function go(n) {
      [bgs, ts, picks].forEach(function (l) { l[i].classList.remove('on'); });
      picks[i].setAttribute('aria-selected', 'false');
      i = n;
      [bgs, ts, picks].forEach(function (l) { l[i].classList.add('on'); });
      picks[i].setAttribute('aria-selected', 'true');
      /* reinicia la barra de progreso */
      var bar = picks[i].querySelector('.pick-bar i');
      bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
    }
    function start() { if (timer) clearInterval(timer); if (!reduce) timer = setInterval(function () { if (!document.hidden) go((i + 1) % bgs.length); }, SLIDE); }
    picks.forEach(function (p, n) { p.addEventListener('click', function () { go(n); start(); }); });
    start();
  });

  /* Texto que se escribe solo (A tu medida) */
  document.querySelectorAll('[data-typing]').forEach(function (el) {
    if (reduce) return;
    var lines = el.getAttribute('data-typing').split('|');
    var li = 0, ci = lines[0].length, deleting = true, wait = 2600;
    var caret = document.createElement('span');
    caret.className = 'caret';
    caret.setAttribute('aria-hidden', 'true');
    var text = document.createTextNode(lines[0]);
    el.textContent = '';
    el.appendChild(text); el.appendChild(caret);
    function tick() {
      if (wait > 0) { var w = wait; wait = 0; return setTimeout(tick, w); }
      if (deleting) {
        ci--;
        if (ci <= 0) { ci = 0; deleting = false; li = (li + 1) % lines.length; wait = 400; }
      } else {
        ci++;
        if (ci >= lines[li].length) { deleting = true; wait = 2600; }
      }
      text.nodeValue = lines[li].slice(0, ci);
      setTimeout(tick, deleting ? 22 : 48);
    }
    tick();
  });

  /* Nube de pixeles: port de PixelCloud.kt de la app (nubes de luz cuyo borde se deshace en pixeles con matriz de Bayer) */
  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  var LAYOUTS = [
    [[0.22, 0.30, 0.34], [0.80, 0.22, 0.30]],
    [[0.50, 1.04, 0.64], [1.05, 0.26, 0.40]],
    [[0.92, 1.02, 0.60], [0.00, 0.28, 0.42]],
    /* franjas anchas: nubes al pie, como en la portada de la app */
    [[0.02, 1.02, 0.17], [0.98, 0.98, 0.19], [0.50, 1.30, 0.22]]
  ];
  var INNER = 0.58, OUTER = 1.12, SPEED = 0.3, STEP_MS = 100;
  function setup(host) {
    var li = (parseInt(host.getAttribute('data-pixels'), 10) || 0) % LAYOUTS.length;
    var layout = LAYOUTS[li];
    var tint = host.getAttribute('data-tint') || '255,255,255';
    var base = parseFloat(host.getAttribute('data-alpha') || '0.095');
    var CELL = parseInt(host.getAttribute('data-cell') || '7', 10);
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
      var n = layout.length, cx = [], cy = [], r = [], unit = li === 3 ? Math.max(w, 900) : Math.max(w, 600);
      for (var q = 0; q < n; q++) {
        var c = layout[q];
        cx[q] = c[0] * w + Math.sin(t * 0.35 + q * 1.7) * 0.035 * w;
        cy[q] = c[1] * h + Math.cos(t * 0.28 + q * 2.3) * 0.02 * h;
        r[q] = c[2] * unit * (1 + 0.05 * Math.sin(t * 0.6 + q * 1.1));
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
          if (d >= OUTER + 0.1) continue;
          var s = seed[j * cols + i];
          var edge = d <= INNER ? 1 : (OUTER - d) / (OUTER - INNER);
          var p = edge >= 1 ? 1 : edge + 0.12 * Math.sin(t * 1.3 + s * 6.2832);
          if (p <= 0 || p * 16 <= BAYER[(j & 3) * 4 + (i & 3)]) continue;
          var dot = p >= 1 ? CELL : CELL * (0.55 + 0.45 * Math.min(p, 1));
          var twinkle = p >= 1 && s > 0.9;
          if (twinkle) ctx.fillStyle = 'rgba(' + tint + ',' + (base * (0.5 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.9 + s * 40)))).toFixed(3) + ')';
          ctx.fillRect(i * CELL + (CELL - dot) / 2, j * CELL + (CELL - dot) / 2, dot, dot);
          if (twinkle) ctx.fillStyle = fill;
        }
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
