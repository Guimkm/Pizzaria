package Pizzaria.UsuarioTeste.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Integer idCliente;

    private String nome;

    @Column(unique = true, nullable = false)
    private String cpf;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String senha; // guarda o HASH, nunca a senha pura

    @Column(name = "data_cadastro")
    private LocalDate dataCadastro;

    @PrePersist
    void antesDeSalvar() { if (dataCadastro == null) dataCadastro = LocalDate.now(); }

    public Integer getIdCliente() { return idCliente; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public LocalDate getDataCadastro() { return dataCadastro; }
}