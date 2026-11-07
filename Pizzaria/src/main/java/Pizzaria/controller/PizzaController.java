package Pizzaria.controller;

import Pizzaria.domain.Categoria;
import Pizzaria.domain.Pizza;
import Pizzaria.service.Service;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

import static Pizzaria.util.Util.*;

/**
 * Edição do cardápio pelo painel do funcionário.
 * A listagem (GET /api/pizzas) fica no SiteController.
 */
@RestController
@RequestMapping("/api/pizzas")
public class PizzaController {

    private static final Set<String> TAMANHOS = Set.of("P", "M", "G", "U");

    public record PizzaRequest(String nome, String descricao, String tamanho,
                               Double preco, Boolean ativa, Integer idCategoria) {}

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody PizzaRequest req, HttpSession session) {
        if (!ehFuncionario(session)) return soFuncionario();
        if (req == null || vazio(req.nome()) || vazio(req.tamanho()) || req.idCategoria() == null) {
            return erro(HttpStatus.BAD_REQUEST, "Informe nome, tamanho e categoria");
        }
        String tamanho = req.tamanho().trim().toUpperCase();
        if (!TAMANHOS.contains(tamanho)) {
            return erro(HttpStatus.BAD_REQUEST, "Tamanho inválido (use P, M, G ou U)");
        }
        if (req.preco() == null || req.preco() < 0) {
            return erro(HttpStatus.BAD_REQUEST, "Preço inválido");
        }
        if (!bancoOnline()) return bancoIndisponivel();

        Categoria categoria = Service.findById(Categoria.class, req.idCategoria());
        if (categoria == null) {
            return erro(HttpStatus.BAD_REQUEST, "Categoria inválida");
        }

        Service.save(Pizza.builder()
                .nome(req.nome().trim())
                .descricao(vazio(req.descricao()) ? null : req.descricao().trim())
                .tamanho(tamanho)
                .preco(req.preco())
                .ativa(req.ativa() == null ? Boolean.TRUE : req.ativa())
                .id_categoria(categoria)
                .build());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(java.util.Map.of("ok", true, "mensagem", "Pizza cadastrada"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Integer id, @RequestBody PizzaRequest req,
                                       HttpSession session) {
        if (!ehFuncionario(session)) return soFuncionario();
        if (req == null || vazio(req.nome()) || vazio(req.tamanho()) || req.idCategoria() == null) {
            return erro(HttpStatus.BAD_REQUEST, "Informe nome, tamanho e categoria");
        }
        String tamanho = req.tamanho().trim().toUpperCase();
        if (!TAMANHOS.contains(tamanho)) {
            return erro(HttpStatus.BAD_REQUEST, "Tamanho inválido (use P, M, G ou U)");
        }
        if (req.preco() == null || req.preco() < 0) {
            return erro(HttpStatus.BAD_REQUEST, "Preço inválido");
        }
        if (!bancoOnline()) return bancoIndisponivel();

        Pizza atual = Service.findById(Pizza.class, id);
        if (atual == null) {
            return erro(HttpStatus.NOT_FOUND, "Pizza não encontrada");
        }
        Categoria categoria = Service.findById(Categoria.class, req.idCategoria());
        if (categoria == null) {
            return erro(HttpStatus.BAD_REQUEST, "Categoria inválida");
        }

        String nome = req.nome().trim();
        Boolean ativa = req.ativa() == null ? atual.getAtiva() : req.ativa();
        Service.update(Pizza.builder()
                .id_pizza(id)
                .nome(nome)
                .descricao(vazio(req.descricao()) ? null : req.descricao().trim())
                .tamanho(tamanho)
                .preco(req.preco())
                .ativa(ativa)
                .id_categoria(categoria)
                .build());

        // Confirma no banco que a alteração foi gravada
        Pizza depois = Service.findById(Pizza.class, id);
        boolean gravou = depois != null
                && nome.equals(depois.getNome())
                && tamanho.equals(depois.getTamanho())
                && Double.compare(req.preco(), depois.getPreco() == null ? -1 : depois.getPreco()) == 0
                && java.util.Objects.equals(ativa, depois.getAtiva())
                && categoria.getId_categoria().equals(depois.getId_categoria() == null
                        ? null : depois.getId_categoria().getId_categoria());
        if (!gravou) {
            return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Não foi possível salvar a pizza");
        }

        return ResponseEntity.ok(java.util.Map.of("ok", true, "mensagem", "Pizza atualizada"));
    }
}
