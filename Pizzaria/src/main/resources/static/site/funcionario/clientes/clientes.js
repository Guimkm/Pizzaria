/* ============================================================
   PIZZARIA SABORES ITALIANO - Clientes (funcionario)
   ============================================================ */
(function () {
  'use strict';

  var P = window.Pizzaria;
  P.bindTable(document.querySelector('[data-api="clientes"]'), 'api/clientes', 'clientes');
  P.bindSearch();
})();
