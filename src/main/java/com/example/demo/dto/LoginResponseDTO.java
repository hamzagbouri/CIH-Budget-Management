package com.example.demo.dto;

import lombok.Data;

@Data
public class LoginResponseDTO {
    private String token;
    private UtilisateurDTO user;
    private String message;
    private boolean success;
} 