(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // copyright year
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // header state
  var top = $('#top');
  if (top) {
    var onScroll = function () { top.classList.toggle('scrolled', window.scrollY > 12); };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // About menu: works on hover/focus (CSS) and on tap
  var dd = $('.dd');
  if (dd) {
    var btn = $('button', dd);
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = dd.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
    document.addEventListener('click', function () { dd.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); });
  }

  // presenter search
  var q = $('#q'), cards = $$('.card');
  if (q) {
    q.addEventListener('input', function () {
      var v = q.value.trim().toLowerCase(), n = 0;
      cards.forEach(function (c) {
        var m = !v || c.getAttribute('data-q').indexOf(v) > -1;
        c.classList.toggle('hide', !m);
        n += m ? 1 : 0;
      });
      $('#empty').classList.toggle('show', !n);
    });
  }

  // card spotlight
  var grid = $('#grid');
  if (grid) {
    grid.addEventListener('pointermove', function (e) {
      var c = e.target.closest('.card');
      if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', e.clientX - r.left + 'px');
      c.style.setProperty('--my', e.clientY - r.top + 'px');
    });
  }

  // back link returns through history when we came from this site, so the transition reverses
  var back = $('#back');
  if (back) {
    back.addEventListener('click', function (e) {
      try {
        if (history.length > 1 && document.referrer && new URL(document.referrer).origin === location.origin) {
          e.preventDefault();
          history.back();
        }
      } catch (err) { /* fall through to the link */ }
    });
  }

  // reveals: only hide what is below the fold, then let it in
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.remove('pre'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    $$('.rv').forEach(function (el) {
      if (el.getBoundingClientRect().top > innerHeight * 0.9) { el.classList.add('pre'); io.observe(el); }
    });
  }

  // star field
  var c = $('#stars');
  if (c) {
    var x = c.getContext('2d'), S = [], w, h, dpr = Math.min(devicePixelRatio || 1, 2);
    var size = function () {
      var r = c.getBoundingClientRect();
      w = r.width; h = r.height;
      c.width = w * dpr; c.height = h * dpr;
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      S = [];
      for (var i = 0, n = Math.round(w * h / 9000); i < n; i++) {
        S.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.3 + 0.2, p: Math.random() * 6.28, s: 0.4 + Math.random() * 1.2, a: Math.random() < 0.12 });
      }
    };
    var draw = function (t) {
      x.clearRect(0, 0, w, h);
      S.forEach(function (s) {
        x.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(t / 1000 * s.s + s.p));
        x.fillStyle = s.a ? '#ffb454' : '#ffffff';
        x.beginPath(); x.arc(s.x, s.y, s.r, 0, 6.28); x.fill();
      });
      if (!reduce) requestAnimationFrame(draw);
    };
    size();
    addEventListener('resize', size);
    requestAnimationFrame(draw);
  }
})();
