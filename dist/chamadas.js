/*
 * Convites flutuantes. O tipo vem do atributo data-chamada do script:
 *   newsletter (página inicial) ou guia (Publicações).
 * Regras: aparece depois de rolar, uma por visita, e não volta por 30 dias
 * depois de fechada ou clicada. Para testar, abra a página com ?chamadas=ver
 * (ignora as regras de memória).
 */
(function () {
  var script = document.currentScript;
  var tipo = script && script.getAttribute('data-chamada');
  var CHAMADAS = {
    newsletter: {
      chave: 'newsletter',
      href: 'newsletter.html#inscricao',
      kicker: 'Newsletter · gratuita',
      titulo: 'Receba o Entrelinhas no seu e-mail',
      sub: 'Decisões e análises de Direito Imobiliário, explicadas.',
      rotulo: 'Assinar a newsletter',
      icone: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="14" width="52" height="36" rx="5" fill="#1e5e91" stroke="#07172f" stroke-width="3"/><path d="M8 18 L32 36 L56 18" fill="none" stroke="#c8a154" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    },
    guia: {
      chave: 'guia',
      href: 'artigo-usucapiao-quando-cabe.html',
      kicker: 'Guia prático · 9 min',
      titulo: 'Leia o nosso guia prático sobre usucapião',
      sub: 'Cabe no seu caso? Veja requisitos e prazos.',
      rotulo: 'Ler o guia prático sobre usucapião',
      icone: '<svg viewBox="0 0 64 64" aria-hidden="true"><polygon points="32,8 58,30 6,30" fill="#c8a154" stroke="#07172f" stroke-width="3" stroke-linejoin="round"/><rect x="12" y="30" width="40" height="26" fill="#1e5e91" stroke="#07172f" stroke-width="3"/><rect x="27" y="38" width="10" height="18" fill="#07172f"/><rect x="15" y="35" width="8" height="8" fill="#bcd3e6"/><rect x="41" y="35" width="8" height="8" fill="#bcd3e6"/></svg>'
    }
  };
  var c = CHAMADAS[tipo];
  if (!c) return;

  var DIAS = 30;
  var teste = /[?&]chamadas=ver\b/.test(location.search);
  var MEMORIA = 'lf-chamada-' + c.chave;
  var VISITA = 'lf-chamada-visita';

  function lembrada() {
    if (teste) return false;
    try {
      var t = parseInt(localStorage.getItem(MEMORIA), 10);
      return t && Date.now() - t < DIAS * 86400000;
    } catch (e) { return false; }
  }
  function vistaNestaVisita() {
    if (teste) return false;
    try { return !!sessionStorage.getItem(VISITA); } catch (e) { return false; }
  }
  function marcar(daVisita) {
    try {
      if (daVisita) sessionStorage.setItem(VISITA, c.chave);
      else localStorage.setItem(MEMORIA, String(Date.now()));
    } catch (e) {}
  }
  if (lembrada() || vistaNestaVisita()) return;

  var el = null;
  var fechada = false;

  function evitarAvisoDeCookies() {
    if (!el) return;
    var aviso = document.querySelector('.lf-consent');
    el.style.setProperty('bottom', aviso ? (aviso.offsetHeight + 16) + 'px' : '');
  }

  function fechar() {
    fechada = true;
    marcar(false);
    if (el) {
      el.classList.remove('is-open');
      var morto = el;
      setTimeout(function () { if (morto.parentNode) morto.parentNode.removeChild(morto); }, 700);
    }
    window.removeEventListener('scroll', aoRolar);
  }

  function montar() {
    el = document.createElement('div');
    el.className = 'lf-chamada';
    el.setAttribute('role', 'complementary');

    // O cartão inteiro é o link; o botão de fechar fica ao lado, fora do link.
    var link = document.createElement('a');
    link.className = 'lf-chamada-link';
    link.href = c.href;
    link.setAttribute('aria-label', c.rotulo);
    link.innerHTML =
      '<span class="lf-chamada-ic">' + c.icone + '</span>' +
      '<span class="lf-chamada-tx"><span class="lf-chamada-k"></span><span class="lf-chamada-t"></span><span class="lf-chamada-s"></span></span>' +
      '<span class="lf-chamada-go" aria-hidden="true">\u2192</span>';
    link.querySelector('.lf-chamada-k').textContent = c.kicker;
    link.querySelector('.lf-chamada-t').textContent = c.titulo;
    link.querySelector('.lf-chamada-s').textContent = c.sub;
    link.addEventListener('click', function () { marcar(false); });

    var x = document.createElement('button');
    x.type = 'button';
    x.className = 'lf-chamada-x';
    x.setAttribute('aria-label', 'Fechar');
    x.textContent = '\u00d7';
    x.addEventListener('click', fechar);

    el.appendChild(link);
    el.appendChild(x);
    document.body.appendChild(el);
  }

  function aoRolar() {
    if (fechada || el) return;
    if (window.scrollY < window.innerHeight * 0.9) return;
    montar();
    evitarAvisoDeCookies();
    marcar(true);
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('is-open'); }); });
    window.removeEventListener('scroll', aoRolar);
    // O aviso de cookies pode aparecer ou sumir depois; o card acompanha.
    new MutationObserver(evitarAvisoDeCookies).observe(document.body, { childList: true });
  }

  window.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();
})();
