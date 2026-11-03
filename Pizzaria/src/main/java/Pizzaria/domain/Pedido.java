package Pizzaria.domain;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.util.List;

@Builder
@Value
public class Pedido {
    Integer id_pedido;
    LocalDate data_pedido;
    Double valor_total;
    String status;
    String forma_pagamento;
    Cliente id_cliente;           // Realiza
    Funcionario id_funcionario;   // Atende (atribuído pelo painel; pode ser null logo após o checkout)
    List<Pizza> item_pedido;      // Contém (1,n): cada ocorrência da pizza na lista = 1 unidade
}
