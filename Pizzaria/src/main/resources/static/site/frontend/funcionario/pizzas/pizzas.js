/* ============================================================
   PIZZARIA SABORES ITALIANO - cardapio (pizzas)
   ============================================================ */
(function () {
  'use strict';
  var P = window.Pizzaria;

  /* Tabela demo (mantem o hook table[data-api]) */
  var table = document.querySelector('table[data-api="pizzas"]');
  if (table && P.bindTable) {
    P.bindTable(table, 'api/pizzas', 'pizzas');
  }

  /* Busca generica do base.js */
  if (P.bindSearch) P.bindSearch();

  /* ---------- Abas + busca juntos ---------- */
  var wrap = document.getElementById('table-pizzas');
  var input = document.querySelector('input[data-search="#table-pizzas"]');
  var tabs = document.querySelectorAll('.tab[data-filter]');
  var active = 'todos';

  function applyFilter() {
    if (!wrap) return;
    var q = input ? input.value.trim().toLowerCase() : '';
    Array.prototype.forEach.call(wrap.querySelectorAll('tbody tr'), function (tr) {
      var st = tr.getAttribute('data-status');
      var okTab = active === 'todos' || !st || st === active;
      var okText = !q || tr.textContent.toLowerCase().indexOf(q) !== -1;
      tr.style.display = okTab && okText ? '' : 'none';
    });
  }

  Array.prototype.forEach.call(tabs, function (tab) {
    tab.addEventListener('click', function () {
      Array.prototype.forEach.call(tabs, function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      active = tab.getAttribute('data-filter') || 'todos';
      applyFilter();
    });
  });

  if (input) input.addEventListener('input', applyFilter);
})();
