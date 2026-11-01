package Pizzaria;

import Pizzaria.domain.Categoria;
import Pizzaria.domain.Pizza;
import Pizzaria.service.Service;

public class Main {
    public static void main(String[] args) {
        // Teste rápido: salva uma pizza e busca pelo nome.
        // A categoria 1 ("Especial") já existe no script PizzariaDB_Completo.
        Pizza pizza = Pizza.builder()
                .nome("Calabresa")
                .descricao("Calabresa com cebola")
                .tamanho("G")
                .preco(42.90)
                .ativa(true)
                .id_categoria(Categoria.builder().id_categoria(1).build())
                .build();
        Service.save(pizza);

        Service.findByName(Pizza.class, "Calabresa")
                .forEach(p -> System.out.printf("[%d] - %s (%s) R$ %.2f%n",
                        p.getId_pizza(), p.getNome(), p.getTamanho(), p.getPreco()));
    }
}
