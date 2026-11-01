package Pizzaria.UsuarioTeste.util;

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

public final class Util {

    private Util() {}

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
        String[] p = armazenado.split(":");
        byte[] salt = Base64.getDecoder().decode(p[0]);
        byte[] esperado = Base64.getDecoder().decode(p[1]);
        return MessageDigest.isEqual(esperado, pbkdf2(senha, salt));
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

    public static void iniciarSessao(HttpServletRequest request, Integer id, String tipo,
                                     String nome, String cargo, String pagina, boolean lembrar) {
        HttpSession session = request.getSession(true);
        request.changeSessionId(); // evita session fixation
        session.setAttribute("id", id);
        session.setAttribute("tipo", tipo);
        session.setAttribute("nome", nome);
        session.setAttribute("cargo", cargo);
        session.setAttribute("pagina", pagina);
        // 14 dias se marcou "manter conectado", senão 30 minutos de inatividade
        session.setMaxInactiveInterval(lembrar ? 14 * 24 * 3600 : 30 * 60);
    }
}