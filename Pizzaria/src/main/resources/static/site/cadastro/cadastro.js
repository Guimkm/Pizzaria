/* ============================================================
   PIZZARIA SABORES ITALIANO - Cadastro
   Cadastro de cliente e de funcionario (perfil via abas).
   ============================================================ */
(function () {
  'use strict';

  var P = window.Pizzaria;
  var formCad = document.getElementById('form-cadastro');

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.role-tab'));
  var perfil = (window.location.search.match(/perfil=(\w+)/) || [])[1] || 'cliente';
  if (perfil !== 'funcionario') perfil = 'cliente';

  function setPerfil(p) {
    perfil = p;
    tabs.forEach(function (t) {
      t.classList.toggle('active', t.getAttribute('data-role') === p);
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-fields]'), function (el) {
      el.style.display = el.getAttribute('data-fields') === p ? '' : 'none';
    });
    var sub = document.querySelector('[data-cad-sub]');
    var hint = document.querySelector('[data-cad-hint]');
    if (sub) sub.textContent = p === 'funcionario' ? 'Cadastro de Funcionário' : 'Cadastro de Cliente';
    if (hint) hint.textContent = p === 'funcionario' ? 'Acesso ao sistema de gerenciamento' : 'Preencha seus dados para começar a pedir';
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      setPerfil(t.getAttribute('data-role'));
    });
  });

  setPerfil(perfil);

  P.maskTelefone(document.getElementById('cad-telefone'));

  if (formCad) {
    formCad.addEventListener('submit', function (ev) {
      ev.preventDefault();

      var email = document.getElementById('cad-email').value.trim();
      var senha = document.getElementById('cad-senha').value;
      var senha2 = document.getElementById('cad-senha2').value;
      var err = document.getElementById('cad-erro');

      var nome, telefone, endereco, cargo;
      if (perfil === 'funcionario') {
        nome = document.getElementById('cad-func-nome').value.trim();
        cargo = document.getElementById('cad-func-cargo').value;
      } else {
        nome = document.getElementById('cad-nome').value.trim();
        telefone = document.getElementById('cad-telefone').value.trim();
        endereco = document.getElementById('cad-endereco').value.trim();
      }

      if (err) err.classList.remove('show');

      var problema = null;
      if (!nome) problema = 'Informe seu nome completo.';
      else if (!email) problema = 'Informe seu e-mail.';
      else if (senha.length < 4) problema = 'A senha precisa ter pelo menos 4 caracteres.';
      else if (senha !== senha2) problema = 'As senhas não coincidem.';
      else if (perfil === 'cliente' && !telefone) problema = 'Informe seu telefone.';
      else if (perfil === 'cliente' && !endereco) problema = 'Informe seu endereço de entrega.';

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
        perfil: perfil,
        nome: nome,
        telefone: telefone,
        endereco: endereco,
        cargo: cargo,
        email: email,
        senha: senha,
      }).then(function (res) {
        btn.disabled = false;
        if (res.ok) {
          P.setSession(res.data);
          P.toast('Conta criada! Bem-vindo, ' + res.data.nome + '!', 'success');
          setTimeout(function () {
            location.href = perfil === 'funcionario'
              ? '../funcionario/clientes/clientes.html'
              : '../cliente/home/home.html';
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
