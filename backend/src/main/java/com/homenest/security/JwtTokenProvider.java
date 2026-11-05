package com.homenest.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenProvider {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.jwt.secret:homenest-secure-production-ready-jwt-secret-key-2026-very-long-and-safe}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms:604800000}") // 7 days default
    private long jwtExpirationMs;

    public String generateToken(Long userId, String email, String fullName, String role) {
        try {
            long now = System.currentTimeMillis();
            long exp = now + jwtExpirationMs;

            Map<String, Object> header = new HashMap<>();
            header.put("alg", "HS256");
            header.put("typ", "JWT");

            Map<String, Object> payload = new HashMap<>();
            payload.put("sub", email);
            payload.put("userId", userId);
            payload.put("fullName", fullName);
            payload.put("role", role);
            payload.put("iat", now / 1000);
            payload.put("exp", exp / 1000);

            String headerEncoded = Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(objectMapper.writeValueAsBytes(header));
            String payloadEncoded = Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(objectMapper.writeValueAsBytes(payload));

            String dataToSign = headerEncoded + "." + payloadEncoded;
            String signature = sign(dataToSign);

            return dataToSign + "." + signature;
        } catch (Exception e) {
            throw new RuntimeException("Error generating JWT token", e);
        }
    }

    public boolean validateToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            return false;
        }
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return false;
        }

        try {
            String dataToSign = parts[0] + "." + parts[1];
            String expectedSignature = sign(dataToSign);
            if (!MessageDigest.isEqual(parts[2].getBytes(StandardCharsets.UTF_8), expectedSignature.getBytes(StandardCharsets.UTF_8))) {
                return false;
            }

            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            JsonNode payloadNode = objectMapper.readTree(payloadBytes);

            if (payloadNode.has("exp")) {
                long exp = payloadNode.get("exp").asLong();
                long now = System.currentTimeMillis() / 1000;
                if (now > exp) {
                    return false;
                }
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String getEmailFromToken(String token) {
        return getClaim(token, "sub");
    }

    public Long getUserIdFromToken(String token) {
        String val = getClaim(token, "userId");
        return val != null ? Long.parseLong(val) : null;
    }

    public String getRoleFromToken(String token) {
        return getClaim(token, "role");
    }

    private String getClaim(String token, String claimKey) {
        try {
            String[] parts = token.split("\\.");
            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            JsonNode node = objectMapper.readTree(payloadBytes);
            return node.has(claimKey) ? node.get(claimKey).asText() : null;
        } catch (Exception e) {
            return null;
        }
    }

    private String sign(String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(jwtSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKey);
        byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(rawHmac);
    }
}

