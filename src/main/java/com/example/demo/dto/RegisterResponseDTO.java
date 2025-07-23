package com.example.demo.dto;

import lombok.Data;

public class RegisterResponseDTO {
    private boolean success;
    private UtilisateurDTO user;
    private String message;

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
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
} 