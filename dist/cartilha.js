/* Teste "Tenho direito à usucapião?". Roda só no navegador: não guarda nem envia nenhuma resposta. */
(function () {
  var root = document.querySelector('[data-quiz]');
  if (!root) return;

  var YEARS = ['Menos de 2 anos', 'De 2 a 5 anos', 'De 5 a 10 anos', 'De 10 a 15 anos', 'Mais de 15 anos'];
  var QUESTIONS = [
    { text: 'Você usa o imóvel como se fosse seu, sem ter pedido permissão ao dono e sem pagar aluguel?',
      help: 'Quem mora por aluguel, empréstimo ou favor do dono, em regra, não conta tempo para a usucapião.' },
    { text: 'O imóvel é particular? Ou seja: não é da prefeitura, do Estado ou da União, nem fica em área de preservação ambiental.',
      help: 'Imóvel público não pode ser usucapido. Área de preservação ambiental também não, segundo o STJ.' },
    { text: 'Desde que você ocupa o imóvel, ninguém tentou retomá-lo na Justiça?',
      help: 'Uma ação do dono pode interromper a contagem do prazo.' },
    { text: 'Há quanto tempo você ocupa o imóvel? Se for o caso, some o tempo de quem ocupou antes de você.',
      help: 'Uma estimativa serve. Quanto mais antigo o imóvel, mais importa guardar provas.', years: true },
    { text: 'O imóvel é a sua moradia (ou da sua família), fica na cidade, tem até 250 m² e você não tem outro imóvel, urbano ou rural?',
      help: 'Esses pontos abrem a usucapião especial urbana. Se o imóvel for rural, o caminho é outro (até 50 hectares).' }
  ];

  var ENDS = {
    permissao: { tone: 'wait', title: 'Provavelmente ainda não',
      text: 'Quando o dono permitiu que você ficasse, o tempo de moradia, em regra, não conta. Isso pode mudar se, em algum momento, você passou a agir como dono de forma clara. Cada caso tem detalhes.' },
    publico: { tone: 'no', title: 'Não é possível',
      text: 'Imóveis públicos e áreas de preservação ambiental não podem ser usucapidos, qualquer que seja o tempo de ocupação.' },
    oposicao: { tone: 'wait', title: 'Atenção: o prazo pode ter sido interrompido',
      text: 'Se o dono entrou na Justiça ou tomou medida formal para retomar o imóvel, a contagem pode ter sido interrompida. É preciso analisar os documentos com cuidado.' }
  };

  function byYears(y, q5) {
    var yes = q5 === 'sim';
    if (y === 0) return { tone: 'wait', title: 'Ainda é cedo',
      text: 'Em regra, o menor prazo é de 5 anos. Só a usucapião familiar tem prazo de 2 anos, em situação bem específica.' };
    if (y === 1) return { tone: 'wait', title: 'Em regra, ainda falta tempo',
      text: 'A exceção é a usucapião familiar (2 anos): imóvel urbano de até 250 m², dividido com ex-cônjuge ou ex-companheiro que saiu de casa, e do qual você ficou com a posse direta e exclusiva.' };
    if (y === 2) return yes
      ? { tone: 'ok', title: 'Pode se encaixar na usucapião especial urbana',
          text: 'Ela tem prazo de 5 anos para imóvel urbano de até 250 m², usado como moradia, por quem não tem outro imóvel.' }
      : { tone: 'wait', title: 'Em regra, ainda falta tempo',
          text: 'Fora da especial urbana, os prazos mais comuns são de 10 e 15 anos. Há exceções específicas, como a ordinária de 5 anos, a rural e a coletiva.' };
    if (y === 3) return yes
      ? { tone: 'ok', title: 'Pode se encaixar em mais de um tipo',
          text: 'A especial urbana (5 anos) e, conforme o caso, a ordinária (10 anos, com contrato ou recibo e boa-fé) ou a extraordinária reduzida (10 anos, se você mora no imóvel ou fez obras nele).' }
      : { tone: 'ok', title: 'Pode ter um caminho',
          text: 'A ordinária (10 anos, com contrato ou recibo e boa-fé) ou a extraordinária reduzida (10 anos, se você mora no imóvel ou fez obras nele).' };
    return yes
      ? { tone: 'ok', title: 'O prazo de vários tipos já passou',
          text: 'Com mais de 15 anos de posse, o tempo da especial urbana e o da extraordinária já foram cumpridos, em regra. Falta conferir as demais condições e as provas.' }
      : { tone: 'ok', title: 'O prazo da extraordinária já passou',
          text: 'Com mais de 15 anos de posse como dono, o tempo da usucapião extraordinária está completo, em regra. Falta conferir as demais condições e as provas.' };
  }

  var step = 0, answers = [];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }
  function btn(label, onClick, ghost) {
    var b = el('button', 'cv-btn' + (ghost ? ' cv-btn-ghost' : ''), label);
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  }
  function clear() { while (root.firstChild) root.removeChild(root.firstChild); }
  function focusBox(node) { node.setAttribute('tabindex', '-1'); node.focus({ preventScroll: true }); }

  function ask() {
    clear();
    var q = QUESTIONS[step];
    var box = el('div');
    box.setAttribute('aria-live', 'polite');
    box.appendChild(el('span', 'cv-q-progress', 'Pergunta ' + (step + 1) + ' de ' + QUESTIONS.length));
    var bar = el('div', 'cv-q-bar'); bar.appendChild(el('i', 's' + (step + 1))); box.appendChild(bar);
    box.appendChild(el('p', 'cv-q-text', q.text));
    box.appendChild(el('p', 'cv-q-help', q.help));
    var opts = el('div', 'cv-q-opts');
    if (q.years) {
      YEARS.forEach(function (label, i) { opts.appendChild(btn(label, function () { answer(i); })); });
    } else {
      opts.appendChild(btn('Sim', function () { answer('sim'); }));
      opts.appendChild(btn('Não', function () { answer('nao'); }));
    }
    box.appendChild(opts);
    if (step > 0) {
      var back = el('div', 'cv-q-back');
      back.appendChild(btn('Voltar', function () { answers.pop(); step--; ask(); }, true));
      box.appendChild(back);
    }
    root.appendChild(box);
  }

  function answer(v) {
    answers[step] = v;
    if (step === 0 && v === 'nao') return finish(ENDS.permissao);
    if (step === 1 && v === 'nao') return finish(ENDS.publico);
    if (step === 2 && v === 'nao') return finish(ENDS.oposicao);
    if (step === 4) return finish(byYears(answers[3], v));
    step++; ask();
  }

  function finish(end) {
    clear();
    var r = el('div', 'cv-result ' + end.tone);
    r.setAttribute('aria-live', 'polite');
    r.appendChild(el('p', 'cv-r-title', end.title));
    r.appendChild(el('p', 'cv-r-text', end.text));
    r.appendChild(el('p', 'cv-r-foot', 'Isto é uma orientação geral, não uma garantia nem um parecer. O próximo passo é reunir provas (veja a seção “Como provar”) e conversar com um advogado de sua confiança sobre o seu caso.'));
    var actions = el('div', 'cv-q-back');
    actions.appendChild(btn('Refazer o teste', function () { step = 0; answers = []; ask(); }, true));
    var a = el('a', 'cv-btn cv-btn-ghost', 'Ver como provar'); a.href = '#provas';
    actions.appendChild(a);
    r.appendChild(actions);
    root.appendChild(r);
    focusBox(r);
  }

  ask();
})();
