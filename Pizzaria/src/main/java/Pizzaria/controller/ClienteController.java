package Pizzaria.controller;

import Pizzaria.domain.Cliente;
import Pizzaria.domain.Endereco;
import Pizzaria.domain.Telefone;
import Pizzaria.repository.ClienteRepository;
import Pizzaria.service.Service;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static Pizzaria.util.Util.*;

/**
 * Login e cadastro de CLIENTE (verificações do UsuarioTeste) ligados ao padrão
 * Service -> Repository -> ClienteRepository/TelefoneRepository/EnderecoRepository (JDBC).
 *
 * Aceita /api/cliente (front antigo UsuarioTest) e /api/clientes (front novo site/frontend).
 */
@RestController
@RequestMapping({"/api/cliente", "/api/clientes"})
public class ClienteController {

    static final String MSG_EMAIL_INVALIDO =
            "E-mails @PizzariaSabores são exclusivos de funcionários. Use o acesso de funcionário.";

    private static final Set<String> TIPOS_TELEFONE = Set.of("CELULAR", "RESIDENCIAL", "COMERCIAL");

    // Página para onde cai o cliente depois do login/cadastro
    static final String PAGINA_CLIENTE = "/site/frontend/cliente/home/home.html";

    private static final DateTimeFormatter DATA_BR = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public record CadastroRequest(String nome, String cpf, String email,
                                  String senha, String confirmarSenha,
                                  String telefone, String tipoTelefone,
                                  String rua, Integer numero, String bairro, String cidade, String cep) {}
    public record LoginRequest(String email, String senha, boolean lembrar) {}
    /** Dados que a página "Minha conta" (cliente/config) envia no PUT. */
    public record AtualizarRequest(String nome, String telefone, String endereco) {}

    @PostMapping({"/cadastro", ""})
    public ResponseEntity<?> cadastrar(@RequestBody CadastroRequest req, HttpServletRequest request) {
        if (req == null || vazio(req.nome()) || vazio(req.cpf()) || vazio(req.email()) || vazio(req.senha())
                || vazio(req.telefone()) || vazio(req.rua()) || req.numero() == null
                || vazio(req.bairro()) || vazio(req.cidade()) || vazio(req.cep())) {
            return erro(HttpStatus.BAD_REQUEST, "Preencha todos os campos");
        }

        String email = req.email().trim().toLowerCase();
        if (!EMAIL_VALIDO.matcher(email).matches()) {
            return erro(HttpStatus.BAD_REQUEST, "E-mail inválido");
        }
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
        if (!bancoOnline()) return bancoIndisponivel();

        // 409 (Conflict): o front trata como "já cadastrado" e mostra a mensagem
        if (Service.findByEmail(Cliente.class, email).isPresent()) {
            return erro(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }
        if (Service.existsByCpf(cpf)) {
            return erro(HttpStatus.CONFLICT, "CPF já cadastrado");
        }

        Service.save(Cliente.builder()
                .nome(req.nome().trim())
                .cpf(cpf)
                .email(email)
                .senha(gerarHash(req.senha()))
                .build());
        Cliente c = Service.findByEmail(Cliente.class, email).orElse(null);
        if (c == null) {
            return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Não foi possível salvar o cadastro");
        }

        Service.save(Telefone.builder()
                .numero(telefone)
                .tipo(tipo)
                .id_cliente(c)
                .build());
        Service.save(Endereco.builder()
                .rua(req.rua().trim())
                .numero(String.valueOf(req.numero()))
                .bairro(req.bairro().trim())
                .cidade(req.cidade().trim())
                .cep(cep)
                .id_cliente(c)
                .build());

        // Se telefone ou endereço não foram gravados, desfaz o cliente (não fica cadastro pela metade)
        if (Service.findTelefonesByCliente(c.getId_cliente()).isEmpty()
                || Service.findEnderecosByCliente(c.getId_cliente()).isEmpty()) {
            Service.findTelefonesByCliente(c.getId_cliente()).forEach(t -> Service.delete(Telefone.class, t.getId_telefone()));
            Service.findEnderecosByCliente(c.getId_cliente()).forEach(e -> Service.delete(Endereco.class, e.getId_endereco()));
            Service.delete(Cliente.class, c.getId_cliente());
            return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Não foi possível salvar o cadastro. Tente novamente");
        }

        // Auto-login apenas no cadastro público. Se um funcionário está criando
        // o cliente pelo painel, a sessão dele precisa continuar ativa.
        boolean criadoPeloPainel = ehFuncionario(request.getSession(false));
        String endereco = req.rua().trim() + ", " + req.numero();
        if (!criadoPeloPainel) {
            iniciarSessao(request, c.getId_cliente(), "CLIENTE", c.getNome(), null,
                    PAGINA_CLIENTE, false, email, telefone, endereco);
        }

        Map<String, Object> corpo = new HashMap<>();
        corpo.put("ok", true);
        corpo.put("mensagem", criadoPeloPainel
                ? "Cliente cadastrado no banco."
                : "Cadastro realizado! Faça login.");
        corpo.put("id", c.getId_cliente());
        if (!criadoPeloPainel) corpo.put("redirect", PAGINA_CLIENTE);
        corpo.put("usuario", usuarioJson(c, telefone, endereco, req.cidade().trim()));
        return ResponseEntity.status(HttpStatus.CREATED).body(corpo);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletRequest request) {
        if (req == null || vazio(req.email()) || vazio(req.senha())) {
            return erro(HttpStatus.BAD_REQUEST, "Informe e-mail e senha");
        }
        String email = req.email().trim().toLowerCase();
        if (FuncionarioController.EMAIL_FUNCIONARIO.matcher(email).matches()) {
            return erro(HttpStatus.BAD_REQUEST, MSG_EMAIL_INVALIDO);
        }
        if (!bancoOnline()) return bancoIndisponivel();

        Cliente c = Service.findByEmail(Cliente.class, email).orElse(null);
        if (c == null || !conferirHash(req.senha(), c.getSenha())) {
            return erro(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos");
        }

        String telefone = telefoneDe(c);
        String endereco = enderecoDe(c);
        iniciarSessao(request, c.getId_cliente(), "CLIENTE", c.getNome(), null,
                PAGINA_CLIENTE, req.lembrar(), c.getEmail(), telefone, endereco);

        Map<String, Object> corpo = new HashMap<>();
        corpo.put("ok", true);
        corpo.put("redirect", PAGINA_CLIENTE);
        corpo.put("usuario", usuarioJson(c, telefone, endereco, cidadeDe(c)));
        return ResponseEntity.ok(corpo);
    }

    /** GET /api/clientes -> tabela "Clientes" do painel (só funcionário logado). */
    @GetMapping
    public ResponseEntity<?> listar(HttpSession session) {
        if (!ehFuncionario(session)) return soFuncionario();
        List<Map<String, Object>> linhas = new ArrayList<>();
        for (Cliente c : Service.findAll(Cliente.class)) {
            Map<String, Object> linha = usuarioJson(c, telefoneDe(c), enderecoDe(c), cidadeDe(c));
            linha.put("bairro", bairroDe(c));
            linha.put("idCliente", c.getId_cliente());
            linha.put("dataCadastro",
                    c.getData_cadastro() == null ? "-" : DATA_BR.format(c.getData_cadastro()));
            linha.put("pedidos", Service.findPedidosByCliente(c.getId_cliente()).size());
            linhas.add(linha);
        }
        return ResponseEntity.ok(linhas);
    }

    /**
     * PUT /api/clientes/{id} -> "Minha conta" do cliente ou edição no painel.
     * Atualiza nome e telefone; o endereço vem como texto ("Rua das Flores, 123").
     * O e-mail NÃO muda aqui: é usado como login e é único.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Integer id, @RequestBody AtualizarRequest req,
                                       HttpSession session) {
        boolean funcionario = ehFuncionario(session);
        boolean dono = session.getAttribute("id") != null
                && "CLIENTE".equals(session.getAttribute("tipo"))
                && id.equals(session.getAttribute("id"));
        // Funcionário pode editar qualquer cliente; cliente só altera a própria conta
        if (!funcionario && !dono) {
            return erro(HttpStatus.FORBIDDEN, "Você só pode alterar sua própria conta");
        }
        if (req == null) {
            return erro(HttpStatus.BAD_REQUEST, "Dados de atualização ausentes");
        }
        if (vazio(req.nome())) {
            return erro(HttpStatus.BAD_REQUEST, "Informe o nome");
        }
        String numero = null;
        if (!vazio(req.telefone())) {
            numero = soDigitos(req.telefone());
            if (numero.length() < 10 || numero.length() > 11) {
                return erro(HttpStatus.BAD_REQUEST, "Telefone inválido (DDD + número)");
            }
        }
        if (!bancoOnline()) return bancoIndisponivel();
        Cliente atual = Service.findById(Cliente.class, id);
        if (atual == null) {
            return erro(HttpStatus.NOT_FOUND, "Cliente não encontrado");
        }

        Service.update(Cliente.builder()
                .id_cliente(id)
                .nome(req.nome().trim())
                .cpf(atual.getCpf())
                .email(atual.getEmail())
                .senha(atual.getSenha())
                .data_cadastro(atual.getData_cadastro())
                .build());

        // Telefone: atualiza o primeiro registro do cliente (ou cria um)
        if (numero != null) {
            Optional<Telefone> existente = Service.findTelefonesByCliente(id).stream().findFirst();
            if (existente.isPresent()) {
                Telefone t = existente.get();
                Service.update(Telefone.builder()
                        .id_telefone(t.getId_telefone())
                        .numero(numero)
                        .tipo(t.getTipo())
                        .id_cliente(t.getId_cliente())
                        .id_funcionario(t.getId_funcionario())
                        .build());
            } else {
                Service.save(Telefone.builder().numero(numero).tipo("CELULAR").id_cliente(atual).build());
            }
        }

        // Endereço: tenta separar "rua, número"; mantém o restante do que já existe
        if (!vazio(req.endereco())) {
            Optional<Endereco> existente = Service.findEnderecosByCliente(id).stream().findFirst();
            if (existente.isPresent()) {
                Endereco e = existente.get();
                String texto = req.endereco().trim();
                String rua = texto;
                String num = e.getNumero();
                int virgula = texto.indexOf(',');
                if (virgula > 0) {
                    rua = texto.substring(0, virgula).trim();
                    String resto = soDigitos(texto.substring(virgula + 1));
                    if (!resto.isEmpty()) num = resto.length() > 10 ? resto.substring(0, 10) : resto;
                }
                Service.update(Endereco.builder()
                        .id_endereco(e.getId_endereco())
                        .rua(rua)
                        .numero(num)
                        .bairro(e.getBairro())
                        .cidade(e.getCidade())
                        .cep(e.getCep())
                        .id_cliente(e.getId_cliente())
                        .build());
            }
        }

        // Mantém a sessão do próprio cliente igual ao banco (o /api/me devolve estes valores).
        // Se quem editou foi um funcionário, a sessão dele não pode ser alterada.
        if (dono) {
            Cliente depois = Service.findById(Cliente.class, id);
            session.setAttribute("nome", req.nome().trim());
            session.setAttribute("telefone", numero != null ? numero : telefoneDe(depois == null ? atual : depois));
            session.setAttribute("endereco", enderecoDe(depois == null ? atual : depois));
        }

        Map<String, Object> corpo = new HashMap<>();
        corpo.put("ok", true);
        corpo.put("mensagem", "Dados atualizados");
        return ResponseEntity.ok(corpo);
    }

    // ---------- helpers ----------

    private static Map<String, Object> usuarioJson(Cliente c, String telefone, String endereco, String cidade) {
        Map<String, Object> u = new HashMap<>();
        u.put("id", c.getId_cliente());
        u.put("idCliente", c.getId_cliente());
        u.put("nome", c.getNome());
        u.put("email", c.getEmail());
        u.put("cpf", c.getCpf());
        u.put("telefone", telefone);
        u.put("endereco", endereco);
        u.put("cidade", cidade);
        return u;
    }

    private static String telefoneDe(Cliente c) {
        return Service.findTelefonesByCliente(c.getId_cliente()).stream()
                .findFirst().map(Telefone::getNumero).orElse(null);
    }

    private static String enderecoDe(Cliente c) {
        return Service.findEnderecosByCliente(c.getId_cliente()).stream()
                .findFirst().map(e -> e.getRua() + ", " + e.getNumero()).orElse(null);
    }

    private static String cidadeDe(Cliente c) {
        return Service.findEnderecosByCliente(c.getId_cliente()).stream()
                .findFirst().map(Endereco::getCidade).orElse(null);
    }

    private static String bairroDe(Cliente c) {
        return Service.findEnderecosByCliente(c.getId_cliente()).stream()
                .findFirst().map(Endereco::getBairro).orElse(null);
    }
}
