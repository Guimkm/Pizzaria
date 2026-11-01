package Pizzaria.connection;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConnectionFactory {
    private static final String URL = "jdbc:sqlserver://localhost:1433;databaseName=PizzariaDB;encrypt=true;trustServerCertificate=true";
    private static final String USER = "pizzaria_user";
    private static final String PASSWORD = "Pizza@12345";

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}
