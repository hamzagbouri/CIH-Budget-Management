package com.example.demo.config;

import com.example.demo.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // Skip JWT processing for authentication endpoints
        String requestURI = request.getRequestURI();
        if (requestURI.startsWith("/api/auth/")) {
            logger.info("Skipping JWT processing for auth endpoint: " + requestURI);
            filterChain.doFilter(request, response);
            return;
        }
        
        final String authorizationHeader = request.getHeader("Authorization");
        logger.info("Processing request: " + requestURI + " with Authorization: " + (authorizationHeader != null ? "present" : "missing"));

        String username = null;
        String jwt = null;
        String role = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                role = jwtUtil.extractClaim(jwt, claims -> claims.get("role", String.class));
                logger.info("Extracted username: " + username + ", role: " + role);
            } catch (Exception e) {
                logger.error("Error extracting JWT token: " + e.getMessage());
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                if (jwtUtil.validateToken(jwt)) {
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        username, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                    );
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    logger.info("Authentication set for user: " + username);
                } else {
                    logger.warn("Token validation failed for user: " + username);
                }
            } catch (Exception e) {
                logger.error("Error validating token: " + e.getMessage());
            }
        } else {
            logger.info("No authentication set - username: " + username + ", existing auth: " + (SecurityContextHolder.getContext().getAuthentication() != null));
        }
        
        filterChain.doFilter(request, response);
    }
} 