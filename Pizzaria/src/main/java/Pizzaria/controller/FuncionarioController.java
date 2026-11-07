package Pizzaria.controller;

import Pizzaria.domain.Funcionario;
import Pizzaria.domain.Telefone;
import Pizzaria.service.Service;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

import static Pizzaria.util.Util.*;

/**
 * Login e cadastro de FUNCIONÁRIO (verificações do UsuarioTeste) usando Service -> Repository (JDBC).
 * Aceita /api/funcionario (front antigo) e /api/funcionarios (front novo).
 */
@RestController
@RequestMapping({"/api/funcionario", "/api/funcionarios"})
public class FuncionarioController {

    // E-mail de funcionário: termina em @PizzariaSabores, @PizzariaSabores.com ou @PizzariaSabores.com.br
    public static final Pattern EMAIL_FUNCIONARIO =
            Pattern.compile("^[\\w.+-]+@pizzariasabores(\\.com(\\.br)?)?$", Pattern.CASE_INSENSITIVE);

    static final String MSG_EMAIL_INVALIDO =
            "Funcionários devem usar o e-mail corporativo @PizzariaSabores";

    /**
     * A tabela Funcionario exige cargo (NOT NULL). Quem acaba de se cadastrar fica com este
     * valor e NÃO consegue entrar até um administrador trocar o cargo no banco.
     */
    static final String CARGO_PENDENTE = "PENDENTE";

    /** Cargo do banco (qualquer caixa) -> perfil usado pelo front (CARGO_PAGES do base.js). */
    private static final Map<String, String> CARGO_FRONT = Map.ofEntries(
            Map.entry("GERENTE", "administrador"),
            Map.entry("ADMINISTRADOR", "administrador"),
            Map.entry("ATENDENTE", "balconista"),
            Map.entry("BALCONISTA", "balconista"),
            Map.entry("COZINHEIRO", "pizzaiolo"),
            Map.entry("PIZZAIOLO", "pizzaiolo"));

    /** Primeira página de cada perfil (arquivos REAIS do front). */
    private static final Map<String, String> PAGINAS = Map.of(
            "administrador", "/site/frontend/funcionario/pedidos/pedidos.html",
            "balconista", "/site/frontend/funcionario/pedidos/pedidos.html",
            "pizzaiolo", "/site/frontend/funcionario/pizzas/pizzas.html");

    public record CadastroRequest(String nome, String email, String telefone,
                                  String senha, String confirmarSenha) {}
    public record LoginRequest(String email, String senha, boolean lembrar) {}
    public record AtualizacaoRequest(String nome, String email, String cargo, String telefone) {}

    private static final Set<String> CARGOS_VALIDOS = Set.of(
            "ADMINISTRADOR", "GERENTE", "ATENDENTE", "BALCONISTA",
            "COZINHEIRO", "PIZZAIOLO", CARGO_PENDENTE);

    @PostMapping({"/cadastro", ""})
    public ResponseEntity<?> cadastrar(@RequestBody CadastroRequest req) {
        if (req == null || vazio(req.nome()) || vazio(req.email()) || vazio(req.telefone()) || vazio(req.senha())) {
            return erro(HttpStatus.BAD_REQUEST, "Preencha todos os campos");
        }
        String email = req.email().trim().toLowerCase();
        if (!EMAIL_FUNCIONARIO.matcher(email).matches()) {
            return erro(HttpStatus.BAD_REQUEST, MSG_EMAIL_INVALIDO);
        }
        if (req.senha().length() < 6) {
            return erro(HttpStatus.BAD_REQUEST, "A senha deve ter no mínimo 6 caracteres");
        }
        if (req.confirmarSenha() != null && !req.senha().equals(req.confirmarSenha())) {
            return erro(HttpStatus.BAD_REQUEST, "As senhas não conferem");
        }
        String telefone = soDigitos(req.telefone());
        if (telefone.length() < 10 || telefone.length() > 11) {
            return erro(HttpStatus.BAD_REQUEST, "Telefone inválido (DDD + número)");
        }
        if (!bancoOnline()) return bancoIndisponivel();
        if (Service.findByEmail(Funcionario.class, email).isPresent()) {
            return erro(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }

        Service.save(Funcionario.builder()
                .nome(req.nome().trim())
                .email(email)
                .telefone(telefone)
                .senha(gerarHash(req.senha()))
                .cargo(CARGO_PENDENTE) // só um administrador define o cargo de verdade
                .build());
        Funcionario f = Service.findByEmail(Funcionario.class, email).orElse(null);
        if (f == null) {
            return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Não foi possível salvar o cadastro");
        }
        // DER: Telefone (multivalorado) também guarda o telefone do funcionário
        Service.save(Telefone.builder().numero(telefone).tipo("CELULAR").id_funcionario(f).build());

        Map<String, Object> corpo = new HashMap<>();
        corpo.put("ok", true);
        corpo.put("mensagem", "Email em processamento");
        corpo.put("id", f.getId_funcionario());
        return ResponseEntity.status(HttpStatus.CREATED).body(corpo);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletRequest request) {
        if (req == null || vazio(req.email()) || vazio(req.senha())) {
            return erro(HttpStatus.BAD_REQUEST, "Informe e-mail e senha");
        }
        String email = req.email().trim().toLowerCase();
        if (!EMAIL_FUNCIONARIO.matcher(email).matches()) {
            return erro(HttpStatus.BAD_REQUEST, MSG_EMAIL_INVALIDO);
        }
        if (!bancoOnline()) return bancoIndisponivel();

        Funcionario f = Service.findByEmail(Funcionario.class, email).orElse(null);
        if (f == null || !conferirHash(req.senha(), f.getSenha())) {
            return erro(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos");
        }

        // Só depois de confirmar a senha, para não revelar o estado da conta a estranhos
        String cargoBanco = f.getCargo() == null ? "" : f.getCargo().trim().toUpperCase();
        if (cargoBanco.isEmpty() || CARGO_PENDENTE.equals(cargoBanco)) {
            return erro(HttpStatus.FORBIDDEN, "Email em processamento");
        }
        String cargo = CARGO_FRONT.get(cargoBanco);
        if (cargo == null) {
            return erro(HttpStatus.FORBIDDEN, "Cargo sem página configurada. Procure o administrador.");
        }
        String pagina = PAGINAS.get(cargo);

        iniciarSessao(request, f.getId_funcionario(), "FUNCIONARIO", f.getNome(), cargo,
                pagina, req.lembrar(), f.getEmail(), f.getTelefone(), null);

        Map<String, Object> corpo = new HashMap<>();
        corpo.put("ok", true);
        corpo.put("redirect", pagina);
        Map<String, Object> usuario = new HashMap<>();
        usuario.put("id", f.getId_funcionario());
        usuario.put("nome", f.getNome());
        usuario.put("email", f.getEmail());
        usuario.put("cargo", cargo);
        usuario.put("telefone", f.getTelefone());
        corpo.put("usuario", usuario);
        return ResponseEntity.ok(corpo);
    }

    /** PUT /api/funcionarios/{id} -> atualiza nome, e-mail, cargo e telefone da equipe. */
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Integer id, @RequestBody AtualizacaoRequest req,
                                       HttpSession session) {
        if (!ehFuncionario(session)) return soFuncionario();
        Object cargoSessao = session.getAttribute("cargo");
        if (cargoSessao == null || !"administrador".equalsIgnoreCase(cargoSessao.toString())) {
            return erro(HttpStatus.FORBIDDEN, "Apenas administradores podem editar a equipe");
        }
        if (req == null) return erro(HttpStatus.BAD_REQUEST, "Dados inválidos");
        if (!bancoOnline()) return bancoIndisponivel();

        Funcionario atual = Service.findById(Funcionario.class, id);
        if (atual == null) return erro(HttpStatus.NOT_FOUND, "Funcionário não encontrado");

        String nome = vazio(req.nome()) ? atual.getNome() : req.nome().trim();
        String email = vazio(req.email()) ? atual.getEmail() : req.email().trim().toLowerCase();
        String cargo = vazio(req.cargo()) ? atual.getCargo() : req.cargo().trim().toUpperCase();
        String telefoneAtual = atual.getTelefone() == null ? "" : atual.getTelefone();
        String telefone = vazio(req.telefone()) ? telefoneAtual : soDigitos(req.telefone());

        if (!email.equalsIgnoreCase(atual.getEmail()) && !EMAIL_FUNCIONARIO.matcher(email).matches()) {
            return erro(HttpStatus.BAD_REQUEST, MSG_EMAIL_INVALIDO);
        }
        Funcionario mesmoEmail = Service.findByEmail(Funcionario.class, email).orElse(null);
        if (mesmoEmail != null && !mesmoEmail.getId_funcionario().equals(id)) {
            return erro(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }
        if (!CARGOS_VALIDOS.contains(cargo)) {
            return erro(HttpStatus.BAD_REQUEST, "Cargo inválido");
        }
        if (!telefone.isEmpty() && (telefone.length() < 10 || telefone.length() > 11)) {
            return erro(HttpStatus.BAD_REQUEST, "Telefone inválido (DDD + número)");
        }

        Service.update(Funcionario.builder()
                .id_funcionario(id)
                .nome(nome)
                .email(email)
                .cargo(cargo)
                .senha(atual.getSenha())
                .telefone(telefone)
                .data_admissao(atual.getData_admissao())
                .build());

        if (!telefone.equals(telefoneAtual)) {
            List<Telefone> telefones = Service.findTelefonesByFuncionario(id);
            if (telefones.isEmpty()) {
                Service.save(Telefone.builder().numero(telefone).tipo("CELULAR")
                        .id_funcionario(Funcionario.builder().id_funcionario(id).build()).build());
            } else {
                Telefone existente = telefones.get(0);
                Service.update(Telefone.builder()
                        .id_telefone(existente.getId_telefone())
                        .numero(telefone)
                        .tipo(existente.getTipo() == null ? "CELULAR" : existente.getTipo())
                        .id_funcionario(Funcionario.builder().id_funcionario(id).build())
                        .build());
            }
        }

        Object idSessao = session.getAttribute("id");
        if (idSessao instanceof Integer && ((Integer) idSessao).equals(id)) {
            session.setAttribute("nome", nome);
            session.setAttribute("email", email);
            session.setAttribute("telefone", telefone);
        }

        Map<String, Object> corpo = new HashMap<>();
        corpo.put("ok", true);
        corpo.put("mensagem", "Funcionário atualizado no banco.");
        return ResponseEntity.ok(corpo);
    }

    /** GET /api/funcionarios -> equipe (cargo PENDENTE = "e-mail em processamento"). */
    @GetMapping
    public ResponseEntity<?> listar(HttpSession session) {
        if (!ehFuncionario(session)) return soFuncionario();
        List<Map<String, Object>> linhas = new ArrayList<>();
        for (Funcionario f : Service.findAll(Funcionario.class)) {
            Map<String, Object> linha = new HashMap<>();
            linha.put("id", f.getId_funcionario());
            linha.put("nome", f.getNome());
            linha.put("email", f.getEmail());
            linha.put("cargo", f.getCargo());
            linha.put("telefone", f.getTelefone());
            linha.put("dataAdmissao", f.getData_admissao());
            linhas.add(linha);
        }
        return ResponseEntity.ok(linhas);
    }
}
