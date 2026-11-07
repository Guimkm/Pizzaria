package Pizzaria.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SessaoController {

    /**
     * GET /api/me -> sessão do servidor. O front (base.js) usa para confirmar que o
     * login ainda é válido; se a sessão expirou o navegador volta para o login.
     */
    @GetMapping("/me")
    public ResponseEntity<?> me(HttpSession session) {
        if (session.getAttribute("id") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Map<String, Object> dados = new HashMap<>(); // HashMap: cargo é nulo para cliente
        dados.put("id", session.getAttribute("id"));
        dados.put("tipo", session.getAttribute("tipo"));
        dados.put("nome", session.getAttribute("nome"));
        dados.put("cargo", session.getAttribute("cargo"));
        dados.put("pagina", session.getAttribute("pagina"));
        dados.put("email", session.getAttribute("email"));
        dados.put("telefone", session.getAttribute("telefone"));
        dados.put("endereco", session.getAttribute("endereco"));
        return ResponseEntity.ok(dados);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("mensagem", "Sessão encerrada"));
    }
}
