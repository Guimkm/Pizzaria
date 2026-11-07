/* ============================================================
   PIZZARIA SABORES ITALIANO - Cadastro de Funcionário
   Cadastro da equipe: fica pendente até um administrador liberar o cargo.
   ============================================================ */
(function () {
  'use strict';

  var P = window.Pizzaria;
  var formCad = document.getElementById('form-cadastro');
  var err = document.getElementById('cad-erro');
  var sucesso = document.getElementById('cad-sucesso');

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

  P.maskTelefone(document.getElementById('cad-telefone'));

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }
  function digitos(v) { return String(v || '').replace(/\D/g, ''); }

  /* Mesmas regras que o servidor aplica (FuncionarioController.cadastrar) */
  function validar(d) {
    if (!d.nome || !d.email || !d.telefone || !d.senha) return 'Preencha todos os campos.';
    if (!/^[\w.+-]+@[\w-]+(\.[\w-]+)*$/.test(d.email)) return 'E-mail inválido.';
    if (!document.body.classList.contains('demo') &&
        !/@pizzariasabores(\.com(\.br)?)?$/i.test(d.email)) {
      return 'Funcionários devem usar o e-mail corporativo @PizzariaSabores.';
    }
    if (d.senha.length < 6) return 'A senha deve ter no mínimo 6 caracteres.';
    if (d.senha !== d.confirmarSenha) return 'As senhas não coincidem.';
    var tel = digitos(d.telefone);
    if (tel.length < 10 || tel.length > 11) return 'Telefone inválido (DDD + número).';
    return null;
  }

  if (formCad) {
    formCad.addEventListener('submit', function (ev) {
      ev.preventDefault();

      if (err) err.classList.remove('show');
      if (sucesso) sucesso.classList.remove('show');

      var dados = {
        nome: val('cad-nome'),
        email: val('cad-email'),
        telefone: val('cad-telefone'),
        senha: document.getElementById('cad-senha').value,
        confirmarSenha: document.getElementById('cad-senha2').value,
      };

      var problema = validar(dados);
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
        perfil: 'funcionario',
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone,
        senha: dados.senha,
        confirmarSenha: dados.confirmarSenha,
      }).then(function (res) {
        btn.disabled = false;
        if (res.ok) {
          if (sucesso) {
            sucesso.textContent =
              'Cadastro enviado! Aguarde a liberação do cargo por um administrador para entrar.';
            sucesso.classList.add('show');
          }
          P.toast('Cadastro enviado para análise.', 'success');
          setTimeout(function () {
            location.href = 'login.html';
          }, 2600);
        } else {
          if (err) {
            err.textContent = (res.data && res.data.erro) ||
              (res.status === 409 ? 'E-mail já cadastrado.' : 'Não foi possível concluir o cadastro.');
            err.classList.add('show');
          }
        }
      });
    });
  }
})();
