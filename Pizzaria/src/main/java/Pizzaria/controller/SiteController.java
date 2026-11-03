package Pizzaria.controller;

import Pizzaria.connection.ConnectionFactory;
import Pizzaria.domain.Categoria;
import Pizzaria.domain.Cliente;
import Pizzaria.domain.Funcionario;
import Pizzaria.domain.Ingrediente;
import Pizzaria.domain.Pedido;
import Pizzaria.domain.Pizza;
import Pizzaria.service.Service;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static Pizzaria.util.Util.ehFuncionario;
import static Pizzaria.util.Util.soFuncionario;

/**
 * Endpoints de leitura usados pelo front (site/frontend/assets/js/base.js).
 * Sempre em caminho absoluto (/api/...), a partir de qualquer pasta do site.
 */
@RestController
@RequestMapping("/api")
public class SiteController {

    /** GET /api/health -> {database: true|false}; o base.js usa para entrar (ou não) em modo demonstração. */
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        boolean bancoOk = ConnectionFactory.estaOnline();
        return ResponseEntity.ok(Map.of(
                "database", bancoOk,
                "status", bancoOk ? "ok" : "sem banco de dados"));
    }

    /** GET /api/config -> dados da loja exibidos pelo front (ainda não há tabela de configuração). */
    @GetMapping("/config")
    public ResponseEntity<?> config() {
        Map<String, Object> cfg = new LinkedHashMap<>();
        cfg.put("nomePizzaria", "Pizzaria Sabores Italiano");
        cfg.put("slogan", "A verdadeira pizza artesanal");
        cfg.put("endereco", "Rua das Flores, 123");
        cfg.put("cidade", "Sao Paulo, SP");
        cfg.put("cep", "01310-100");
        cfg.put("telefone", "(11) 3456-7890");
        cfg.put("whatsapp", "(11) 99999-1234");
        cfg.put("horario", "Ter a Dom, 18h as 23h");
        cfg.put("taxaEntrega", 8.90);
        return ResponseEntity.ok(cfg);
    }

    /** GET /api/pizzas -> cardápio real do banco (campos de RENDER.pizzas do base.js). */
    @GetMapping("/pizzas")
    public ResponseEntity<?> listarPizzas() {
        List<Map<String, Object>> linhas = new ArrayList<>();
        for (Pizza p : Service.findAll(Pizza.class)) {
            Map<String, Object> linha = new HashMap<>();
            linha.put("idPizza", p.getId_pizza());
            linha.put("nome", p.getNome());
            linha.put("descricao", p.getDescricao());
            // Categoria vem só com o id no Pizza; o nome é buscado em Categoria
            Integer idCat = p.getId_categoria() == null ? null : p.getId_categoria().getId_categoria();
            Categoria cat = idCat == null ? null : Service.findById(Categoria.class, idCat);
            linha.put("idCategoria", idCat);
            linha.put("categoria", cat == null ? null : cat.getNome_categoria());
            linha.put("tamanho", p.getTamanho());
            linha.put("preco", p.getPreco());
            linha.put("ativa", p.getAtiva());
            linha.put("ingredientes", p.getIngredientes() == null ? List.of()
                    : p.getIngredientes().stream().map(Ingrediente::getNome).toList());
            linhas.add(linha);
        }
        return ResponseEntity.ok(linhas);
    }

    /** GET /api/categorias -> opções do editor de pizzas (só funcionário logado). */
    @GetMapping("/categorias")
    public ResponseEntity<?> listarCategorias(HttpSession session) {
        if (!ehFuncionario(session)) return soFuncionario();
        List<Map<String, Object>> linhas = new ArrayList<>();
        for (Categoria c : Service.findAll(Categoria.class)) {
            Map<String, Object> linha = new HashMap<>();
            linha.put("idCategoria", c.getId_categoria());
            linha.put("nome", c.getNome_categoria());
            linhas.add(linha);
        }
        return ResponseEntity.ok(linhas);
    }

    /** GET /api/estoque -> ingredientes (só funcionário logado). */
    @GetMapping("/estoque")
    public ResponseEntity<?> listarEstoque(HttpSession session) {
        if (!ehFuncionario(session)) return soFuncionario();
        List<Map<String, Object>> linhas = new ArrayList<>();
        for (Ingrediente i : Service.findAll(Ingrediente.class)) {
            Map<String, Object> linha = new HashMap<>();
            linha.put("idIngrediente", i.getId_ingrediente());
            linha.put("nome", i.getNome());
            linha.put("precoUnitario", i.getPreco_unitario());
            linha.put("quantidade", i.getQuantidade());
            linha.put("unidade", i.getUnidade());
            linhas.add(linha);
        }
        return ResponseEntity.ok(linhas);
    }

    /** GET /api/pedidos -> pedidos com cliente e funcionário resolvidos (só funcionário logado). */
    @GetMapping("/pedidos")
    public ResponseEntity<?> listarPedidos(HttpSession session) {
        if (!ehFuncionario(session)) return soFuncionario();
        List<Map<String, Object>> linhas = new ArrayList<>();
        for (Pedido p : Service.findAll(Pedido.class)) {
            Cliente c = p.getId_cliente() == null ? null
                    : Service.findById(Cliente.class, p.getId_cliente().getId_cliente());
            Funcionario f = p.getId_funcionario() == null ? null
                    : Service.findById(Funcionario.class, p.getId_funcionario().getId_funcionario());
            Map<String, Object> linha = new HashMap<>();
            linha.put("idPedido", p.getId_pedido());
            linha.put("cliente", c == null ? null : c.getNome());
            linha.put("email", c == null ? null : c.getEmail());
            linha.put("funcionario", f == null ? null : f.getNome());
            linha.put("dataPedido", p.getData_pedido());
            linha.put("pagamento", p.getForma_pagamento());
            linha.put("valorTotal", p.getValor_total());
            linha.put("status", p.getStatus());
            linhas.add(linha);
        }
        return ResponseEntity.ok(linhas);
    }

    /** GET /api/relatorios -> resumo por status de pedido (só funcionário logado). */
    @GetMapping("/relatorios")
    public ResponseEntity<?> relatorios(HttpSession session) {
        if (!ehFuncionario(session)) return soFuncionario();
        Map<String, double[]> agregado = new LinkedHashMap<>(); // status -> [qtd, valor]
        for (Pedido p : Service.findAll(Pedido.class)) {
            String chave = p.getStatus() == null ? "Sem status" : p.getStatus();
            double[] acumulado = agregado.computeIfAbsent(chave, k -> new double[2]);
            acumulado[0]++;
            acumulado[1] += p.getValor_total() == null ? 0 : p.getValor_total();
        }
        List<Map<String, Object>> linhas = new ArrayList<>();
        agregado.forEach((status, valores) -> {
            Map<String, Object> linha = new HashMap<>();
            linha.put("status", status);
            linha.put("pedidos", (long) valores[0]);
            linha.put("valorTotal", valores[1]);
            linhas.add(linha);
        });
        return ResponseEntity.ok(linhas);
    }
}
