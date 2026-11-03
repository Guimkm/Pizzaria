package Pizzaria.controller;

import Pizzaria.domain.Cliente;
import Pizzaria.domain.Pedido;
import Pizzaria.domain.Pizza;
import Pizzaria.service.Service;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static Pizzaria.util.Util.*;

/**
 * POST /api/pedidos -> grava o pedido do checkout (tabelas Pedido e Item_Pedido).
 * O cliente vem da SESSÃO (cookie), nunca de um id enviado pelo navegador, e o
 * preço de cada item vem do banco (não do navegador).
 * A listagem (GET /api/pedidos) fica no SiteController.
 */
@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    /** Item do carrinho: localizado pelo NOME (igual ao cadastrado no banco). */
    public record ItemRequest(String nome, Integer qtd, Double preco) {}

    /** Corpo do POST: itens, forma de pagamento e taxa de entrega (0 se houver cupom). */
    public record PedidoRequest(List<ItemRequest> itens, String pagamento, Double taxa) {}

    /** Corpo do PUT feito pelo painel do funcionário. */
    public record AtualizarPedidoRequest(String status, String formaPagamento, Integer idFuncionario) {}

    /** Criação simplificada de pedido pelo painel (um item por vez). */
    public record NovoPedidoRequest(Integer idCliente, Integer idPizza, Integer quantidade,
                                    String pagamento, Double taxa) {}

    private static double arredonda(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Integer id,
                                       @RequestBody AtualizarPedidoRequest req,
                                       HttpSession session) {
        if (!ehFuncionario(session)) return soFuncionario();
        if (req == null || vazio(req.status())) {
            return erro(HttpStatus.BAD_REQUEST, "Informe o status do pedido");
        }
        String status = req.status().trim();
        String pagamento = vazio(req.formaPagamento()) ? "Não informado" : req.formaPagamento().trim();
        if (status.length() > 30) return erro(HttpStatus.BAD_REQUEST, "Status muito longo");
        if (pagamento.length() > 30) return erro(HttpStatus.BAD_REQUEST, "Forma de pagamento muito longa");
        if (!bancoOnline()) return bancoIndisponivel();

        Pedido atual = Service.findById(Pedido.class, id);
        if (atual == null) return erro(HttpStatus.NOT_FOUND, "Pedido não encontrado");

        // Mantém o responsável já atribuído ou atribui o funcionário que está editando.
        Integer idFuncionario = req.idFuncionario();
        if (idFuncionario == null) {
            idFuncionario = atual.getId_funcionario() == null
                    ? (Integer) session.getAttribute("id")
                    : atual.getId_funcionario().getId_funcionario();
        }

        boolean atualizou = Service.updatePedidoPainel(id, status, pagamento, idFuncionario);
        if (!atualizou) {
            return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Não foi possível atualizar o pedido");
        }

        Pedido depois = Service.findById(Pedido.class, id);
        if (depois == null || !status.equals(depois.getStatus())) {
            return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Não foi possível confirmar a atualização do pedido");
        }

        return ResponseEntity.ok(Map.of("ok", true, "mensagem", "Pedido atualizado"));
    }

    @PostMapping("/painel")
    public ResponseEntity<?> criarPeloPainel(@RequestBody NovoPedidoRequest req, HttpSession session) {
        if (!ehFuncionario(session)) return soFuncionario();
        if (req == null || req.idCliente() == null || req.idPizza() == null) {
            return erro(HttpStatus.BAD_REQUEST, "Informe cliente e item do pedido");
        }
        int quantidade = req.quantidade() == null ? 0 : req.quantidade();
        if (quantidade < 1 || quantidade > 50) {
            return erro(HttpStatus.BAD_REQUEST, "Quantidade inválida");
        }
        if (!bancoOnline()) return bancoIndisponivel();

        Cliente cliente = Service.findById(Cliente.class, req.idCliente());
        if (cliente == null) return erro(HttpStatus.BAD_REQUEST, "Cliente inválido");
        Pizza pizza = Service.findById(Pizza.class, req.idPizza());
        if (pizza == null || !Boolean.TRUE.equals(pizza.getAtiva())) {
            return erro(HttpStatus.BAD_REQUEST, "Item indisponível no cardápio");
        }

        List<Pizza> itens = new ArrayList<>();
        for (int i = 0; i < quantidade; i++) itens.add(pizza);
        double subtotal = (pizza.getPreco() == null ? 0 : pizza.getPreco()) * quantidade;
        double taxa = req.taxa() == null ? 0 : Math.min(Math.max(req.taxa(), 0), 50);
        String pagamento = vazio(req.pagamento()) ? "Pix" : req.pagamento().trim();
        if (pagamento.length() > 30) pagamento = pagamento.substring(0, 30);

        Object idFuncionario = session.getAttribute("id");
        Pedido pedido = Pedido.builder()
                .status("Recebido")
                .forma_pagamento(pagamento)
                .valor_total(arredonda(subtotal + taxa))
                .id_cliente(cliente)
                .id_funcionario(idFuncionario instanceof Integer
                        ? Pizzaria.domain.Funcionario.builder().id_funcionario((Integer) idFuncionario).build()
                        : null)
                .item_pedido(itens)
                .build();

        int antes = Service.findPedidosByCliente(cliente.getId_cliente()).size();
        Service.save(pedido);
        List<Pedido> depois = Service.findPedidosByCliente(cliente.getId_cliente());
        if (depois.size() <= antes) {
            return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Não foi possível registrar o pedido");
        }
        Pedido criado = depois.get(0);

        Map<String, Object> corpo = new HashMap<>();
        corpo.put("ok", true);
        corpo.put("id", criado.getId_pedido());
        corpo.put("mensagem", "Pedido #" + criado.getId_pedido() + " criado");
        return ResponseEntity.status(HttpStatus.CREATED).body(corpo);
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody PedidoRequest req, HttpSession session) {
        // 1) Só cliente logado faz pedido
        if (session.getAttribute("id") == null || !"CLIENTE".equals(session.getAttribute("tipo"))) {
            return erro(HttpStatus.UNAUTHORIZED, "Entre como cliente para finalizar o pedido");
        }
        // 2) Valida o carrinho antes de gravar qualquer coisa
        if (req == null || req.itens() == null || req.itens().isEmpty()) {
            return erro(HttpStatus.BAD_REQUEST, "O carrinho está vazio");
        }
        if (!bancoOnline()) return bancoIndisponivel();
        Cliente cliente = Service.findById(Cliente.class, (Integer) session.getAttribute("id"));
        if (cliente == null) {
            return erro(HttpStatus.UNAUTHORIZED, "Cliente não encontrado. Entre novamente");
        }

        List<Pizza> itens = new ArrayList<>(); // cada ocorrência = 1 unidade (ver Pedido.item_pedido)
        double subtotal = 0;
        for (ItemRequest it : req.itens()) {
            if (it == null || vazio(it.nome())) {
                return erro(HttpStatus.BAD_REQUEST, "Item sem nome no carrinho");
            }
            int qtd = it.qtd() == null ? 0 : it.qtd();
            if (qtd < 1 || qtd > 50) {
                return erro(HttpStatus.BAD_REQUEST, "Quantidade inválida para " + it.nome());
            }
            Pizza pizza = Service.findByName(Pizza.class, it.nome().trim()).stream()
                    .filter(p -> p.getNome().equalsIgnoreCase(it.nome().trim()))
                    .findFirst().orElse(null);
            if (pizza == null || !Boolean.TRUE.equals(pizza.getAtiva())) {
                return erro(HttpStatus.BAD_REQUEST, "Item indisponível no cardápio: " + it.nome());
            }
            for (int i = 0; i < qtd; i++) itens.add(pizza);
            subtotal += pizza.getPreco() * qtd;
        }
        double taxa = req.taxa() == null ? 0 : Math.min(Math.max(req.taxa(), 0), 50);

        String pagamento = vazio(req.pagamento()) ? "Pix" : req.pagamento().trim();
        if (pagamento.length() > 30) pagamento = pagamento.substring(0, 30);

        // 3) Grava (PedidoRepository grava Pedido + Item_Pedido na mesma transação)
        Pedido pedido = Pedido.builder()
                .status("Recebido")
                .forma_pagamento(pagamento)
                .valor_total(arredonda(subtotal + taxa))
                .id_cliente(cliente)
                .item_pedido(itens)
                .build();
        int antes = Service.findPedidosByCliente(cliente.getId_cliente()).size();
        Service.save(pedido);
        List<Pedido> depois = Service.findPedidosByCliente(cliente.getId_cliente());
        if (depois.size() <= antes) {
            return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Não foi possível registrar o pedido. Tente novamente");
        }
        Pedido criado = depois.get(0); // lista vem do mais novo para o mais antigo

        Map<String, Object> corpo = new HashMap<>();
        corpo.put("ok", true);
        corpo.put("id", criado.getId_pedido());
        corpo.put("numero", "Pedido #" + criado.getId_pedido());
        corpo.put("total", criado.getValor_total());
        return ResponseEntity.status(HttpStatus.CREATED).body(corpo);
    }
}
