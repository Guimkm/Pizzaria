package Pizzaria.UsuarioTeste.controller;

import Pizzaria.UsuarioTeste.model.Cliente;
import Pizzaria.UsuarioTeste.model.Endereco;
import Pizzaria.UsuarioTeste.model.Telefone;
import Pizzaria.UsuarioTeste.repository.ClienteRepository;
import Pizzaria.UsuarioTeste.repository.EnderecoRepository;
import Pizzaria.UsuarioTeste.repository.TelefoneRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

import static Pizzaria.UsuarioTeste.util.Util.*;

@RestController
@RequestMapping("/api/cliente")
public class ClienteController {

    static final String MSG_EMAIL_INVALIDO =
            "E-mails @PizzariaSabores são exclusivos de funcionários. Use o acesso de funcionário.";

    private static final Set<String> TIPOS_TELEFONE = Set.of("CELULAR", "RESIDENCIAL", "COMERCIAL");

    public record CadastroRequest(String nome, String cpf, String email,
                                  String senha, String confirmarSenha,
                                  String telefone, String tipoTelefone,
                                  String rua, Integer numero, String bairro, String cidade, String cep) {}
    public record LoginRequest(String email, String senha, boolean lembrar) {}

    private final ClienteRepository clientes;
    private final EnderecoRepository enderecos;
    private final TelefoneRepository telefones;

    public ClienteController(ClienteRepository clientes, EnderecoRepository enderecos,
                             TelefoneRepository telefones) {
        this.clientes = clientes;
        this.enderecos = enderecos;
        this.telefones = telefones;
    }

    // @Transactional: se algo falhar no meio, nada é salvo pela metade
    @PostMapping("/cadastro")
    @Transactional
    public ResponseEntity<?> cadastrar(@RequestBody CadastroRequest req) {
        if (vazio(req.nome()) || vazio(req.cpf()) || vazio(req.email()) || vazio(req.senha())
                || vazio(req.telefone()) || vazio(req.rua()) || req.numero() == null
                || vazio(req.bairro()) || vazio(req.cidade()) || vazio(req.cep())) {
            return erro(HttpStatus.BAD_REQUEST, "Preencha todos os campos");
        }

        String email = req.email().trim().toLowerCase();
        if (FuncionarioController.EMAIL_FUNCIONARIO.matcher(email).matches()) {
            return erro(HttpStatus.BAD_REQUEST, MSG_EMAIL_INVALIDO);
        }
        if (req.senha().length() < 6) {
            return erro(HttpStatus.BAD_REQUEST, "A senha deve ter no mínimo 6 caracteres");
        }
        if (!req.senha().equals(req.confirmarSenha())) {
            return erro(HttpStatus.BAD_REQUEST, "As senhas não conferem");
        }

        String cpf = soDigitos(req.cpf());
        if (cpf.length() != 11) {
            return erro(HttpStatus.BAD_REQUEST, "CPF deve ter 11 dígitos");
        }
        String telefone = soDigitos(req.telefone());
        if (telefone.length() < 10 || telefone.length() > 11) {
            return erro(HttpStatus.BAD_REQUEST, "Telefone inválido (DDD + número)");
        }
        String tipo = req.tipoTelefone() == null ? "" : req.tipoTelefone().toUpperCase();
        if (!TIPOS_TELEFONE.contains(tipo)) {
            return erro(HttpStatus.BAD_REQUEST, "Tipo de telefone inválido");
        }
        String cep = soDigitos(req.cep());
        if (cep.length() != 8) {
            return erro(HttpStatus.BAD_REQUEST, "CEP deve ter 8 dígitos");
        }
        if (req.numero() <= 0) {
            return erro(HttpStatus.BAD_REQUEST, "Número do endereço inválido");
        }
        if (clientes.findByEmail(email).isPresent()) {
            return erro(HttpStatus.BAD_REQUEST, "E-mail já cadastrado");
        }
        if (clientes.existsByCpf(cpf)) {
            return erro(HttpStatus.BAD_REQUEST, "CPF já cadastrado");
        }

        Cliente c = new Cliente();
        c.setNome(req.nome().trim());
        c.setCpf(cpf);
        c.setEmail(email);
        c.setSenha(gerarHash(req.senha()));
        clientes.save(c);

        Telefone t = new Telefone();
        t.setNumero(telefone);
        t.setTipo(tipo);
        t.setCliente(c);
        telefones.save(t);

        Endereco e = new Endereco();
        e.setRua(req.rua().trim());
        e.setNumero(req.numero());
        e.setBairro(req.bairro().trim());
        e.setCidade(req.cidade().trim());
        e.setCep(cep);
        e.setCliente(c);
        enderecos.save(e);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("mensagem", "Cadastro realizado! Faça login."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletRequest request) {
        if (vazio(req.email()) || vazio(req.senha())) {
            return erro(HttpStatus.BAD_REQUEST, "Informe e-mail e senha");
        }
        String email = req.email().trim().toLowerCase();
        if (FuncionarioController.EMAIL_FUNCIONARIO.matcher(email).matches()) {
            return erro(HttpStatus.BAD_REQUEST, MSG_EMAIL_INVALIDO);
        }

        Cliente c = clientes.findByEmail(email).orElse(null);
        if (c == null || !conferirHash(req.senha(), c.getSenha())) {
            return erro(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos");
        }

        String pagina = "/cliente/home.html";
        iniciarSessao(request, c.getIdCliente(), "CLIENTE", c.getNome(), null, pagina, req.lembrar());
        return ResponseEntity.ok(Map.of("redirect", pagina));
    }
}