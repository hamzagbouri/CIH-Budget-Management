package com.example.demo.dto;

import lombok.Data;

public class LoginResponseDTO {
    private String token;
    private UtilisateurDTO user;
    private String message;
    private boolean success;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UtilisateurDTO getUser() {
        return user;
    }

    public void setUser(UtilisateurDTO user) {
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }
} 