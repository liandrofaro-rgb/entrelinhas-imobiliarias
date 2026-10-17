/*
 * Aviso de cookies, Meta Pixel, Microsoft Clarity e Google Analytics 4.
 * Nada externo é carregado antes da escolha do visitante.
 *
 * IDs: troque somente aqui. Enquanto um ID estiver vazio, o serviço
 * correspondente fica desligado e não aparece no aviso.
 */
(function () {
  var CONFIG = {
    metaPixelId: '2402863303246556',     // Meta > Gerenciador de Eventos > Fontes de dados (número de 15 ou 16 dígitos)
    clarityProjectId: 'yy5ugafk3a', // Clarity > Settings > Overview > Project ID (código de 10 letras/números)
    ga4Id: 'G-F8DFP490DP'    // GA4 > Administrador > Fluxos de dados > ID da métrica (começa com G-)
  };

  var STORAGE_KEY = 'lf-consentimento';
  var hasPixel = /^\d{10,20}$/.test(CONFIG.metaPixelId);
  var hasClarity = /^[a-z0-9]{6,20}$/i.test(CONFIG.clarityProjectId);
  var hasGA4 = /^G-[A-Z0-9]{6,12}$/.test(CONFIG.ga4Id);
  var hasMedicao = hasClarity || hasGA4;
  if (!hasPixel && !hasClarity && !hasGA4) return;
  // Com o GA4 ligado, quem já tinha escolhido vê o aviso de novo, porque a
  // permissão antiga não citava o Google.
  var VERSION = hasGA4 ? 2 : 1;

  function readChoice() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && saved.v === VERSION) return saved;
    } catch (e) {}
    return null;
  }

  function saveChoice(choice) {
    choice.v = VERSION;
    choice.em = new Date().toISOString();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(choice)); } catch (e) {}
  }

  function loadScript(src) {
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  }

  // Meta Pixel sem leitura automática de formulários/botões e sem dados pessoais.
  function startPixel() {
    if (!hasPixel || window.fbq) return;
    var fbq = window.fbq = function () {
      fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = fbq;
    fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = [];
    loadScript('https://connect.facebook.net/en_US/fbevents.js');
    fbq('set', 'autoConfig', false, CONFIG.metaPixelId);
    fbq('init', CONFIG.metaPixelId);
    fbq('track', 'PageView');
  }

  // Clarity com mascaramento de formulários e de textos marcados como sensíveis.
  function startClarity() {
    if (!hasClarity || window.clarity) return;
    document.querySelectorAll('form, input, textarea, select, [data-sensivel]').forEach(function (el) {
      el.setAttribute('data-clarity-mask', 'true');
    });
    window.clarity = function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
    loadScript('https://www.clarity.ms/tag/' + encodeURIComponent(CONFIG.clarityProjectId));
    window.clarity('consent');
  }

  // GA4 só com Medição aceita. Os sinais de anúncios do Google (Google Ads)
  // ficam negados, a menos que Anúncios também tenha sido aceito.
  function startGA4(choice) {
    if (!hasGA4) return;
    var ads = choice.anuncios ? 'granted' : 'denied';
    var consent = { analytics_storage: 'granted', ad_storage: ads, ad_user_data: ads, ad_personalization: ads };
    if (window.gtag) { window.gtag('consent', 'update', consent); return; }
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', consent);
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(CONFIG.ga4Id));
    window.gtag('js', new Date());
    window.gtag('config', CONFIG.ga4Id, { allow_google_signals: false });
  }

  function apply(choice) {
    if (choice.anuncios) startPixel();
    if (choice.medicao) startClarity();
    if (choice.medicao) startGA4(choice);
  }

  // De onde veio a visita: utm_source, se houver; senão, marcação automática
  // do Google Ads ou da Meta; senão, "direto".
  function origem() {
    var q = new URLSearchParams(location.search);
    if (q.get('utm_source')) return q.get('utm_source');
    if (q.has('gclid') || q.has('gbraid') || q.has('gad_source')) return 'google';
    if (q.has('fbclid')) return 'meta';
    return 'direto';
  }

  // Clique no WhatsApp vira evento "Contact" (sem número, nome ou mensagem).
  // "botao" diz qual link foi clicado (atributo data-wa na página).
  // Um segundo clique no mesmo link em menos de 1,5 s não conta de novo.
  var lastLink = null, lastTime = 0;
  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href*="wa.me/"], a[href*="api.whatsapp.com"]');
    if (!link) return;
    var now = Date.now();
    if (link === lastLink && now - lastTime < 1500) return;
    lastLink = link; lastTime = now;
    var botao = link.getAttribute('data-wa') || 'outro';
    if (window.fbq) window.fbq('track', 'Contact', { content_name: 'WhatsApp', botao: botao, origem: origem() });
    if (window.clarity) window.clarity('event', 'whatsapp_clique');
    if (window.gtag) window.gtag('event', 'whatsapp_click', { botao: botao, origem: origem() });
  }, true);

  function clearCookies() {
    var host = location.hostname.split('.');
    var domains = [''];
    for (var i = 0; i < host.length - 1; i++) domains.push('; domain=.' + host.slice(i).join('.'));
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (/^(_fbp|_fbc|_clck|_clsk|CLID|MUID|ANONCHK|SM|_ga|_ga_[A-Z0-9]+|_gcl_au)$/.test(name)) {
        domains.forEach(function (d) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
        });
      }
    });
  }

  var banner;

  function close() {
    if (banner) { banner.remove(); banner = null; }
  }

  function decide(choice) {
    var before = readChoice();
    saveChoice(choice);
    close();
    var revoked = before && ((before.anuncios && !choice.anuncios) || (before.medicao && !choice.medicao));
    if (revoked) { clearCookies(); location.reload(); return; }
    apply(choice);
  }

  // Aviso curto: só Recusar ou Aceitar. Os detalhes ficam na página de privacidade.
  function showBanner() {
    if (banner) return;
    banner = document.createElement('section');
    banner.className = 'lf-consent';
    banner.setAttribute('aria-label', 'Aviso de cookies');
    banner.innerHTML =
      '<p class="lf-consent-text">Uso cookies para medir visitas e para anúncios, só se você aceitar. ' +
      '<a href="/privacidade.html#cookies">Saiba mais</a>.</p>' +
      '<div class="lf-consent-actions">' +
        '<button type="button" class="lf-consent-btn" data-acao="recusar">Recusar</button>' +
        '<button type="button" class="lf-consent-btn lf-consent-primary" data-acao="aceitar">Aceitar</button>' +
      '</div>';
    banner.addEventListener('click', function (event) {
      var btn = event.target.closest('button[data-acao]');
      if (!btn) return;
      var acao = btn.getAttribute('data-acao');
      if (acao === 'recusar') decide({ medicao: false, anuncios: false });
      if (acao === 'aceitar') decide({ medicao: hasMedicao, anuncios: hasPixel });
    });
    document.body.appendChild(banner);
  }

  function init() {
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/consentimento.css';
    document.head.appendChild(css);

    document.querySelectorAll('[data-consentimento-abrir]').forEach(function (el) {
      el.hidden = false;
      el.addEventListener('click', showBanner);
    });

    var choice = readChoice();
    if (choice) apply(choice); else showBanner();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
