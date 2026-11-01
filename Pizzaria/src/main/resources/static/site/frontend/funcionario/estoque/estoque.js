/* ============================================================
   PIZZARIA SABORES ITALIANO - estoque
   ============================================================ */
(function () {
  'use strict';
  var P = window.Pizzaria;

  /* Tabela demo (mantem o hook table[data-api]) */
  var table = document.querySelector('table[data-api="estoque"]');
  if (table && P.bindTable) {
    P.bindTable(table, 'api/estoque', 'estoque');
  }

  /* Busca generica do base.js */
  if (P.bindSearch) P.bindSearch();

  /* ---------- Abas + busca + unidade juntos ---------- */
  var wrap = document.getElementById('table-estoque');
  var input = document.querySelector('input[data-search="#table-estoque"]');
  var unidade = document.getElementById('filter-estoque');
  var tabs = document.querySelectorAll('.tab[data-filter]');
  var active = 'todos';

  function applyFilter() {
    if (!wrap) return;
    var q = input ? input.value.trim().toLowerCase() : '';
    var u = unidade ? unidade.value : 'Todas as unidades';
    var showAllUnidade = !u || u === 'Todas as unidades';
    Array.prototype.forEach.call(wrap.querySelectorAll('tbody tr'), function (tr) {
      var st = tr.getAttribute('data-status');
      var okTab = active === 'todos' || !st || st === active;
      var okText = !q || tr.textContent.toLowerCase().indexOf(q) !== -1;
      var okUnidade = showAllUnidade || tr.getAttribute('data-unidade') === u;
      tr.style.display = okTab && okText && okUnidade ? '' : 'none';
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
  if (unidade) unidade.addEventListener('change', applyFilter);
})();
