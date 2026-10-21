/* ============================================================
   PIZZARIA SABORES ITALIANO - Configuracoes do funcionario
   ============================================================ */
(function () {
  'use strict';

  var P = window.Pizzaria;

  P.detectServer().then(function () {
    P.loadConfig().then(function () {
      P.applyConfig();
    });
  });

  var formConf = document.getElementById('form-config');
  var inputs = formConf ? formConf.querySelectorAll('input, textarea') : [];
  Array.prototype.forEach.call(inputs, function (input) {
    input.addEventListener('input', function () {
      var key = input.getAttribute('name');
      if (key) P.CONFIG[key] = input.value;
      P.updatePreview();
    });
  });

  if (formConf) {
    formConf.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var body = {
        nomePizzaria: document.getElementById('cf-nome').value,
        slogan: document.getElementById('cf-slogan').value,
        endereco: document.getElementById('cf-endereco').value,
        cidade: document.getElementById('cf-cidade').value,
        cep: document.getElementById('cf-cep').value,
        telefone: document.getElementById('cf-telefone').value,
        whatsapp: document.getElementById('cf-whatsapp').value,
        horario: document.getElementById('cf-horario').value,
        taxaEntrega: parseFloat(String(document.getElementById('cf-taxa').value).replace(',', '.')) || 0,
      };
      P.Api.send('PUT', 'api/config', body).then(function (res) {
        if (res.ok) {
          P.CONFIG = body;
          P.toast('Configurações salvas com sucesso!', 'success');
        } else if (res.status === 0) {
          P.CONFIG = body;
          P.toast('Configurações salvas (modo demonstração)', 'info', 'info');
        } else {
          P.toast('Erro ao salvar: ' + (res.data && res.data.erro ? res.data.erro : 'desconhecido'), 'error', 'alert');
        }
      });
    });
  }
  P.maskTelefone(document.getElementById('cf-telefone'));
  P.maskTelefone(document.getElementById('cf-whatsapp'));
  P.maskCEP(document.getElementById('cf-cep'));
})();
