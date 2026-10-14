(function () {
  document.documentElement.classList.add('js');

  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#nav');
  const mobile = matchMedia('(max-width: 980px)');

  const navLinks = [...document.querySelectorAll('#nav a[href^="#"]')];
  const navSections = navLinks.map(link => ({
    link,
    section: document.querySelector(link.getAttribute('href'))
  })).filter(item => item.section);

  const navIndicator = document.querySelector('.nav-indicator');

  function positionNavIndicator(link) {
    if (!navIndicator || !nav || !link) return;
    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    navIndicator.style.left = `${linkRect.left - navRect.left}px`;
    navIndicator.style.width = `${linkRect.width}px`;
  }

  function setActiveNav(linkHref) {
    navLinks.forEach(link => {
      const active = link.getAttribute('href') === linkHref;
      link.classList.toggle('is-active', active);
      if (active) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    const activeLink = navLinks.find(link => link.getAttribute('href') === linkHref);
    positionNavIndicator(activeLink);
  }

  function updateNavByScroll() {
    if (!navSections.length) return;

    const viewportOffset = window.innerHeight * 0.38;
    const current = navSections.find(item => {
      const rect = item.section.getBoundingClientRect();
      return rect.top <= viewportOffset && rect.bottom > viewportOffset;
    }) || navSections.reduce((closest, item) => {
      const rect = item.section.getBoundingClientRect();
      const distance = rect.top > viewportOffset
        ? rect.top - viewportOffset
        : viewportOffset - rect.bottom;
      if (!closest || distance < closest.distance) {
        return { item, distance };
      }
      return closest;
    }, null)?.item;

    if (current) {
      setActiveNav(current.link.getAttribute('href'));
    }
  }

  if (navSections.length) {
    updateNavByScroll();
    window.addEventListener('scroll', updateNavByScroll, { passive: true });
    window.addEventListener('resize', updateNavByScroll);
  }

  const currentNavLink = nav?.querySelector('a[aria-current]');
  positionNavIndicator(currentNavLink);
  addEventListener('resize', () => positionNavIndicator(nav?.querySelector('a[aria-current]')));

  function setMenu(open) {
    if (!menu || !nav) return;
    const closedOnMobile = mobile.matches && !open;
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    nav.toggleAttribute('inert', closedOnMobile);
    nav.setAttribute('aria-hidden', String(closedOnMobile));
    menu.querySelector('span').textContent = open ? '−' : '+';
  }

  if (menu && nav) {
    menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', event => {
      if (event.target.closest('a') && mobile.matches) setMenu(false);
    });
    document.addEventListener('click', event => {
      if (mobile.matches && nav.classList.contains('open') && !event.target.closest('.site-header')) setMenu(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menu.focus();
      }
    });
    mobile.addEventListener('change', () => setMenu(false));
    setMenu(false);
  }

  const whatsapp = document.querySelector('.whatsapp-float');
  const compactLayout = matchMedia('(max-width: 820px)');
  const protectedWhatsAppSections = ['#inicio', '#atuacao']
    .map(selector => document.querySelector(selector))
    .filter(Boolean);

  function updateWhatsAppVisibility() {
    if (!whatsapp || !protectedWhatsAppSections.length) return;
    const compactSectionIsVisible = compactLayout.matches && protectedWhatsAppSections.some(section => {
      const rect = section.getBoundingClientRect();
      return rect.top < window.innerHeight * .86 && rect.bottom > window.innerHeight * .14;
    });
    whatsapp.classList.toggle('is-context-hidden', compactSectionIsVisible);
  }

  if (whatsapp) {
    updateWhatsAppVisibility();
    addEventListener('scroll', updateWhatsAppVisibility, { passive: true });
    compactLayout.addEventListener('change', updateWhatsAppVisibility);
  }

  const search = document.querySelector('#search');
  const rows = [...document.querySelectorAll('.article-row')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const noResults = document.querySelector('#no-results');
  let category = 'all';
  const normalize = value => value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  function filterArticles() {
    let count = 0;
    const query = normalize(search.value.trim());
    rows.forEach(row => {
      const categoryMatch = category === 'all' || row.dataset.category === category;
      const textMatch = normalize(row.textContent).includes(query);
      const show = categoryMatch && textMatch;
      row.hidden = !show;
      if (show) count += 1;
    });
    if (noResults) noResults.hidden = count > 0;
  }

  if (search) {
    search.addEventListener('input', filterArticles);
    filters.forEach(button => button.addEventListener('click', () => {
      category = button.dataset.filter;
      filters.forEach(other => {
        other.classList.toggle('active', other === button);
        other.setAttribute('aria-pressed', String(other === button));
      });
      filterArticles();
    }));
  }

  const form = document.querySelector('#newsletter-form');
  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const status = document.querySelector('#form-status');
      status.textContent = 'Demonstração concluída: nenhum dado foi enviado ou armazenado. O serviço de envio será conectado antes da abertura das inscrições.';
    });
  }
})();
