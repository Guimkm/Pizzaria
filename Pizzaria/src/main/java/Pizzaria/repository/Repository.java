package Pizzaria.repository;

import Pizzaria.domain.*;

import java.util.List;
import java.util.Optional;

/**
 * Repository genérico do diagrama. Ele não faz SQL direto: descobre o tipo (T)
 * e repassa para o repositório específico (ClienteRepository, PizzaRepository...).
 * Os métodos createPreparedStatement* ficam dentro de cada repositório específico.
 */
public class Repository {

    public static <T> List<T> findByName(Class<T> tipo, String nome) {
        if (tipo == Cliente.class) return castList(tipo, ClienteRepository.findByName(nome));
        if (tipo == Funcionario.class) return castList(tipo, FuncionarioRepository.findByName(nome));
        if (tipo == Pizza.class) return castList(tipo, PizzaRepository.findByName(nome));
        if (tipo == Ingrediente.class) return castList(tipo, IngredienteRepository.findByName(nome));
        if (tipo == Categoria.class) return castList(tipo, CategoriaRepository.findByName(nome));
        throw naoSuportado("findByName", tipo);
    }

    public static <T> List<T> findAll(Class<T> tipo) {
        if (tipo == Cliente.class) return castList(tipo, ClienteRepository.findAll());
        if (tipo == Funcionario.class) return castList(tipo, FuncionarioRepository.findAll());
        if (tipo == Pizza.class) return castList(tipo, PizzaRepository.findAll());
        if (tipo == Ingrediente.class) return castList(tipo, IngredienteRepository.findAll());
        if (tipo == Categoria.class) return castList(tipo, CategoriaRepository.findAll());
        if (tipo == Pedido.class) return castList(tipo, PedidoRepository.findAll());
        throw naoSuportado("findAll", tipo);
    }

    // Relações 1:N usadas pelas telas (Cliente -> Endereco/Telefone/Pedido)
    public static List<Endereco> findEnderecosByCliente(Integer idCliente) {
        return EnderecoRepository.findByCliente(idCliente);
    }

    public static List<Telefone> findTelefonesByCliente(Integer idCliente) {
        return TelefoneRepository.findByCliente(idCliente);
    }

    public static List<Telefone> findTelefonesByFuncionario(Integer idFuncionario) {
        return TelefoneRepository.findByFuncionario(idFuncionario);
    }

    public static List<Pedido> findPedidosByCliente(Integer idCliente) {
        return PedidoRepository.findByCliente(idCliente);
    }

    public static boolean updatePedidoPainel(Integer id, String status, String formaPagamento, Integer idFuncionario) {
        return PedidoRepository.updatePainel(id, status, formaPagamento, idFuncionario);
    }

    public static java.util.Map<Integer, Integer> contarPedidosPorHora(java.time.LocalDate inicio, java.time.LocalDate fim) {
        return PedidoRepository.contarPorHora(inicio, fim);
    }

    public static List<java.util.Map<String, Object>> topPizzas(java.time.LocalDate inicio,
                                                               java.time.LocalDate fim, int limite) {
        return PedidoRepository.topPizzas(inicio, fim, limite);
    }

    // Retorna null se não encontrar (o diagrama define o retorno como T, não Optional)
    public static <T> T findById(Class<T> tipo, Integer id) {
        Optional<?> resultado;
        if (tipo == Cliente.class) resultado = ClienteRepository.findById(id);
        else if (tipo == Funcionario.class) resultado = FuncionarioRepository.findById(id);
        else if (tipo == Pizza.class) resultado = PizzaRepository.findById(id);
        else if (tipo == Ingrediente.class) resultado = IngredienteRepository.findById(id);
        else if (tipo == Endereco.class) resultado = EnderecoRepository.findById(id);
        else if (tipo == Categoria.class) resultado = CategoriaRepository.findById(id);
        else if (tipo == Telefone.class) resultado = TelefoneRepository.findById(id);
        else if (tipo == Pedido.class) resultado = PedidoRepository.findById(id);
        else throw naoSuportado("findById", tipo);
        return resultado.map(tipo::cast).orElse(null);
    }

    public static <T> Optional<T> findByEmail(Class<T> tipo, String email) {
        if (tipo == Cliente.class) return ClienteRepository.findByEmail(email).map(tipo::cast);
        if (tipo == Funcionario.class) return FuncionarioRepository.findByEmail(email).map(tipo::cast);
        throw naoSuportado("findByEmail", tipo);
    }

    public static boolean existsByCpf(String cpf) {
        return ClienteRepository.existsByCpf(cpf);
    }

    public static <T> void save(T obj) {
        if (obj instanceof Cliente o) ClienteRepository.save(o);
        else if (obj instanceof Funcionario o) FuncionarioRepository.save(o);
        else if (obj instanceof Pizza o) PizzaRepository.save(o);
        else if (obj instanceof Ingrediente o) IngredienteRepository.save(o);
        else if (obj instanceof Endereco o) EnderecoRepository.save(o);
        else if (obj instanceof Categoria o) CategoriaRepository.save(o);
        else if (obj instanceof Telefone o) TelefoneRepository.save(o);
        else if (obj instanceof Pedido o) PedidoRepository.save(o);
        else throw naoSuportado("save", obj.getClass());
    }

    public static void delete(Class<?> tipo, Integer id) {
        if (tipo == Cliente.class) ClienteRepository.delete(id);
        else if (tipo == Funcionario.class) FuncionarioRepository.delete(id);
        else if (tipo == Pizza.class) PizzaRepository.delete(id);
        else if (tipo == Ingrediente.class) IngredienteRepository.delete(id);
        else if (tipo == Endereco.class) EnderecoRepository.delete(id);
        else if (tipo == Categoria.class) CategoriaRepository.delete(id);
        else if (tipo == Telefone.class) TelefoneRepository.delete(id);
        else if (tipo == Pedido.class) PedidoRepository.delete(id);
        else throw naoSuportado("delete", tipo);
    }

    public static <T> void update(Integer id, T obj) {
        if (obj instanceof Cliente o) ClienteRepository.update(id, o);
        else if (obj instanceof Funcionario o) FuncionarioRepository.update(id, o);
        else if (obj instanceof Pizza o) PizzaRepository.update(id, o);
        else if (obj instanceof Ingrediente o) IngredienteRepository.update(id, o);
        else if (obj instanceof Endereco o) EnderecoRepository.update(id, o);
        else if (obj instanceof Categoria o) CategoriaRepository.update(id, o);
        else if (obj instanceof Telefone o) TelefoneRepository.update(id, o);
        else if (obj instanceof Pedido o) PedidoRepository.update(id, o);
        else throw naoSuportado("update", obj.getClass());
    }

    private static <T> List<T> castList(Class<T> tipo, List<?> lista) {
        return lista.stream().map(tipo::cast).toList();
    }

    private static UnsupportedOperationException naoSuportado(String metodo, Class<?> tipo) {
        return new UnsupportedOperationException(metodo + " não é suportado para " + tipo.getSimpleName());
    }
}
