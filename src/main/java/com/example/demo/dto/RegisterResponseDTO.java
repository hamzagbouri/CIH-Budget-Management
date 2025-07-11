package com.example.demo.dto;

import lombok.Data;

@Data
public class RegisterResponseDTO {
    private boolean success;
    private UtilisateurDTO user;
    private String message;
} 