/* ============================================================
   PIZZARIA SABORES ITALIANO - clientes
   ============================================================ */
(function () {
  'use strict';
  var P = window.Pizzaria;

  /* Tabela demo (mantem o hook table[data-api]) */
  var table = document.querySelector('table[data-api="clientes"]');
  if (table && P.bindTable) {
    P.bindTable(table, 'api/clientes', 'clientes');
  }

  /* Busca generica do base.js */
  if (P.bindSearch) P.bindSearch();

  /* ---------- Abas + busca + bairro juntos ---------- */
  var wrap = document.getElementById('table-clientes');
  var input = document.querySelector('input[data-search="#table-clientes"]');
  var bairro = document.getElementById('filter-clientes');
  var tabs = document.querySelectorAll('.tab[data-filter]');
  var active = 'todos';

  function applyFilter() {
    if (!wrap) return;
    var q = input ? input.value.trim().toLowerCase() : '';
    var b = bairro ? bairro.value : 'Todos os bairros';
    var showAllBairro = !b || b === 'Todos os bairros';
    Array.prototype.forEach.call(wrap.querySelectorAll('tbody tr'), function (tr) {
      var st = tr.getAttribute('data-status');
      var okTab = active === 'todos' || !st || st === active;
      var okText = !q || tr.textContent.toLowerCase().indexOf(q) !== -1;
      var okBairro = showAllBairro || tr.getAttribute('data-bairro') === b;
      tr.style.display = okTab && okText && okBairro ? '' : 'none';
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
  if (bairro) bairro.addEventListener('change', applyFilter);
})();
