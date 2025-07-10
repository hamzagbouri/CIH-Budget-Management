package com.example.demo.dto;

import java.time.LocalDate;
import lombok.Data;

@Data
public class DepenseDTO {
    private Integer id;
    private String titre;
    private String description;
    private String type;
    private LocalDate date;
    private Float montant;
    private Integer departementId;
    // getters & setters
} 