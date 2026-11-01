package Pizzaria.repository;

import Pizzaria.connection.ConnectionFactory;
import Pizzaria.dominio.Ingrediente;
import Pizzaria.dominio.Pizza;
import lombok.extern.log4j.Log4j2;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static Pizzaria.repository.IngredienteRepository.ingredientesFromString;
import static Pizzaria.repository.IngredienteRepository.ingredientesToString;

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

    public static void save(Pizza pizza) {
        log.info("Saving pizza '{}'", pizza);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementSave(conn, pizza)) {
            ps.execute();
        } catch (SQLException e) {
            log.error("Error while trying to save pizza '{}'", pizza.getNome(), e);
        }
    }

    private static PreparedStatement createPreparedStatementSave(Connection conn, Pizza pizza) throws SQLException {
        String sql = "INSERT INTO dbo.Pizza (nome, descricao, tamanho, preco, ativa, categoria, ingredientes) VALUES (?, ?, ?, ?, ?, ?, ?)";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setString(1, pizza.getNome());
        fill(ps, pizza);
        return ps;
    }

    public static void delete(Integer id) {
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementDelete(conn, id)) {
            ps.execute();
            log.info("Deleted pizza '{}' from the database", id);
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
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementUpdate(conn, id, pizza)) {
            ps.execute();
        } catch (SQLException e) {
            log.error("Error while trying to update pizza '{}'", id, e);
        }
    }

    private static PreparedStatement createPreparedStatementUpdate(Connection conn, Integer id, Pizza pizza) throws SQLException {
        String sql = "UPDATE dbo.Pizza SET nome = ?, descricao = ?, tamanho = ?, preco = ?, ativa = ?, categoria = ?, ingredientes = ? WHERE id_pizza = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setString(1, pizza.getNome());
        fill(ps, pizza);
        ps.setInt(8, id);
        return ps;
    }

    // Preenche os 7 primeiros parâmetros (usado no INSERT e no UPDATE)
    private static void fill(PreparedStatement ps, Pizza p) throws SQLException {

        ps.setString(2, p.getDescricao());
        ps.setString(3, p.getTamanho());
        ps.setDouble(4, p.getPreco());
        ps.setBoolean(5, p.getAtiva() == null || p.getAtiva());
        ps.setString(6, p.getCategoria());
        ps.setString(7, ingredientesToString(p.getIngredientes()));
    }

    private static Pizza map(ResultSet rs) throws SQLException {

        return Pizza.builder()
                .id_pizza(rs.getInt("id_pizza"))
                .nome(rs.getString("nome"))
                .descricao(rs.getString("descricao"))
                .tamanho(rs.getString("tamanho"))
                .preco(rs.getDouble("preco"))
                .ativa(rs.getBoolean("ativa"))
                .categoria(rs.getString("categoria"))
                .ingredientes(ingredientesFromString(rs.getString("ingredientes")))
                .build();
    }
}
