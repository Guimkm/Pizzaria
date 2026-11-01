package Pizzaria.domain;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;

@Builder
@Value
public class Funcionario {
    Integer id_funcionario;
    String nome;
    String cargo;
    String email;
    String senha;
    String telefone;
    LocalDate data_admissao;
}
