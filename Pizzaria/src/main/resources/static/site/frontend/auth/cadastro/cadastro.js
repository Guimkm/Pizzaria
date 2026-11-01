/* ============================================================
   PIZZARIA SABORES ITALIANO - Cadastro
   Cadastro de cliente apenas.
   ============================================================ */
(function () {
  'use strict';

  var P = window.Pizzaria;
  var formCad = document.getElementById('form-cadastro');

  /* Botoes olho: mostram / escondem as senhas */
  Array.prototype.forEach.call(document.querySelectorAll('[data-eye]'), function (btn) {
    btn.addEventListener('click', function () {
      var input = document.getElementById(btn.getAttribute('data-eye'));
      if (!input) return;
      var mostrar = input.type === 'password';
      input.type = mostrar ? 'text' : 'password';
      btn.classList.toggle('showing', mostrar);
      btn.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
      var use = btn.querySelector('use');
      if (use) use.setAttribute('href', mostrar ? '#eye' : '#eye-off');
      input.focus();
    });
  });

  if (formCad) {
    formCad.addEventListener('submit', function (ev) {
      ev.preventDefault();

      var nome = document.getElementById('cad-nome').value.trim();
      var telefone = document.getElementById('cad-telefone').value.trim();
      var endereco = document.getElementById('cad-endereco').value.trim();
      var email = document.getElementById('cad-email').value.trim();
      var senha = document.getElementById('cad-senha').value;
      var senha2 = document.getElementById('cad-senha2').value;
      var err = document.getElementById('cad-erro');

      if (err) err.classList.remove('show');

      var problema = null;
      if (!nome) problema = 'Informe seu nome completo.';
      else if (!telefone) problema = 'Informe seu telefone.';
      else if (!endereco) problema = 'Informe seu endereço de entrega.';
      else if (!email) problema = 'Informe seu e-mail.';
      else if (senha.length < 4) problema = 'A senha precisa ter pelo menos 4 caracteres.';
      else if (senha !== senha2) problema = 'As senhas não coincidem.';

      if (problema) {
        if (err) {
          err.textContent = problema;
          err.classList.add('show');
        }
        return;
      }

      var btn = formCad.querySelector('button[type="submit"]');
      btn.disabled = true;
      P.register({
        perfil: 'cliente',
        nome: nome,
        telefone: telefone,
        endereco: endereco,
        email: email,
        senha: senha,
      }).then(function (res) {
        btn.disabled = false;
        if (res.ok) {
          P.setSession(res.data);
          P.toast('Conta criada! Bem-vindo, ' + res.data.nome + '!', 'success');
          setTimeout(function () {
            location.href = '../../cliente/home/home.html';
          }, 900);
        } else if (res.status === 409) {
          if (err) {
            err.textContent = (res.data && res.data.erro) || 'E-mail já cadastrado.';
            err.classList.add('show');
          }
        } else {
          if (err) {
            err.textContent = (res.data && res.data.erro) || 'Não foi possível criar a conta.';
            err.classList.add('show');
          }
        }
      });
    });
  }
})();