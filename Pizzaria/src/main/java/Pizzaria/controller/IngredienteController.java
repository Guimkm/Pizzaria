package Pizzaria.controller;

import Pizzaria.domain.Ingrediente;
import Pizzaria.service.Service;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static Pizzaria.util.Util.*;

/**
 * Edição de ingredientes/estoque pelo painel do funcionário.
 * A listagem (GET /api/estoque) fica no SiteController.
 */
@RestController
@RequestMapping("/api/estoque")
public class IngredienteController {

    public record EstoqueRequest(String nome, Double precoUnitario,
                                 Double quantidade, String unidade) {}

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody EstoqueRequest req, HttpSession session) {
        if (!ehFuncionario(session)) return soFuncionario();
        if (req == null || vazio(req.nome()) || vazio(req.unidade())) {
            return erro(HttpStatus.BAD_REQUEST, "Informe nome e unidade");
        }
        if (req.precoUnitario() == null || req.precoUnitario() < 0) {
            return erro(HttpStatus.BAD_REQUEST, "Preço inválido");
        }
        if (req.quantidade() == null || req.quantidade() < 0) {
            return erro(HttpStatus.BAD_REQUEST, "Quantidade inválida");
        }
        String unidade = req.unidade().trim();
        if (unidade.length() > 10) {
            return erro(HttpStatus.BAD_REQUEST, "Unidade deve ter no máximo 10 caracteres");
        }
        if (!bancoOnline()) return bancoIndisponivel();

        Service.save(Ingrediente.builder()
                .nome(req.nome().trim())
                .preco_unitario(req.precoUnitario())
                .quantidade(req.quantidade())
                .unidade(unidade)
                .build());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(java.util.Map.of("ok", true, "mensagem", "Ingrediente cadastrado"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Integer id, @RequestBody EstoqueRequest req,
                                       HttpSession session) {
        if (!ehFuncionario(session)) return soFuncionario();
        if (req == null || vazio(req.nome()) || vazio(req.unidade())) {
            return erro(HttpStatus.BAD_REQUEST, "Informe nome e unidade");
        }
        if (req.precoUnitario() == null || req.precoUnitario() < 0) {
            return erro(HttpStatus.BAD_REQUEST, "Preço inválido");
        }
        if (req.quantidade() == null || req.quantidade() < 0) {
            return erro(HttpStatus.BAD_REQUEST, "Quantidade inválida");
        }
        if (!bancoOnline()) return bancoIndisponivel();

        Ingrediente atual = Service.findById(Ingrediente.class, id);
        if (atual == null) {
            return erro(HttpStatus.NOT_FOUND, "Ingrediente não encontrado");
        }

        String nome = req.nome().trim();
        String unidade = req.unidade().trim();
        if (unidade.length() > 10) {
            return erro(HttpStatus.BAD_REQUEST, "Unidade deve ter no máximo 10 caracteres");
        }

        Service.update(Ingrediente.builder()
                .id_ingrediente(id)
                .nome(nome)
                .preco_unitario(req.precoUnitario())
                .quantidade(req.quantidade())
                .unidade(unidade)
                .build());

        Ingrediente depois = Service.findById(Ingrediente.class, id);
        boolean gravou = depois != null
                && nome.equals(depois.getNome())
                && Double.compare(req.precoUnitario(), depois.getPreco_unitario() == null ? -1 : depois.getPreco_unitario()) == 0
                && Double.compare(req.quantidade(), depois.getQuantidade() == null ? -1 : depois.getQuantidade()) == 0
                && unidade.equals(depois.getUnidade());
        if (!gravou) {
            return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Não foi possível salvar o ingrediente");
        }

        return ResponseEntity.ok(java.util.Map.of("ok", true, "mensagem", "Estoque atualizado"));
    }
}
