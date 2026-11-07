package Pizzaria.connection;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

/**
 * Conexão com o SQL Server (porta 1433 por padrão).
 *
 * ONDE CONFIGURAR: src/main/resources/application.properties
 *   pizzaria.db.nome     -> nome do banco
 *   pizzaria.db.usuario  -> usuário do SQL Server
 *   pizzaria.db.senha    -> senha do SQL Server
 *   (pizzaria.db.servidor e pizzaria.db.porta já vêm como localhost e 1433)
 *
 * Também é possível sobrescrever por variável de ambiente, sem mexer no arquivo:
 *   PIZZARIA_DB_NOME, PIZZARIA_DB_USUARIO, PIZZARIA_DB_SENHA, PIZZARIA_DB_SERVIDOR, PIZZARIA_DB_PORTA
 */
public class ConnectionFactory {

    private static final Properties PROPS = carregar();

    private static Properties carregar() {
        Properties p = new Properties();
        try (InputStream in = ConnectionFactory.class.getResourceAsStream("/application.properties")) {
            if (in != null) p.load(in);
        } catch (IOException e) {
            throw new IllegalStateException("Não foi possível ler application.properties", e);
        }
        return p;
    }

    private static String config(String chave, String variavelAmbiente, String padrao) {
        String env = System.getenv(variavelAmbiente);
        if (env != null && !env.isBlank()) return env;
        return PROPS.getProperty(chave, padrao).trim();
    }

    private static String url() {
        return "jdbc:sqlserver://" + config("pizzaria.db.servidor", "PIZZARIA_DB_SERVIDOR", "localhost")
                + ":" + config("pizzaria.db.porta", "PIZZARIA_DB_PORTA", "1433")
                + ";databaseName=" + config("pizzaria.db.nome", "PIZZARIA_DB_NOME", "")
                + ";encrypt=true;trustServerCertificate=true";
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(url(),
                config("pizzaria.db.usuario", "PIZZARIA_DB_USUARIO", ""),
                config("pizzaria.db.senha", "PIZZARIA_DB_SENHA", ""));
    }

    /** true se conseguir abrir uma conexão (usado pelo /api/health do front). */
    public static boolean estaOnline() {
        try (Connection conn = getConnection()) {
            return conn.isValid(3);
        } catch (SQLException e) {
            return false;
        }
    }
}
