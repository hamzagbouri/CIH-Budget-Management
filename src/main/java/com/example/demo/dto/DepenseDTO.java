package com.example.demo.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class DepenseDTO {
    private Integer id;
    private String titre;
    private String description;
    private String type;
    private LocalDate date;
    private Float montant;
    private Integer departementId;
    private String status;
    private String prestataire;
} 