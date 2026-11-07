package Pizzaria.controller;

import Pizzaria.domain.Categoria;
import Pizzaria.domain.Cliente;
import Pizzaria.domain.Ingrediente;
import Pizzaria.domain.Pedido;
import Pizzaria.domain.Pizza;
import Pizzaria.service.Service;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import static Pizzaria.util.Util.bancoIndisponivel;
import static Pizzaria.util.Util.bancoOnline;
import static Pizzaria.util.Util.ehFuncionario;
import static Pizzaria.util.Util.soFuncionario;

/**
 * Resumos exibidos nos cards e nos relatórios do painel do funcionário.
 * Todos os números são calculados a partir do banco de dados.
 */
@RestController
@RequestMapping("/api/resumos")
public class ResumoController {

    private static final Locale PT_BR = Locale.forLanguageTag("pt-BR");
    private static final DateTimeFormatter DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final String[] DIAS = {"Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"};
    private static final double ESTOQUE_CRITICO = 5.0;

    @GetMapping
    public ResponseEntity<?> resumo(HttpSession session) {
        if (!ehFuncionario(session)) return soFuncionario();
        if (!bancoOnline()) return bancoIndisponivel();

        LocalDate hoje = LocalDate.now();
        LocalDate inicioSemana = hoje.minusDays(6);
        LocalDate inicioSemanaAnterior = hoje.minusDays(13);
        LocalDate fimSemanaAnterior = hoje.minusDays(7);
        LocalDate inicioMes = hoje.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate fimMes = hoje.with(TemporalAdjusters.lastDayOfMonth());

        List<Pedido> pedidos = Service.findAll(Pedido.class);
        List<Cliente> clientes = Service.findAll(Cliente.class);
        List<Pizza> pizzas = Service.findAll(Pizza.class);
        List<Ingrediente> ingredientes = Service.findAll(Ingrediente.class);
        List<Categoria> categorias = Service.findAll(Categoria.class);

        Map<Integer, String> nomeCategoria = new HashMap<>();
        for (Categoria c : categorias) nomeCategoria.put(c.getId_categoria(), c.getNome_categoria());

        Map<Integer, Integer> pedidosPorCliente = new HashMap<>();
        for (Pedido p : pedidos) {
            if (p.getId_cliente() == null || p.getId_cliente().getId_cliente() == null) continue;
            pedidosPorCliente.merge(p.getId_cliente().getId_cliente(), 1, Integer::sum);
        }

        List<Pedido> pedidosHoje = new ArrayList<>();
        List<Pedido> pedidosSemana = new ArrayList<>();
        List<Pedido> pedidosSemanaAnterior = new ArrayList<>();
        for (Pedido p : pedidos) {
            LocalDate data = p.getData_pedido();
            if (data == null) continue;
            if (data.equals(hoje)) pedidosHoje.add(p);
            if (!data.isBefore(inicioSemana) && !data.isAfter(hoje)) pedidosSemana.add(p);
            if (!data.isBefore(inicioSemanaAnterior) && !data.isAfter(fimSemanaAnterior)) {
                pedidosSemanaAnterior.add(p);
            }
        }

        long pedidosHojeTotal = pedidosHoje.size();
        long pedidosHojeValidos = pedidosHoje.stream().filter(p -> !cancelado(p)).count();
        double vendasHoje = pedidosHoje.stream().filter(p -> !cancelado(p))
                .mapToDouble(this::valor).sum();
        double ticketHoje = pedidosHojeValidos == 0 ? 0 : vendasHoje / pedidosHojeValidos;

        long recebidosHoje = contar(pedidosHoje, "recebido");
        long preparoHoje = contar(pedidosHoje, "preparo");
        long entregaHoje = contar(pedidosHoje, "entrega");
        long entreguesHoje = contar(pedidosHoje, "entregue");
        long canceladosHoje = contar(pedidosHoje, "cancelado");
        long emAndamentoHoje = recebidosHoje + preparoHoje + entregaHoje;

        double vendasTotal = pedidos.stream().filter(p -> !cancelado(p))
                .mapToDouble(this::valor).sum();
        long pedidosValidosTotal = pedidos.stream().filter(p -> !cancelado(p)).count();
        double ticketTotal = pedidosValidosTotal == 0 ? 0 : vendasTotal / pedidosValidosTotal;

        Map<String, Object> pedidosResumo = new LinkedHashMap<>();
        pedidosResumo.put("hoje", pedidosHojeTotal);
        pedidosResumo.put("vendasHoje", arredonda(vendasHoje));
        pedidosResumo.put("ticketMedioHoje", arredonda(ticketHoje));
        pedidosResumo.put("emAndamentoHoje", emAndamentoHoje);
        pedidosResumo.put("recebidosHoje", recebidosHoje);
        pedidosResumo.put("preparoHoje", preparoHoje);
        pedidosResumo.put("entregaHoje", entregaHoje);
        pedidosResumo.put("entreguesHoje", entreguesHoje);
        pedidosResumo.put("canceladosHoje", canceladosHoje);
        pedidosResumo.put("todos", pedidos.size());
        pedidosResumo.put("recebidos", contar(pedidos, "recebido"));
        pedidosResumo.put("preparo", contar(pedidos, "preparo"));
        pedidosResumo.put("entrega", contar(pedidos, "entrega"));
        pedidosResumo.put("entregues", contar(pedidos, "entregue"));
        pedidosResumo.put("cancelados", contar(pedidos, "cancelado"));
        pedidosResumo.put("vendasTotal", arredonda(vendasTotal));
        pedidosResumo.put("ticketMedioTotal", arredonda(ticketTotal));

        long novosMes = clientes.stream()
                .filter(c -> c.getData_cadastro() != null)
                .filter(c -> !c.getData_cadastro().isBefore(inicioMes)
                        && !c.getData_cadastro().isAfter(fimMes))
                .count();
        long recorrentes = pedidosPorCliente.values().stream().filter(q -> q >= 2).count();
        long novosCompradores = pedidosPorCliente.values().stream().filter(q -> q == 1).count();
        long comPedido = pedidosPorCliente.values().stream().filter(q -> q >= 1).count();
        long semPedidos = Math.max(0, clientes.size() - comPedido);

        Map<String, Object> clientesResumo = new LinkedHashMap<>();
        clientesResumo.put("total", clientes.size());
        clientesResumo.put("novosMes", novosMes);
        clientesResumo.put("recorrentes", recorrentes);
        clientesResumo.put("novosCompradores", novosCompradores);
        clientesResumo.put("semPedidos", semPedidos);
        clientesResumo.put("ticketMedioHoje", arredonda(ticketHoje));
        clientesResumo.put("mesAtual", hoje.getMonth().getDisplayName(TextStyle.FULL, PT_BR));
        clientesResumo.put("inicioMes", inicioMes.format(DATA));
        clientesResumo.put("fimMes", fimMes.format(DATA));

        long tradicionais = 0, especiais = 0, doces = 0, bebidas = 0;
        long tradicionaisAtivos = 0, especiaisAtivos = 0;
        double somaPrecos = 0;
        double menorPreco = Double.MAX_VALUE;
        double maiorPreco = 0;
        long disponiveis = 0;
        for (Pizza p : pizzas) {
            String cat = categoriaDe(p, nomeCategoria);
            String key = normalizar(cat);
            if (key.equals("tradicional")) {
                tradicionais++;
                if (Boolean.TRUE.equals(p.getAtiva())) tradicionaisAtivos++;
            } else if (key.equals("especial")) {
                especiais++;
                if (Boolean.TRUE.equals(p.getAtiva())) especiaisAtivos++;
            } else if (key.equals("doce")) doces++;
            else if (key.equals("bebida")) bebidas++;

            double preco = p.getPreco() == null ? 0 : p.getPreco();
            somaPrecos += preco;
            menorPreco = Math.min(menorPreco, preco);
            maiorPreco = Math.max(maiorPreco, preco);
            if (Boolean.TRUE.equals(p.getAtiva())) disponiveis++;
        }
        if (pizzas.isEmpty()) {
            menorPreco = 0;
            maiorPreco = 0;
        }

        List<Map<String, Object>> topPizzas = Service.topPizzas(inicioSemana, hoje, 5);
        Map<String, Object> cardapioResumo = new LinkedHashMap<>();
        cardapioResumo.put("total", pizzas.size());
        cardapioResumo.put("disponiveis", disponiveis);
        cardapioResumo.put("indisponiveis", pizzas.size() - disponiveis);
        cardapioResumo.put("tradicionais", tradicionais);
        cardapioResumo.put("especiais", especiais);
        cardapioResumo.put("tradicionaisAtivos", tradicionaisAtivos);
        cardapioResumo.put("especiaisAtivos", especiaisAtivos);
        cardapioResumo.put("doces", doces);
        cardapioResumo.put("bebidas", bebidas);
        cardapioResumo.put("precoMedio", arredonda(pizzas.isEmpty() ? 0 : somaPrecos / pizzas.size()));
        cardapioResumo.put("precoMin", arredonda(menorPreco));
        cardapioResumo.put("precoMax", arredonda(maiorPreco));
        cardapioResumo.put("maisVendida", topPizzas.isEmpty() ? null : topPizzas.get(0).get("nome"));
        cardapioResumo.put("maisVendidaQtd", topPizzas.isEmpty() ? 0 : topPizzas.get(0).get("quantidade"));
        cardapioResumo.put("topPizzas", topPizzas);

        long criticos = 0;
        double valorEstoque = 0;
        double valorCritico = 0;
        List<Map<String, Object>> criticosLista = new ArrayList<>();
        for (Ingrediente i : ingredientes) {
            double qtd = i.getQuantidade() == null ? 0 : i.getQuantidade();
            double preco = i.getPreco_unitario() == null ? 0 : i.getPreco_unitario();
            valorEstoque += qtd * preco;
            if (qtd <= ESTOQUE_CRITICO) {
                criticos++;
                valorCritico += qtd * preco;
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("nome", i.getNome());
                item.put("quantidade", arredonda(qtd));
                item.put("unidade", i.getUnidade());
                criticosLista.add(item);
            }
        }

        Map<String, Object> estoqueResumo = new LinkedHashMap<>();
        estoqueResumo.put("itens", ingredientes.size());
        estoqueResumo.put("criticos", criticos);
        estoqueResumo.put("ok", ingredientes.size() - criticos);
        estoqueResumo.put("valorTotal", arredonda(valorEstoque));
        estoqueResumo.put("valorCritico", arredonda(valorCritico));
        estoqueResumo.put("criticosLista", criticosLista);

        Map<LocalDate, double[]> vendasPorDia = new LinkedHashMap<>();
        for (int i = 0; i < 7; i++) vendasPorDia.put(inicioSemana.plusDays(i), new double[]{0, 0});
        for (Pedido p : pedidosSemana) {
            LocalDate data = p.getData_pedido();
            if (data == null || !vendasPorDia.containsKey(data)) continue;
            double[] acumulado = vendasPorDia.get(data);
            acumulado[1]++;
            if (!cancelado(p)) acumulado[0] += valor(p);
        }
        List<Map<String, Object>> vendasSemana = new ArrayList<>();
        String melhorDia = "-";
        double melhorValor = -1;
        double totalSemana = 0;
        for (Map.Entry<LocalDate, double[]> e : vendasPorDia.entrySet()) {
            LocalDate data = e.getKey();
            double valorDia = arredonda(e.getValue()[0]);
            long qtdDia = (long) e.getValue()[1];
            totalSemana += valorDia;
            if (valorDia > melhorValor && valorDia > 0) {
                melhorValor = valorDia;
                melhorDia = DIAS[data.getDayOfWeek().getValue() % 7];
            }
            Map<String, Object> dia = new LinkedHashMap<>();
            dia.put("data", data.toString());
            dia.put("dia", DIAS[data.getDayOfWeek().getValue() % 7]);
            dia.put("valor", valorDia);
            dia.put("pedidos", qtdDia);
            vendasSemana.add(dia);
        }
        totalSemana = arredonda(totalSemana);

        double totalSemanaAnterior = pedidosSemanaAnterior.stream().filter(p -> !cancelado(p))
                .mapToDouble(this::valor).sum();
        Integer variacaoSemana = totalSemanaAnterior <= 0 ? null
                : (int) Math.round((totalSemana - totalSemanaAnterior) / totalSemanaAnterior * 100);

        List<Map<String, Object>> horarios = new ArrayList<>();
        for (Map.Entry<Integer, Integer> e : Service.contarPedidosPorHora(inicioSemana, hoje).entrySet()) {
            Map<String, Object> hora = new LinkedHashMap<>();
            hora.put("hora", e.getKey());
            hora.put("label", e.getKey() + "h");
            hora.put("pedidos", e.getValue());
            horarios.add(hora);
        }

        Map<String, Object> semana = new LinkedHashMap<>();
        semana.put("inicio", inicioSemana.format(DATA));
        semana.put("fim", hoje.format(DATA));
        semana.put("vendasPorDia", vendasSemana);
        semana.put("totalVendas", totalSemana);
        semana.put("pedidos", pedidosSemana.size());
        semana.put("cancelamentos", contar(pedidosSemana, "cancelado"));
        semana.put("melhorDia", melhorDia);
        semana.put("variacao", variacaoSemana);
        semana.put("topPizzas", topPizzas);
        semana.put("horarios", horarios);
        semana.put("entreguesHoje", entreguesHoje);
        semana.put("emEntregaHoje", entregaHoje);
        semana.put("canceladosHoje", canceladosHoje);

        Map<String, Object> relatoriosResumo = new LinkedHashMap<>();
        relatoriosResumo.put("faturamentoHoje", arredonda(vendasHoje));
        relatoriosResumo.put("pedidosHoje", pedidosHojeTotal);
        relatoriosResumo.put("canceladosHoje", canceladosHoje);
        relatoriosResumo.put("ticketMedioHoje", arredonda(ticketHoje));
        relatoriosResumo.put("novosClientesMes", novosMes);
        relatoriosResumo.put("mesAno", capitalizar(hoje.getMonth().getDisplayName(TextStyle.FULL, PT_BR)
                + " de " + hoje.getYear()));
        relatoriosResumo.put("semana", semana);

        Map<String, Object> corpo = new LinkedHashMap<>();
        corpo.put("pedidos", pedidosResumo);
        corpo.put("clientes", clientesResumo);
        corpo.put("cardapio", cardapioResumo);
        corpo.put("estoque", estoqueResumo);
        corpo.put("relatorios", relatoriosResumo);
        return ResponseEntity.ok(corpo);
    }

    private double valor(Pedido p) {
        return p.getValor_total() == null ? 0 : p.getValor_total();
    }

    private static long contar(List<Pedido> pedidos, String statusKey) {
        return pedidos.stream().filter(p -> statusKey.equals(statusDe(p.getStatus()))).count();
    }

    private static boolean cancelado(Pedido p) {
        return "cancelado".equals(statusDe(p.getStatus()));
    }

    private static String categoriaDe(Pizza p, Map<Integer, String> categorias) {
        if (p.getId_categoria() == null || p.getId_categoria().getId_categoria() == null) return "";
        return categorias.getOrDefault(p.getId_categoria().getId_categoria(), "");
    }

    private static String statusDe(String status) {
        String s = normalizar(status);
        if (s.startsWith("receb")) return "recebido";
        if (s.contains("preparo")) return "preparo";
        if (s.contains("saiu") || s.contains("entrega")) return "entrega";
        if (s.contains("entreg")) return "entregue";
        if (s.contains("cancel")) return "cancelado";
        return s;
    }

    private static String normalizar(String s) {
        if (s == null) return "";
        return Normalizer.normalize(s, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").trim().toLowerCase();
    }

    private static String capitalizar(String s) {
        if (s == null || s.isEmpty()) return s;
        return s.substring(0, 1).toUpperCase(PT_BR) + s.substring(1);
    }

    private static double arredonda(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
