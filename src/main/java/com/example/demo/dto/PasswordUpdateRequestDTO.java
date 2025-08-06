package com.example.demo.dto;

import lombok.Data;

@Data
public class PasswordUpdateRequestDTO {
    private String currentPassword;
    private String newPassword;
    private String confirmPassword;
} 