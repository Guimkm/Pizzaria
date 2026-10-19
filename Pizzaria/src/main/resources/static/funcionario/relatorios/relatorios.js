/* ============================================================
   PIZZARIA SABORES ITALIANO - Relatorios (funcionario)
   Troca de painel por segmento.
   ============================================================ */
(function () {
  'use strict';

  var repBtns = document.querySelectorAll('[data-report]');
  Array.prototype.forEach.call(repBtns, function (b) {
    b.addEventListener('click', function () {
      var key = b.getAttribute('data-report');
      Array.prototype.forEach.call(repBtns, function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      Array.prototype.forEach.call(document.querySelectorAll('.report-panel'), function (p) {
        p.style.display = p.getAttribute('data-panel') === key ? '' : 'none';
      });
    });
  });
})();
