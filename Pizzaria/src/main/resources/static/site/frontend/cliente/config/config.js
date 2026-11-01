/* ============================================================
   PIZZARIA SABORES ITALIANO - Configuracoes do cliente
   Mantem os ids: cfg-nome, cfg-telefone, cfg-email, cfg-endereco,
   form-cliente-config + dados da loja (#config-preview, data-config)
   ============================================================ */
(function () {
  'use strict';

  var P = window.Pizzaria;
  var c = P.getClient();
  document.getElementById('cfg-nome').value = c.nome;
  document.getElementById('cfg-telefone').value = c.telefone;
  document.getElementById('cfg-endereco').value = c.endereco;
  document.getElementById('cfg-email').value = c.email;
  P.maskTelefone(document.getElementById('cfg-telefone'));

  /* Preenche os campos data-config e o card #config-preview
     (nomePizzaria, slogan, endereco, cidade, cep, telefone,
      whatsapp, horario, taxaEntrega) */
  P.loadConfig().then(function () {
    P.applyConfig();
  });

  var formCfg = document.getElementById('form-cliente-config');
  if (formCfg) {
    formCfg.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var novo = {
        id: c.id,
        nome: document.getElementById('cfg-nome').value.trim(),
        telefone: document.getElementById('cfg-telefone').value.trim(),
        endereco: document.getElementById('cfg-endereco').value.trim(),
        email: document.getElementById('cfg-email').value.trim(),
      };
      P.setClient(novo);
      P.Api.send('PUT', 'api/clientes/' + novo.id, novo).then(function (res) {
        if (res.ok) {
          P.toast('Dados atualizados com sucesso!', 'success');
        } else if (res.status === 0) {
          P.toast('Dados salvos no navegador (modo demonstração)', 'info', 'info');
        } else {
          P.toast('Salvo localmente. Erro no servidor: ' + (res.data && res.data.erro ? res.data.erro : 'desconhecido'), 'error', 'alert');
        }
      });
    });
  }
})();
