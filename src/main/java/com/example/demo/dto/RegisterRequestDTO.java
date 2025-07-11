package com.example.demo.dto;

import lombok.Data;

@Data
public class RegisterRequestDTO {
    private String nom;
    private String email;
    private String password;
    private String role;
    private String matricule;
    private Integer departementId;
} 