/* ============================================================
   PIZZARIA SABORES ITALIANO - Pedidos (funcionario)
   ============================================================ */
(function () {
  'use strict';

  var P = window.Pizzaria;
  P.bindTable(document.querySelector('[data-api="pedidos"]'), 'api/pedidos', 'pedidos');
  P.bindSearch();
})();
