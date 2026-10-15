(function () {
  const flow = document.getElementById('perspective-flow');
  if (!flow) return;
  const root = document.documentElement;
  const reducedMedia = matchMedia('(prefers-reduced-motion: reduce)');
  const parts = [...flow.querySelectorAll('[data-a]')].map(el => ({ el, range: el.dataset.a.split(',').map(Number) }));
  let ticking = false;

  function clamp(v) { return Math.max(0, Math.min(1, v)); }

  function update() {
    ticking = false;
    const still = reducedMedia.matches || root.classList.contains('reduce-motion');
    const bounds = flow.getBoundingClientRect();
    const progress = clamp((innerHeight * .9 - bounds.top) / (innerHeight * .42 + bounds.height * .45));
    parts.forEach(({ el, range: [from, to] }) => {
      el.style.setProperty('--t', still ? '1' : clamp((progress - from) / (to - from)).toFixed(3));
    });
  }

  function request() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);
  new MutationObserver(request).observe(root, { attributes: true, attributeFilter: ['class'] });
  update();
})();
