(function () {
  const root = document.documentElement;
  const reducedMedia = matchMedia('(prefers-reduced-motion: reduce)');
  const compactMedia = matchMedia('(max-width: 820px)');
  const toggle = document.querySelector('.motion-toggle');
  const reveals = [...document.querySelectorAll('[data-reveal], [data-inview]')];
  const parallaxItems = [...document.querySelectorAll('[data-parallax]')];
  const progress = document.querySelector('.reading-progress');
  const systemItems = [...document.querySelectorAll('.system-item')];
  let userReduced = false;
  let frame = 0;
  let observer;

  function prefersReduced() {
    return reducedMedia.matches || userReduced;
  }

  function updateProgress() {
    frame = 0;
    const range = root.scrollHeight - innerHeight;
    const value = range > 0 ? Math.min(1, Math.max(0, scrollY / range)) : 0;
    root.style.setProperty('--reading-progress', value.toFixed(4));

    parallaxItems.forEach(element => {
      if (prefersReduced() || compactMedia.matches) {
        element.style.setProperty('--parallax-y', '0px');
        return;
      }

      const bounds = element.getBoundingClientRect();
      const distance = (bounds.top + bounds.height / 2 - innerHeight / 2) / innerHeight;
      const shift = Math.max(-28, Math.min(28, distance * -28));
      element.style.setProperty('--parallax-y', shift.toFixed(2) + 'px');
    });
  }

  function requestProgress() {
    if (!frame) frame = requestAnimationFrame(updateProgress);
  }

  function syncReveal() {
    if (observer) observer.disconnect();
    const reduced = prefersReduced();
    root.classList.toggle('reduce-motion', reduced);

    if (toggle) {
      toggle.setAttribute('aria-pressed', String(reduced));
      toggle.textContent = reduced ? 'Ativar movimento' : 'Reduzir movimento';
    }

    if (reduced || !('IntersectionObserver' in window)) {
      root.classList.remove('motion-ready');
      reveals.forEach(element => element.classList.add('is-visible'));
      return;
    }

    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: '0px 0px -8% 0px' });

    reveals.forEach(element => observer.observe(element));
    root.classList.add('motion-ready');
  }

  systemItems.forEach(item => {
    const activate = () => {
      systemItems.forEach(other => other.classList.toggle('is-active', other === item));
    };
    item.addEventListener('mouseenter', activate);
    item.addEventListener('focus', activate);
  });

  if (toggle) {
    toggle.addEventListener('click', () => {
      userReduced = !prefersReduced();
      syncReveal();
    });
  }

  reducedMedia.addEventListener('change', syncReveal);
  compactMedia.addEventListener('change', requestProgress);
  addEventListener('scroll', requestProgress, { passive: true });
  addEventListener('resize', requestProgress, { passive: true });
  addEventListener('pageshow', requestProgress);
  syncReveal();
  updateProgress();
})();
