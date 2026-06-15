package com.collegesports.security;

import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Options requests are sent by browsers for CORS pre-flight, let them pass
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String uri = request.getRequestURI();

        // Allow auth endpoints to pass without token check
        if (uri.startsWith("/api/auth")) {
            return true;
        }

        // Only intercept API calls
        if (!uri.startsWith("/api")) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Authorization token is missing or malformed\"}");
            return false;
        }

        String token = authHeader.substring(7);

        try {
            DecodedJWT jwt = jwtUtil.verifyToken(token);
            String role = jwt.getClaim("role").asString();
            Integer userId = jwt.getClaim("userId").asInt();

            // Set request attributes for controllers to use
            request.setAttribute("userRole", role);
            request.setAttribute("userId", userId);

            // Role-based route protection
            if (uri.startsWith("/api/admin") && !"ADMIN".equals(role)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("{\"error\": \"Access denied. Admin role required.\"}");
                return false;
            }

            if (uri.startsWith("/api/coach") && !"COACH".equals(role)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("{\"error\": \"Access denied. Coach role required.\"}");
                return false;
            }

            if (uri.startsWith("/api/student") && !"STUDENT".equals(role) && !"ADMIN".equals(role) && !"COACH".equals(role)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("{\"error\": \"Access denied. Authorized role required.\"}");
                return false;
            }

            return true;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Invalid or expired token: " + e.getMessage() + "\"}");
            return false;
        }
    }
}
