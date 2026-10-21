/* ============================================================
   PIZZARIA SABORES ITALIANO - Pizzas (funcionario)
   ============================================================ */
(function () {
  'use strict';

  var P = window.Pizzaria;
  P.bindTable(document.querySelector('[data-api="pizzas"]'), 'api/pizzas', 'pizzas');
  P.bindSearch();
})();
