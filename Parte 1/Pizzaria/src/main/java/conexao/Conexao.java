/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package conexao;

import javax.swing.JOptionPane;
import java.sql.*;
        
        
        
public class Conexao {
    
    final private String driver = "com.mysql.jdbc.Driver";//definição do driver MySql para acesso aos dados
    final private String url = "jdbc:mysql://127.0.0.1/clientes";//acesso ao bd clientes no servidor - easyphp
    final private String usuario = "root"; //usuário do MySql - easyphp
    final private String senha = ""; //senha do Mysql -easyphp    
    private Connection conexao;//variável que armazenará a conexão aberta
    public Statement statement;//variável para a ecução dos comandos SQL dentro do ambiente Java
    public ResultSet resultset;// variável que armazenará o resultado da execução de um comando SQL
    
    
    
    public boolean conecta(){
    boolean result = true;
    try {
        Class.forName(driver);
        conexao = DriverManager.getConnection(url,usuario,senha);
        JOptionPane.showMessageDialog(null, "Conexão estabelecida", "Mensagem do Programa", JOptionPane.INFORMATION_MESSAGE);
    }catch (ClassNotFoundException Driver){
        JOptionPane.showMessageDialog(null, "Driver não localizado" + Driver, "Mensagem do Programa", JOptionPane.INFORMATION_MESSAGE);
        result = false;
    
    }catch(SQLException Fonte){
        JOptionPane.showMessageDialog(null, "Fonte de dados não localizada" + Fonte , "Mensagem do Programa",JOptionPane.INFORMATION_MESSAGE);
        result = false;
    
    }
    return result;
    
    }
    
    public void desconecta() {
        try {
            conexao.close();
            JOptionPane.showMessageDialog(null, "Conexão fechada", "Mensagem do Programa", JOptionPane.INFORMATION_MESSAGE);
        } catch (SQLException fecha) {
            JOptionPane.showMessageDialog(null, "Erro ao fechar conexão: " + fecha, "Mensagem do Programa", JOptionPane.INFORMATION_MESSAGE);
        }
    }

    public void executaSQL(String sql) {
        try {
            statement = conexao.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
            resultset = statement.executeQuery(sql);
        } catch (SQLException excecao) {
            JOptionPane.showMessageDialog(null, "Erro no comando SQL: " + excecao, "Mensagem do Programa", JOptionPane.INFORMATION_MESSAGE);
        }
    
    }
       
}
