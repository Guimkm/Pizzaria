package Pizzaria.util;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.regex.Pattern;

public final class Util {

    private Util() {}

    /** Formato básico de e-mail (a regra de domínio @PizzariaSabores fica no FuncionarioController). */
    public static final Pattern EMAIL_VALIDO = Pattern.compile("^[\\w.+-]+@[\\w-]+(\\.[\\w-]+)*$");

    /** Banco fora do ar: o front trata 503 como "sem backend" e cai no modo demonstração. */
    public static boolean bancoOnline() {
        return Pizzaria.connection.ConnectionFactory.estaOnline();
    }

    public static ResponseEntity<Map<String, String>> bancoIndisponivel() {
        return erro(HttpStatus.SERVICE_UNAVAILABLE, "Banco de dados indisponível. Tente novamente em instantes.");
    }

    // ---------- respostas e validações ----------

    public static ResponseEntity<Map<String, String>> erro(HttpStatus status, String msg) {
        return ResponseEntity.status(status).body(Map.of("erro", msg));
    }

    public static boolean vazio(String s) {
        return s == null || s.isBlank();
    }

    public static String soDigitos(String s) {
        return s == null ? "" : s.replaceAll("\\D", "");
    }

    // ---------- hash de senha (PBKDF2, já vem no JDK) ----------

    public static String gerarHash(String senha) {
        byte[] salt = new byte[16];
        new SecureRandom().nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt) + ":"
                + Base64.getEncoder().encodeToString(pbkdf2(senha, salt));
    }

    public static boolean conferirHash(String senha, String armazenado) {
        // [CORRIGIDO] Dados antigos em texto puro ou hashes incompletos não podem
        // derrubar o endpoint de login; são rejeitados e devem ser recadastrados.
        if (senha == null || armazenado == null) return false;
        String[] p = armazenado.split(":", -1);
        if (p.length != 2 || p[0].isBlank() || p[1].isBlank()) return false;
        try {
            byte[] salt = Base64.getDecoder().decode(p[0]);
            byte[] esperado = Base64.getDecoder().decode(p[1]);
            if (salt.length == 0 || esperado.length != 32) return false;
            return MessageDigest.isEqual(esperado, pbkdf2(senha, salt));
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    private static byte[] pbkdf2(String senha, byte[] salt) {
        try {
            var spec = new PBEKeySpec(senha.toCharArray(), salt, 210_000, 256);
            return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    // ---------- sessão ----------

    /**
     * [NOVO] true se a sessão pertence a um FUNCIONÁRIO logado.
     * Usada para proteger as listagens do painel (clientes, pedidos, estoque...),
     * que antes respondiam para qualquer pessoa, mesmo sem login.
     */
    public static boolean ehFuncionario(HttpSession session) {
        return session != null && session.getAttribute("id") != null
                && "FUNCIONARIO".equals(session.getAttribute("tipo"));
    }

    /** [NOVO] Resposta padrão 401 para as rotas restritas ao painel do funcionário. */
    public static ResponseEntity<Map<String, String>> soFuncionario() {
        return erro(HttpStatus.UNAUTHORIZED, "Acesso restrito a funcionários. Faça login.");
    }

    /**
     * [ATUALIZADO] Agora a sessão também guarda e-mail, telefone e endereço.
     * Motivo: o front novo usa GET /api/me para reconstruir a sessão no
     * navegador (localStorage é apenas cache) e a página "Minha conta" precisa
     * desses dados sem ter de chamar outro endpoint.
     * Mantida a versão antiga (sem esses campos) por compatibilidade.
     */
    public static void iniciarSessao(HttpServletRequest request, Integer id, String tipo,
                                     String nome, String cargo, String pagina, boolean lembrar,
                                     String email, String telefone, String endereco) {
        HttpSession session = request.getSession(true);
        request.changeSessionId(); // evita session fixation
        session.setAttribute("id", id);
        session.setAttribute("tipo", tipo);     // CLIENTE ou FUNCIONARIO
        session.setAttribute("nome", nome);
        session.setAttribute("cargo", cargo);   // nulo para cliente
        session.setAttribute("pagina", pagina);
        session.setAttribute("email", email);
        session.setAttribute("telefone", telefone);
        session.setAttribute("endereco", endereco);
        // 14 dias se marcou "manter conectado", senão 30 minutos de inatividade
        session.setMaxInactiveInterval(lembrar ? 14 * 24 * 3600 : 30 * 60);
    }

    // Versão sem e-mail/telefone/endereço (código legado que ainda exista chamando)
    public static void iniciarSessao(HttpServletRequest request, Integer id, String tipo,
                                     String nome, String cargo, String pagina, boolean lembrar) {
        iniciarSessao(request, id, tipo, nome, cargo, pagina, lembrar, null, null, null);
    }
}