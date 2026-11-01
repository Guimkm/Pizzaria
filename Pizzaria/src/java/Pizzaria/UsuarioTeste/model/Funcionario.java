package Pizzaria.UsuarioTeste.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Funcionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_funcionario")
    private Integer idFuncionario;

    private String nome;

    // Começa NULL. Enquanto for nulo, o funcionário NÃO consegue logar.
    private String cargo;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String senha; // HASH

    private String telefone;

    @Column(name = "data_admissao")
    private LocalDate dataAdmissao;

    @PrePersist
    void antesDeSalvar() { if (dataAdmissao == null) dataAdmissao = LocalDate.now(); }

    public Integer getIdFuncionario() { return idFuncionario; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getCargo() { return cargo; }
    public void setCargo(String cargo) { this.cargo = cargo; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public LocalDate getDataAdmissao() { return dataAdmissao; }
}