package com.example.demo.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserProfileDTO {
    private Integer id;
    private String nom;
    private String email;
    private String matricule;
    private String role;
    private DepartementDTO departementActuel;
    private List<DepartementDTO> departementsPrecedents;
    private List<ResponsableDepartementDTO> historiqueResponsabilites;
} 