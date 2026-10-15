(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  root.classList.add('sb-js');

  function init() {
    var groups = [
      '.sb-strip li',
      '.sb-split > *',
      '.sb-checks li',
      '.sb-steps li',
      '.sb-faq details',
      '.sb-close .sb-split > *'
    ];
    var seen = new Set();
    var targets = [];
    groups.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el, i) {
        if (seen.has(el)) return;
        seen.add(el);
        var siblings = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : i;
        el.setAttribute('data-r', '');
        el.style.setProperty('--d', Math.min(siblings, 6) * 0.08 + 's');
        targets.push(el);
      });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) { io.observe(el); });

    var bar = document.createElement('div');
    bar.className = 'sb-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var ticking = false;
    function update() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
      bar.style.transform = 'scaleX(' + p + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
