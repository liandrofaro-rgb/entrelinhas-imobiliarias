(function () {
  var doc = document.querySelector('.nl-doc');
  if (!doc) return;
  var tabs = Array.prototype.slice.call(doc.querySelectorAll('[role="tab"]'));
  if (!tabs.length) return;
  function show(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  }
  doc.classList.add('nl-js');
  show(tabs[0], false);
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { show(t, false); });
    t.addEventListener('keydown', function (e) {
      var k = e.key, n = -1;
      if (k === 'ArrowRight') n = (i + 1) % tabs.length;
      else if (k === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
      else if (k === 'Home') n = 0;
      else if (k === 'End') n = tabs.length - 1;
      if (n > -1) { e.preventDefault(); show(tabs[n], true); }
    });
  });
})();
