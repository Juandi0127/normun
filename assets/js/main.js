/* =============================================================
   NORMUN — Modelo de Naciones Unidas
   Escuela Normal Superior del Distrito de Barranquilla
   Lógica de interfaz y animaciones
   ============================================================= */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------
     1. PRELOADER
     --------------------------------------------------------- */
  (function preloader() {
    var loader = $('#loader');
    if (!loader) return;
    var closed = false;
    function close() {
      if (closed) return;
      closed = true;
      loader.classList.add('is-done');
      setTimeout(function () { loader.style.display = 'none'; }, 800);
    }
    window.addEventListener('load', function () {
      setTimeout(close, reduce ? 100 : 1500);
    });
    /* red de seguridad: si algún recurso externo se cuelga, la página igual entra */
    setTimeout(close, 4500);
  })();

  /* ---------------------------------------------------------
     2. NAVEGACIÓN
     --------------------------------------------------------- */
  var nav = $('#nav');
  var burger = $('#burger');
  var navLinks = $('#navLinks');
  var lastY = 0;

  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      document.body.classList.toggle('is-locked', open);
    });
    $$('a', navLinks).forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('is-locked');
      });
    });
  }

  /* barra de progreso + nav que se oculta al bajar */
  var progress = $('#scrollProgress');
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    if (progress) progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

    if (nav) {
      nav.classList.toggle('is-stuck', y > 40);
      var hide = y > lastY && y > 420 && !navLinks.classList.contains('is-open');
      nav.classList.toggle('is-hidden', hide);
    }
    lastY = y;
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  /* scrollspy */
  var sections = $$('main section[id]');
  var linkFor = {};
  $$('#navLinks a[href^="#"]').forEach(function (a) { linkFor[a.getAttribute('href').slice(1)] = a; });

  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var a = linkFor[e.target.id];
        if (!a) return;
        if (e.isIntersecting) {
          $$('#navLinks a').forEach(function (x) { x.classList.remove('is-current'); });
          a.classList.add('is-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------------------------------------------------------
     3. REVELADO AL HACER SCROLL
     --------------------------------------------------------- */
  var revealables = $$('.reveal');
  if (!('IntersectionObserver' in window) || reduce) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.setProperty('--rd', (e.target.dataset.delay || 0) + 'ms');
        e.target.classList.add('is-in');
        obs.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------
     4. CONTADORES DEL HERO
     --------------------------------------------------------- */
  $$('[data-count]').forEach(function (el) {
    var target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    if (reduce) { el.textContent = target; return; }
    var started = false;
    var run = function () {
      if (started) return;
      started = true;
      var t0 = performance.now(), dur = 1600;
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en, ob) {
        if (en[0].isIntersecting) { run(); ob.disconnect(); }
      }, { threshold: 0.5 }).observe(el);
    } else { run(); }
  });

  /* ---------------------------------------------------------
     5. ROLES DE LA COMISIÓN
     --------------------------------------------------------- */
  /* NOTA para el cliente: las funciones de cada rol se redactaron
     siguiendo la práctica estándar de un MUN, porque en la
     presentación de Canva aparecían como imagen. Están listas
     para que la mesa directiva las ajuste a su reglamento. */
  var ROLES = {
    presidente: {
      kicker: 'Mesa directiva',
      title: 'Presidente / a',
      icon: '<path d="M8 26l24 0M10 26V14l6 5 6-9 6 9 6-5v12" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none"/>',
      lead: 'Máxima autoridad dentro de la comisión. Dirige el debate, hace cumplir el reglamento y garantiza que cada delegación sea escuchada en igualdad de condiciones.',
      duties: [
        'Abre, suspende y clausura las sesiones de la comisión.',
        'Concede y retira la palabra: ninguna delegación habla sin su permiso.',
        'Somete a votación los puntos, las mociones y los papeles de trabajo.',
        'Revisa y aprueba los papeles de trabajo antes de su lectura.',
        'Llama a la delegación proponente de una enmienda y controla sus tiempos.',
        'Aplica el régimen de sanciones cuando se rompe el orden.'
      ]
    },
    vicepresidente: {
      kicker: 'Mesa directiva',
      title: 'Vicepresidente / a',
      icon: '<path d="M20 6l4.6 9.4 10.4 1.5-7.5 7.3 1.8 10.3L20 29.6l-9.3 4.9 1.8-10.3-7.5-7.3 10.4-1.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>',
      lead: 'Acompaña y respalda a la presidencia en la conducción del debate, y asume su dirección cuando esta se ausenta del recinto.',
      duties: [
        'Sustituye a la presidencia en la dirección de la sesión.',
        'Controla los tiempos de intervención de cada delegación.',
        'Apoya la revisión de discursos, papeles de trabajo y enmiendas.',
        'Coordina con la secretaría y el staff el desarrollo de la comisión.',
        'Da seguimiento a la lista de oradores y al orden de participación.'
      ]
    },
    delegados: {
      kicker: 'Representación',
      title: 'Delegados',
      icon: '<circle cx="20" cy="20" r="13" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M7 20h26M20 7c3.5 4 5.2 8.2 5.2 13S23.5 33 20 33c-3.5-4-5.2-8.2-5.2-13S16.5 7 20 7z" stroke="currentColor" stroke-width="1.3" fill="none"/>',
      lead: 'El corazón del modelo. Cada delegado representa a una nación —o a un personaje, en la Comisión Colombia— y defiende su postura oficial, no la propia.',
      duties: [
        'Investiga a fondo el tópico y la posición real de su país.',
        'Redacta y lee el discurso de entrada dentro del tiempo asignado.',
        'Interviene en la lista de oradores y en los debates moderados.',
        'Negocia bloques y redacta papeles de trabajo en los tiempos de lobby.',
        'Presenta puntos y mociones conforme al reglamento.',
        'Vota a favor, en contra o se abstiene: un país, un voto.'
      ]
    },
    secretaria: {
      kicker: 'Mesa directiva',
      title: 'Secretaría',
      icon: '<path d="M11 7h13l5 5v21H11z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/><path d="M24 7v5h5M16 20h9M16 25h9M16 15h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/>',
      lead: 'La memoria escrita de la comisión. Todo lo que ocurre en el recinto queda registrado por la secretaría.',
      duties: [
        'Lleva la lista de asistencia y verifica el quórum.',
        'Registra la lista de oradores y el orden de intervenciones.',
        'Anota las mociones presentadas y su resultado.',
        'Consigna los resultados de cada votación.',
        'Deja constancia de las sanciones impuestas.',
        'Custodia los discursos y documentos entregados a la mesa.'
      ]
    },
    staff: {
      kicker: 'Logística',
      title: 'Staff',
      icon: '<circle cx="20" cy="20" r="5" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M20 6v4M20 30v4M6 20h4M30 20h4M10.1 10.1l2.8 2.8M27.1 27.1l2.8 2.8M29.9 10.1l-2.8 2.8M12.9 27.1l-2.8 2.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
      lead: 'El equipo que hace posible que la comisión fluya. Invisible cuando todo marcha bien, indispensable siempre.',
      duties: [
        'Distribuye documentos y mensajes entre las delegaciones.',
        'Asiste a la mesa directiva durante toda la sesión.',
        'Controla el ingreso y la salida del recinto.',
        'Apoya la logística de los tiempos de lobby y los recesos.',
        'Garantiza el orden material del espacio de trabajo.'
      ]
    }
  };

  var rolePanel = $('#rolePanel');
  function paintRole(key) {
    var r = ROLES[key];
    if (!r || !rolePanel) return;
    rolePanel.innerHTML =
      '<div class="rp">' +
        '<div class="rp__icon"><svg viewBox="0 0 40 40" aria-hidden="true">' + r.icon + '</svg></div>' +
        '<span class="rp__kicker">' + r.kicker + '</span>' +
        '<h3 class="rp__title">' + r.title + '</h3>' +
        '<p class="rp__lead">' + r.lead + '</p>' +
        '<ul class="rp__duties">' +
          r.duties.map(function (d) { return '<li>' + d + '</li>'; }).join('') +
        '</ul>' +
      '</div>';
  }
  paintRole('presidente');

  $$('.role').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('.role').forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      paintRole(btn.dataset.role);
    });
  });

  /* navegación por teclado entre roles */
  var roleBtns = $$('.role');
  roleBtns.forEach(function (btn, i) {
    btn.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1
            : e.key === 'ArrowUp'   || e.key === 'ArrowLeft'  ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var next = roleBtns[(i + d + roleBtns.length) % roleBtns.length];
      next.focus();
      next.click();
    });
  });

  /* ---------------------------------------------------------
     6. PESTAÑAS DE PROCEDIMIENTO
     --------------------------------------------------------- */
  $$('.tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var id = tab.dataset.tab;
      $$('.tab').forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      $$('.tabp').forEach(function (p) {
        p.classList.toggle('is-active', p.dataset.panel === id);
      });
      tab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------------------------------------------------------
     7. BANCO DE FRASES · COPIAR
     --------------------------------------------------------- */
  var toast = $('#toast');
  var toastTimer;
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 2600);
  }

  $$('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var text = chip.textContent.trim();
      var done = function () {
        chip.classList.add('is-copied');
        say('Copiado: «' + text + '»');
        setTimeout(function () { chip.classList.remove('is-copied'); }, 1200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () { say('No se pudo copiar'); });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:absolute;left:-9999px';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (err) { say('No se pudo copiar'); }
        document.body.removeChild(ta);
      }
    });
  });

  /* ---------------------------------------------------------
     8. AÑO EN EL PIE DE PÁGINA
     --------------------------------------------------------- */
  var yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* =========================================================
     9. GLOBO TERRÁQUEO ANIMADO (canvas)
     ========================================================= */
  var canvas = $('#globeCanvas');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = 1;
  var cx = 0, cy = 0, R = 0;
  var running = true;

  /* --- geometría --- */
  var TILT = -0.42;                 // inclinación del eje
  var spin = 0;                     // rotación acumulada
  var SPEED = reduce ? 0 : 0.0016;

  function toVec(latDeg, lonDeg) {
    var la = latDeg * Math.PI / 180, lo = lonDeg * Math.PI / 180;
    return {
      x: Math.cos(la) * Math.cos(lo),
      y: Math.sin(la),
      z: Math.cos(la) * Math.sin(lo)
    };
  }

  function project(v) {
    // rotación sobre el eje Y
    var c = Math.cos(spin), s = Math.sin(spin);
    var x = v.x * c - v.z * s;
    var z = v.x * s + v.z * c;
    // inclinación sobre el eje X
    var ct = Math.cos(TILT), st = Math.sin(TILT);
    var y2 = v.y * ct - z * st;
    var z2 = v.y * st + z * ct;
    return { x: cx + x * R, y: cy - y2 * R, z: z2 };
  }

  /* --- malla de puntos de la esfera --- */
  var dots = [];
  (function buildDots() {
    for (var lat = -78; lat <= 78; lat += 6.5) {
      var ring = Math.max(8, Math.round(58 * Math.cos(lat * Math.PI / 180)));
      for (var i = 0; i < ring; i++) {
        dots.push(toVec(lat, (i / ring) * 360));
      }
    }
  })();

  /* --- meridianos y paralelos (líneas guía) --- */
  var wires = [];
  (function buildWires() {
    var lon, lat, line, t;
    for (lon = 0; lon < 360; lon += 30) {
      line = [];
      for (t = -90; t <= 90; t += 5) line.push(toVec(t, lon));
      wires.push(line);
    }
    for (lat = -60; lat <= 60; lat += 30) {
      line = [];
      for (t = 0; t <= 360; t += 5) line.push(toVec(lat, t));
      wires.push(line);
    }
  })();

  /* --- ciudades con presencia de la ONU + Barranquilla --- */
  var HOME = { lat: 10.96, lon: -74.80, name: 'Barranquilla' };
  var CITIES = [
    { lat: 40.71, lon: -74.01 },   // Nueva York — Sede de la ONU
    { lat: 46.20, lon: 6.14 },     // Ginebra
    { lat: 4.71,  lon: -74.07 },   // Bogotá
    { lat: -1.29, lon: 36.82 },    // Nairobi
    { lat: 48.21, lon: 16.37 },    // Viena
    { lat: 52.08, lon: 4.31 },     // La Haya
    { lat: 35.68, lon: 139.69 },   // Tokio
    { lat: 9.03,  lon: 38.74 },    // Addis Abeba
    { lat: 28.61, lon: 77.21 },    // Nueva Delhi
    { lat: -33.87, lon: 151.21 }   // Sídney
  ];

  var homeVec = toVec(HOME.lat, HOME.lon);
  var cityVecs = CITIES.map(function (c) { return toVec(c.lat, c.lon); });

  function slerp(a, b, t) {
    var d = Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z));
    var om = Math.acos(d);
    if (om < 1e-6) return { x: a.x, y: a.y, z: a.z };
    var si = Math.sin(om);
    var k0 = Math.sin((1 - t) * om) / si;
    var k1 = Math.sin(t * om) / si;
    return { x: a.x * k0 + b.x * k1, y: a.y * k0 + b.y * k1, z: a.z * k0 + b.z * k1 };
  }

  /* arcos animados que salen de Barranquilla */
  var arcs = cityVecs.map(function (v, i) {
    return { to: v, t: -i * 0.28, speed: 0.0045 + Math.random() * 0.0025 };
  });

  /* --- constelación de partículas de fondo --- */
  var stars = [];
  function buildStars() {
    stars = [];
    var n = Math.round(Math.min(90, (W * H) / 26000));
    for (var i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.3 + 0.4
      });
    }
  }

  /* --- dimensionado --- */
  function resize() {
    var rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var wide = W > 900;
    R = wide ? Math.min(H * 0.46, W * 0.28) : Math.min(H * 0.32, W * 0.42);
    cx = wide ? W * 0.74 : W * 0.5;
    cy = wide ? H * 0.48 : H * 0.30;

    buildStars();
  }

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(resize, 150);
  });
  resize();

  /* --- pausa cuando el hero sale de pantalla --- */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      running = en[0].isIntersecting;
      if (running) requestAnimationFrame(frame);
    }, { threshold: 0.02 }).observe(canvas);
  }
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && running) requestAnimationFrame(frame);
  });

  /* --- dibujo --- */
  function drawStars() {
    ctx.save();
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.x += s.vx; s.y += s.vy;
      if (s.x < 0) s.x = W; if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H; if (s.y > H) s.y = 0;

      ctx.globalAlpha = 0.55;
      ctx.fillStyle = '#8FAE99';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 6.2832);
      ctx.fill();

      for (var j = i + 1; j < stars.length; j++) {
        var o = stars[j];
        var dx = s.x - o.x, dy = s.y - o.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 15000) {
          ctx.globalAlpha = (1 - d2 / 15000) * 0.20;
          ctx.strokeStyle = '#5E9370';
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y); ctx.lineTo(o.x, o.y);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  function drawGlobe() {
    var i, p;

    /* halo suave */
    var halo = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R * 1.5);
    halo.addColorStop(0, 'rgba(46,158,66,0.10)');
    halo.addColorStop(1, 'rgba(46,158,66,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.5, 0, 6.2832);
    ctx.fill();

    /* esfera: papel apenas teñido, con la luz arriba a la izquierda */
    var core = ctx.createRadialGradient(cx - R * 0.32, cy - R * 0.36, R * 0.08, cx, cy, R);
    core.addColorStop(0, 'rgba(255,255,255,0.92)');
    core.addColorStop(1, 'rgba(46,158,66,0.13)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, 6.2832);
    ctx.fill();

    /* meridianos y paralelos */
    ctx.lineWidth = 0.7;
    for (i = 0; i < wires.length; i++) {
      var line = wires[i];
      ctx.beginPath();
      var open = false;
      for (var k = 0; k < line.length; k++) {
        p = project(line[k]);
        if (p.z > -0.02) {
          if (!open) { ctx.moveTo(p.x, p.y); open = true; }
          else ctx.lineTo(p.x, p.y);
        } else { open = false; }
      }
      ctx.strokeStyle = 'rgba(46,158,66,0.22)';
      ctx.stroke();
    }

    /* puntos de la malla: verde oscuro al frente, difuminado al fondo */
    for (i = 0; i < dots.length; i++) {
      p = project(dots[i]);
      if (p.z < 0) continue;
      var a = 0.14 + p.z * 0.62;
      var sz = 0.75 + p.z * 1.15;
      ctx.globalAlpha = a;
      ctx.fillStyle = p.z > 0.72 ? '#1B7030' : '#5AA772';
      ctx.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
    }
    ctx.globalAlpha = 1;

    /* borde */
    ctx.strokeStyle = 'rgba(27,112,48,0.32)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, 6.2832);
    ctx.stroke();
  }

  function drawArcs() {
    for (var i = 0; i < arcs.length; i++) {
      var a = arcs[i];
      a.t += a.speed;
      if (a.t > 1.5) a.t = -0.35;
      if (a.t <= 0) continue;

      var head = Math.min(1, a.t);
      var tail = Math.max(0, a.t - 0.42);
      if (tail >= 1) continue;

      ctx.beginPath();
      var started = false, visible = false;
      for (var t = tail; t <= head; t += 0.02) {
        var v = slerp(homeVec, a.to, t);
        var lift = 1 + 0.26 * Math.sin(Math.PI * t);
        var p = project({ x: v.x * lift, y: v.y * lift, z: v.z * lift });
        if (p.z > -0.1) {
          visible = true;
          if (!started) { ctx.moveTo(p.x, p.y); started = true; }
          else ctx.lineTo(p.x, p.y);
        } else { started = false; }
      }
      if (!visible) continue;
      /* los arcos alternan amarillo y rojo institucionales */
      ctx.strokeStyle = (i % 2 === 0) ? 'rgba(195,149,22,0.72)' : 'rgba(193,39,45,0.62)';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      /* punta brillante */
      var hv = slerp(homeVec, a.to, head);
      var hl = 1 + 0.26 * Math.sin(Math.PI * head);
      var hp = project({ x: hv.x * hl, y: hv.y * hl, z: hv.z * hl });
      if (hp.z > -0.1) {
        ctx.fillStyle = (i % 2 === 0) ? '#C39516' : '#C1272D';
        ctx.beginPath();
        ctx.arc(hp.x, hp.y, 2.1, 0, 6.2832);
        ctx.fill();
      }
    }
  }

  var pulse = 0;
  function drawMarkers() {
    pulse += 0.022;

    /* destinos */
    ctx.fillStyle = '#1B7030';
    for (var i = 0; i < cityVecs.length; i++) {
      var p = project(cityVecs[i]);
      if (p.z < 0.02) continue;
      ctx.globalAlpha = 0.35 + p.z * 0.6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.7, 0, 6.2832);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    /* Barranquilla */
    var h = project(homeVec);
    if (h.z > 0) {
      /* Barranquilla: punto rojo con anillo pulsante */
      var rad = 4 + Math.sin(pulse) * 1.6;
      ctx.strokeStyle = 'rgba(193,39,45,' + (0.75 - Math.sin(pulse) * 0.28) + ')';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(h.x, h.y, rad + 5, 0, 6.2832);
      ctx.stroke();

      ctx.fillStyle = '#C1272D';
      ctx.beginPath();
      ctx.arc(h.x, h.y, 3.4, 0, 6.2832);
      ctx.fill();

      ctx.font = '600 10px Inter, sans-serif';
      ctx.fillStyle = '#A81F26';
      ctx.textAlign = 'left';
      ctx.fillText('BARRANQUILLA', h.x + 12, h.y + 3.5);
    }
  }

  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    drawStars();
    drawGlobe();
    drawArcs();
    drawMarkers();
    spin += SPEED;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

})();
