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

  /* Mascaras (telefone e CEP vem do base.js; CPF e local) */
  P.maskTelefone(document.getElementById('cad-telefone'));
  P.maskCEP(document.getElementById('cad-cep'));
  var cpfInput = document.getElementById('cad-cpf');
  if (cpfInput) {
    cpfInput.addEventListener('input', function () {
      var d = cpfInput.value.replace(/\D/g, '').slice(0, 11);
      if (d.length > 9) d = d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6, 9) + '-' + d.slice(9);
      else if (d.length > 6) d = d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6);
      else if (d.length > 3) d = d.slice(0, 3) + '.' + d.slice(3);
      cpfInput.value = d;
    });
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }
  function digitos(v) { return String(v || '').replace(/\D/g, ''); }

  /* Mesmas regras que o servidor aplica (ClienteController.cadastrar) */
  function validar(d) {
    if (!d.nome || !d.cpf || !d.telefone || !d.rua || !d.numero || !d.bairro ||
        !d.cidade || !d.cep || !d.email || !d.senha) return 'Preencha todos os campos.';
    if (!/^[\w.+-]+@[\w-]+(\.[\w-]+)*$/.test(d.email)) return 'E-mail inválido.';
    if (/@pizzariasabores(\.com(\.br)?)?$/i.test(d.email)) {
      return 'E-mails @PizzariaSabores são exclusivos de funcionários. Use o acesso de funcionário.';
    }
    if (d.senha.length < 6) return 'A senha deve ter no mínimo 6 caracteres.';
    if (d.senha !== d.confirmarSenha) return 'As senhas não coincidem.';
    if (digitos(d.cpf).length !== 11) return 'CPF deve ter 11 dígitos.';
    var tel = digitos(d.telefone);
    if (tel.length < 10 || tel.length > 11) return 'Telefone inválido (DDD + número).';
    if (digitos(d.cep).length !== 8) return 'CEP deve ter 8 dígitos.';
    if (!(parseInt(d.numero, 10) > 0)) return 'Número do endereço inválido.';
    return null;
  }

  if (formCad) {
    formCad.addEventListener('submit', function (ev) {
      ev.preventDefault();

      var err = document.getElementById('cad-erro');
      if (err) err.classList.remove('show');

      var dados = {
        nome: val('cad-nome'),
        cpf: digitos(val('cad-cpf')),
        telefone: val('cad-telefone'),
        tipoTelefone: val('cad-tipo-tel') || 'CELULAR',
        rua: val('cad-rua'),
        numero: val('cad-numero'),
        bairro: val('cad-bairro'),
        cidade: val('cad-cidade'),
        cep: digitos(val('cad-cep')),
        email: val('cad-email'),
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
        perfil: 'cliente',
        nome: dados.nome,
        cpf: dados.cpf,
        telefone: dados.telefone,
        tipoTelefone: dados.tipoTelefone,
        rua: dados.rua,
        numero: parseInt(dados.numero, 10),
        bairro: dados.bairro,
        cidade: dados.cidade,
        cep: dados.cep,
        endereco: dados.rua + ', ' + parseInt(dados.numero, 10),
        email: dados.email,
        senha: dados.senha,
        confirmarSenha: dados.confirmarSenha,
      }).then(function (res) {
        btn.disabled = false;
        if (res.ok) {
          P.setSession(res.data);
          P.toast('Conta criada! Bem-vindo, ' + res.data.nome + '!', 'success');
          setTimeout(function () {
            location.href = '../../cliente/home/home.html';
          }, 900);
        } else {
          if (err) {
            err.textContent = (res.data && res.data.erro) ||
              (res.status === 409 ? 'E-mail ou CPF já cadastrado.' : 'Não foi possível criar a conta.');
            err.classList.add('show');
          }
        }
      });
    });
  }
})();
