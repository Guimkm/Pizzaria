package Pizzaria.dominio;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class Cliente {
    Integer id_cliente;
    String nome;
    String cpf;
    String email;
    String senha;
    String telefone;
    LocalDate data_cadastro;
    Endereco endereco;
}
