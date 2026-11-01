package Pizzaria.UsuarioTeste.controller;

import Pizzaria.UsuarioTeste.model.Funcionario;
import Pizzaria.UsuarioTeste.repository.FuncionarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.regex.Pattern;

import static Pizzaria.UsuarioTeste.util.Util.*;

@RestController
@RequestMapping("/api/funcionario")
public class FuncionarioController {

    // E-mail de funcionário: termina em @PizzariaSabores, @PizzariaSabores.com ou @PizzariaSabores.com.br
    public static final Pattern EMAIL_FUNCIONARIO =
            Pattern.compile("^[\\w.+-]+@pizzariasabores(\\.com(\\.br)?)?$", Pattern.CASE_INSENSITIVE);

    static final String MSG_EMAIL_INVALIDO =
            "Funcionários devem usar o e-mail corporativo @PizzariaSabores";

    // Cada cargo tem a sua página. Para criar um cargo novo, basta uma linha aqui.
    private static final Map<String, String> PAGINAS = Map.of(
            "GERENTE", "/funcionario/gerente.html",
            "ATENDENTE", "/funcionario/atendente.html",
            "COZINHEIRO", "/funcionario/cozinheiro.html");

    public record CadastroRequest(String nome, String email, String telefone,
                                  String senha, String confirmarSenha) {}
    public record LoginRequest(String email, String senha, boolean lembrar) {}

    private final FuncionarioRepository repo;

    public FuncionarioController(FuncionarioRepository repo) {
        this.repo = repo;
    }

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrar(@RequestBody CadastroRequest req) {
        if (vazio(req.nome()) || vazio(req.email()) || vazio(req.telefone()) || vazio(req.senha())) {
            return erro(HttpStatus.BAD_REQUEST, "Preencha todos os campos");
        }
        String email = req.email().trim().toLowerCase();
        if (!EMAIL_FUNCIONARIO.matcher(email).matches()) {
            return erro(HttpStatus.BAD_REQUEST, MSG_EMAIL_INVALIDO);
        }
        if (req.senha().length() < 6) {
            return erro(HttpStatus.BAD_REQUEST, "A senha deve ter no mínimo 6 caracteres");
        }
        if (!req.senha().equals(req.confirmarSenha())) {
            return erro(HttpStatus.BAD_REQUEST, "As senhas não conferem");
        }
        String telefone = soDigitos(req.telefone());
        if (telefone.length() < 10 || telefone.length() > 11) {
            return erro(HttpStatus.BAD_REQUEST, "Telefone inválido (DDD + número)");
        }
        if (repo.findByEmail(email).isPresent()) {
            return erro(HttpStatus.BAD_REQUEST, "E-mail já cadastrado");
        }

        Funcionario f = new Funcionario();
        f.setNome(req.nome().trim());
        f.setEmail(email);
        f.setTelefone(telefone);
        f.setSenha(gerarHash(req.senha()));
        // cargo fica NULL de propósito: só um administrador define
        repo.save(f);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("mensagem", "Email em processamento"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletRequest request) {
        if (vazio(req.email()) || vazio(req.senha())) {
            return erro(HttpStatus.BAD_REQUEST, "Informe e-mail e senha");
        }
        String email = req.email().trim().toLowerCase();
        if (!EMAIL_FUNCIONARIO.matcher(email).matches()) {
            return erro(HttpStatus.BAD_REQUEST, MSG_EMAIL_INVALIDO);
        }

        Funcionario f = repo.findByEmail(email).orElse(null);
        if (f == null || !conferirHash(req.senha(), f.getSenha())) {
            return erro(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos");
        }

        // Só depois de confirmar a senha, para não revelar a estranhos o estado da conta
        if (vazio(f.getCargo())) {
            return erro(HttpStatus.FORBIDDEN, "Email em processamento");
        }
        String cargo = f.getCargo().trim().toUpperCase();
        String pagina = PAGINAS.get(cargo);
        if (pagina == null) {
            return erro(HttpStatus.FORBIDDEN, "Cargo sem página configurada. Procure o administrador.");
        }

        iniciarSessao(request, f.getIdFuncionario(), "FUNCIONARIO", f.getNome(), cargo, pagina, req.lembrar());
        return ResponseEntity.ok(Map.of("redirect", pagina));
    }
}