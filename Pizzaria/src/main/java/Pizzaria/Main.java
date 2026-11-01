package Pizzaria;

import Pizzaria.dominio.Cliente;
import Pizzaria.dominio.Endereco;
import Pizzaria.dominio.Ingrediente;
import Pizzaria.dominio.Pizza;
import Pizzaria.service.Service;

public class Main {
    public static void main(String[] args) {

        Cliente cliente = Cliente.builder()
                .nome("Maria").cpf("123.456.789-00").email("maria@email.com")
                .senha("123").telefone("(11) 99999-9999")
                .id_endereco(Endereco.builder()
                        .rua("Rua A").numero("10").bairro("Centro")
                        .cidade("São Paulo").cep("01000-000").build())
                .build();
        Service.save(cliente);
        Service.findByName(Cliente.class, "Maria").forEach(c ->
                System.out.println(c.getNome() + " - " + c.getId_endereco().getRua()));



        // Teste rápido: salva uma pizza e busca pelo nome.
        // A categoria 1 ("Especial") já existe no script PizzariaDB_Completo.
        Ingrediente[] array = {Ingrediente.builder().id_ingrediente(12).nome("dsf").unidade("ahhh").quantidade(12).preco_unitario(120D).build()};
        Pizza pizza = Pizza.builder()
                .nome("Calabresa")
                .descricao("Calabresa com cebola")
                .tamanho("G")
                .preco(42.90)
                .ativa(true)
                .categoria("Especial")
                .ingredientes(array)
                .build();
        Service.save(pizza);

        Service.findByName(Pizza.class, "Calabresa")
                .forEach(p -> System.out.printf("[%d] - %s (%s) R$ %.2f%n",
                        p.getId_pizza(), p.getNome(), p.getTamanho(), p.getPreco()));
    }
}
