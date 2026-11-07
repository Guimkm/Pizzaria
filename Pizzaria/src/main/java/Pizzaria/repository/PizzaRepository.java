package Pizzaria.repository;

import Pizzaria.connection.ConnectionFactory;
import Pizzaria.domain.Categoria;
import Pizzaria.domain.Ingrediente;
import Pizzaria.domain.Pizza;
import lombok.extern.log4j.Log4j2;

import java.sql.*;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * A relação "Possui" (Pizza N:N Ingrediente) é tratada aqui, na tabela de ligação
 * dbo.Pizza_Ingrediente (id_pizza, id_ingrediente), que já existe no banco externo.
 */
@Log4j2
public class PizzaRepository {

    public static List<Pizza> findByName(String nome) {
        log.info("Finding pizzas by name '{}'", nome);
        List<Pizza> pizzas = new ArrayList<>();
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementFindByName(conn, nome);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                pizzas.add(map(rs));
            }
        } catch (SQLException e) {
            log.error("Error while trying to find pizzas by name '{}'", nome, e);
        }
        return pizzas;
    }

    private static PreparedStatement createPreparedStatementFindByName(Connection conn, String nome) throws SQLException {
        String sql = "SELECT * FROM dbo.Pizza WHERE nome LIKE ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setString(1, String.format("%%%s%%", nome));
        return ps;
    }

    // Lista as pizzas de uma categoria (relação "Pertence": Categoria (1,n) - Pizza (1,1))
    public static List<Pizza> findByCategoria(Integer idCategoria) {
        log.info("Finding pizzas of categoria '{}'", idCategoria);
        List<Pizza> pizzas = new ArrayList<>();
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementFindByCategoria(conn, idCategoria);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                pizzas.add(map(rs));
            }
        } catch (SQLException e) {
            log.error("Error while trying to find pizzas of categoria '{}'", idCategoria, e);
        }
        return pizzas;
    }

    private static PreparedStatement createPreparedStatementFindByCategoria(Connection conn, Integer idCategoria) throws SQLException {
        String sql = "SELECT * FROM dbo.Pizza WHERE id_categoria = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, idCategoria);
        return ps;
    }

    public static List<Pizza> findAll() {
        log.info("Finding all pizzas");
        List<Pizza> lista = new ArrayList<>();
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementFindAll(conn);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                lista.add(map(rs));
            }
        } catch (SQLException e) {
            log.error("Error while trying to find all pizzas", e);
        }
        return lista;
    }

    private static PreparedStatement createPreparedStatementFindAll(Connection conn) throws SQLException {
        String sql = "SELECT * FROM dbo.Pizza ORDER BY nome";
        return conn.prepareStatement(sql);
    }

    public static Optional<Pizza> findById(Integer id) {
        log.info("Finding pizza by id '{}'", id);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementFindById(conn, id);
             ResultSet rs = ps.executeQuery()) {
            if (!rs.next()) return Optional.empty();
            return Optional.of(map(rs));
        } catch (SQLException e) {
            log.error("Error while trying to find pizza by id '{}'", id, e);
        }
        return Optional.empty();
    }

    private static PreparedStatement createPreparedStatementFindById(Connection conn, Integer id) throws SQLException {
        String sql = "SELECT * FROM dbo.Pizza WHERE id_pizza = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, id);
        return ps;
    }

    // Ingredientes da pizza (relação "Possui")
    private static List<Ingrediente> findIngredientes(Integer idPizza) {
        List<Ingrediente> ingredientes = new ArrayList<>();
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementFindIngredientes(conn, idPizza);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                ingredientes.add(IngredienteRepository.map(rs));
            }
        } catch (SQLException e) {
            log.error("Error while trying to find ingredientes of pizza '{}'", idPizza, e);
        }
        return ingredientes;
    }

    private static PreparedStatement createPreparedStatementFindIngredientes(Connection conn, Integer idPizza) throws SQLException {
        String sql = "SELECT i.* FROM dbo.Ingredientes i "
                + "JOIN dbo.Pizza_Ingrediente pi ON pi.id_ingrediente = i.id_ingrediente "
                + "WHERE pi.id_pizza = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, idPizza);
        return ps;
    }

    public static void save(Pizza pizza) {
        log.info("Saving pizza '{}'", pizza);
        try (Connection conn = ConnectionFactory.getConnection()) {
            conn.setAutoCommit(false);
            try {
                Integer idPizza;
                try (PreparedStatement ps = createPreparedStatementSave(conn, pizza)) {
                    ps.execute();
                    idPizza = generatedId(ps);
                }
                saveIngredientes(conn, idPizza, pizza.getIngredientes());
                conn.commit();
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            }
        } catch (SQLException e) {
            log.error("Error while trying to save pizza '{}'", pizza.getNome(), e);
        }
    }

    private static PreparedStatement createPreparedStatementSave(Connection conn, Pizza pizza) throws SQLException {
        String sql = "INSERT INTO dbo.Pizza (nome, descricao, tamanho, preco, ativa, id_categoria) VALUES (?, ?, ?, ?, ?, ?)";
        PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
        fill(ps, pizza);
        return ps;
    }

    public static void delete(Integer id) {
        try (Connection conn = ConnectionFactory.getConnection()) {
            conn.setAutoCommit(false);
            try {
                deleteIngredientes(conn, id);
                try (PreparedStatement ps = createPreparedStatementDelete(conn, id)) {
                    ps.execute();
                }
                conn.commit();
                log.info("Deleted pizza '{}' from the database", id);
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            }
        } catch (SQLException e) {
            log.error("Error while trying to delete pizza '{}'", id, e);
        }
    }

    private static PreparedStatement createPreparedStatementDelete(Connection conn, Integer id) throws SQLException {
        String sql = "DELETE FROM dbo.Pizza WHERE id_pizza = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, id);
        return ps;
    }

    public static void update(Integer id, Pizza pizza) {
        log.info("Updating pizza '{}'", id);
        try (Connection conn = ConnectionFactory.getConnection()) {
            conn.setAutoCommit(false);
            try {
                try (PreparedStatement ps = createPreparedStatementUpdate(conn, id, pizza)) {
                    ps.execute();
                }
                // Só mexe nos ingredientes se a lista foi informada
                if (pizza.getIngredientes() != null) {
                    deleteIngredientes(conn, id);
                    saveIngredientes(conn, id, pizza.getIngredientes());
                }
                conn.commit();
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            }
        } catch (SQLException e) {
            log.error("Error while trying to update pizza '{}'", id, e);
        }
    }

    private static PreparedStatement createPreparedStatementUpdate(Connection conn, Integer id, Pizza pizza) throws SQLException {
        String sql = "UPDATE dbo.Pizza SET nome = ?, descricao = ?, tamanho = ?, preco = ?, ativa = ?, id_categoria = ? WHERE id_pizza = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        fill(ps, pizza);
        ps.setInt(7, id);
        return ps;
    }

    private static void saveIngredientes(Connection conn, Integer idPizza, List<Ingrediente> ingredientes) throws SQLException {
        if (ingredientes == null) return;
        Set<Integer> ids = new LinkedHashSet<>();
        for (Ingrediente i : ingredientes) ids.add(i.getId_ingrediente());
        for (Integer idIngrediente : ids) {
            try (PreparedStatement ps = createPreparedStatementSaveIngrediente(conn, idPizza, idIngrediente)) {
                ps.execute();
            }
        }
    }

    private static PreparedStatement createPreparedStatementSaveIngrediente(Connection conn, Integer idPizza, Integer idIngrediente) throws SQLException {
        String sql = "INSERT INTO dbo.Pizza_Ingrediente (id_pizza, id_ingrediente) VALUES (?, ?)";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, idPizza);
        ps.setInt(2, idIngrediente);
        return ps;
    }

    private static void deleteIngredientes(Connection conn, Integer idPizza) throws SQLException {
        try (PreparedStatement ps = createPreparedStatementDeleteIngredientes(conn, idPizza)) {
            ps.execute();
        }
    }

    private static PreparedStatement createPreparedStatementDeleteIngredientes(Connection conn, Integer idPizza) throws SQLException {
        String sql = "DELETE FROM dbo.Pizza_Ingrediente WHERE id_pizza = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, idPizza);
        return ps;
    }

    private static Integer generatedId(PreparedStatement ps) throws SQLException {
        try (ResultSet keys = ps.getGeneratedKeys()) {
            return keys.next() ? keys.getInt(1) : null;
        }
    }

    // Preenche os 6 primeiros parâmetros (usado no INSERT e no UPDATE)
    private static void fill(PreparedStatement ps, Pizza p) throws SQLException {
        ps.setString(1, p.getNome());
        ps.setString(2, p.getDescricao());
        ps.setString(3, p.getTamanho());
        ps.setDouble(4, p.getPreco());
        ps.setBoolean(5, p.getAtiva() == null || p.getAtiva());
        ps.setInt(6, p.getId_categoria().getId_categoria());
    }

    private static Pizza map(ResultSet rs) throws SQLException {
        int id = rs.getInt("id_pizza");
        return Pizza.builder()
                .id_pizza(id)
                .nome(rs.getString("nome"))
                .descricao(rs.getString("descricao"))
                .tamanho(rs.getString("tamanho"))
                .preco(rs.getDouble("preco"))
                .ativa(rs.getBoolean("ativa"))
                .id_categoria(Categoria.builder().id_categoria(rs.getInt("id_categoria")).build())
                .ingredientes(findIngredientes(id))
                .build();
    }
}
