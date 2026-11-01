/* ============================================================
   PIZZARIA SABORES ITALIANO - relatorios
   ============================================================ */
(function () {
  'use strict';
  var P = window.Pizzaria;

  /* Tabela demo, caso apareca no futuro (mantem o hook table[data-api]) */
  var table = document.querySelector('table[data-api="relatorios"]');
  if (table && P.bindTable) {
    P.bindTable(table, 'api/relatorios', 'relatorios');
  }

  /* Busca generica do base.js */
  if (P.bindSearch) P.bindSearch();

  /* ---------- Abas de relatorio (data-report / data-panel) ---------- */
  var tabs = document.querySelectorAll('.tab[data-report]');
  var panels = document.querySelectorAll('[data-panel]');

  Array.prototype.forEach.call(tabs, function (tab) {
    tab.addEventListener('click', function () {
      var key = tab.getAttribute('data-report');
      Array.prototype.forEach.call(tabs, function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      Array.prototype.forEach.call(panels, function (panel) {
        panel.style.display = panel.getAttribute('data-panel') === key ? '' : 'none';
      });
    });
  });
})();
