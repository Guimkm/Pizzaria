package Pizzaria.domain;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;

@Builder
@Value
public class Cliente {
    Integer id_cliente;
    String nome;
    String cpf;
    String email;
    String senha;
    LocalDate data_cadastro;
}
