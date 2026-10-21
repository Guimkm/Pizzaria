package Pizzaria.UsuarioTeste.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SessaoController {

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpSession session) {
        if (session.getAttribute("id") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Map<String, Object> dados = new HashMap<>(); // HashMap porque o cargo pode ser nulo (cliente)
        dados.put("tipo", session.getAttribute("tipo"));
        dados.put("nome", session.getAttribute("nome"));
        dados.put("cargo", session.getAttribute("cargo"));
        dados.put("pagina", session.getAttribute("pagina"));
        return ResponseEntity.ok(dados);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("mensagem", "Sessão encerrada"));
    }
}