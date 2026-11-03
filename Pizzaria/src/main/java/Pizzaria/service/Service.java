package Pizzaria.service;

import Pizzaria.domain.*;
import Pizzaria.repository.Repository;
import lombok.extern.log4j.Log4j2;

import java.util.List;
import java.util.Optional;

@Log4j2
public class Service {

    public static <T> List<T> findByName(Class<T> tipo, String nome) {
        return Repository.findByName(tipo, nome);
    }

    public static <T> List<T> findAll(Class<T> tipo) {
        return Repository.findAll(tipo);
    }

    public static List<Endereco> findEnderecosByCliente(Integer idCliente) {
        return Repository.findEnderecosByCliente(idCliente);
    }

    public static List<Telefone> findTelefonesByCliente(Integer idCliente) {
        return Repository.findTelefonesByCliente(idCliente);
    }

    public static List<Telefone> findTelefonesByFuncionario(Integer idFuncionario) {
        return Repository.findTelefonesByFuncionario(idFuncionario);
    }

    public static List<Pedido> findPedidosByCliente(Integer idCliente) {
        return Repository.findPedidosByCliente(idCliente);
    }

    public static <T> T findById(Class<T> tipo, Integer id) {
        return Repository.findById(tipo, id);
    }

    public static <T> Optional<T> findByEmail(Class<T> tipo, String email) {
        return Repository.findByEmail(tipo, email);
    }

    public static boolean existsByCpf(String cpf) {
        return Repository.existsByCpf(cpf);
    }

    public static void delete(Class<?> tipo, int id) {
        Repository.delete(tipo, id);
    }

    public static <T> void save(T obj) {
        // Regra de negócio: não cadastrar dois clientes com o mesmo CPF
        if (obj instanceof Cliente cliente && existsByCpf(cliente.getCpf())) {
            log.warn("Já existe um cliente cadastrado com o CPF '{}'", cliente.getCpf());
            return;
        }
        Repository.save(obj);
    }

    public static <T> void update(T obj) {
        Repository.update(idOf(obj), obj);
    }

    public static boolean updatePedidoPainel(Integer id, String status, String formaPagamento, Integer idFuncionario) {
        return Repository.updatePedidoPainel(id, status, formaPagamento, idFuncionario);
    }

    public static java.util.Map<Integer, Integer> contarPedidosPorHora(java.time.LocalDate inicio,
                                                                       java.time.LocalDate fim) {
        return Repository.contarPedidosPorHora(inicio, fim);
    }

    public static List<java.util.Map<String, Object>> topPizzas(java.time.LocalDate inicio,
                                                               java.time.LocalDate fim, int limite) {
        return Repository.topPizzas(inicio, fim, limite);
    }

    // Descobre o id do objeto para usar no WHERE do UPDATE
    private static Integer idOf(Object obj) {
        if (obj instanceof Cliente o) return o.getId_cliente();
        if (obj instanceof Funcionario o) return o.getId_funcionario();
        if (obj instanceof Pizza o) return o.getId_pizza();
        if (obj instanceof Ingrediente o) return o.getId_ingrediente();
        if (obj instanceof Endereco o) return o.getId_endereco();
        if (obj instanceof Categoria o) return o.getId_categoria();
        if (obj instanceof Telefone o) return o.getId_telefone();
        if (obj instanceof Pedido o) return o.getId_pedido();
        throw new UnsupportedOperationException("Tipo não suportado: " + obj.getClass().getSimpleName());
    }
}
