/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package controle;

/**
 *
 * @author Koragem
 * 
 */

import javax.swing.JFrame;

public class Main {
    public static void main(String[] args) {
        TelaLogin app = new TelaLogin (); // Instancia diretamente sem precisar de import
        app.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        app.setVisible(true);
        app.setLocationRelativeTo(null);

    }
}
