/* ============================================================
   PIZZARIA SABORES ITALIANO - Estoque (funcionario)
   ============================================================ */
(function () {
  'use strict';

  var P = window.Pizzaria;
  P.bindTable(document.querySelector('[data-api="estoque"]'), 'api/estoque', 'estoque');
  P.bindSearch();
})();
