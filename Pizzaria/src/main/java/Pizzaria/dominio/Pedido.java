package Pizzaria.dominio;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class Pedido {
    Integer id_pedido;
    LocalDate data_pedido;
    Double valor_total;
    String status;
    String forma_pagamento;
    Cliente id_cliente;
    Funcionario id_funcionario;
}
