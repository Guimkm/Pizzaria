package Pizzaria;

import Pizzaria.domain.Categoria;
import Pizzaria.domain.Ingrediente;
import Pizzaria.domain.Pizza;
import Pizzaria.service.Service;

import java.util.List;

public class Main {
    public static void main(String[] args) {
        // Teste rápido: salva uma pizza (com um ingrediente) e busca pelo nome.
        // A categoria 1 ("Especial") e o ingrediente 1 já devem existir no banco.
        Pizza pizza = Pizza.builder()
                .nome("Calabresa")
                .descricao("Calabresa com cebola")
                .tamanho("G")
                .preco(42.90)
                .ativa(true)
                .id_categoria(Categoria.builder().id_categoria(1).build())
                .ingredientes(List.of(Ingrediente.builder().id_ingrediente(1).build()))
                .build();
        Service.save(pizza);

        Service.findByName(Pizza.class, "Calabresa")
                .forEach(p -> System.out.printf("[%d] - %s (%s) R$ %.2f - %d ingrediente(s)%n",
                        p.getId_pizza(), p.getNome(), p.getTamanho(), p.getPreco(), p.getIngredientes().size()));
    }
}
