package com.example.demo.entity;

import jakarta.persistence.*;
import java.util.List;
import lombok.Data;

@Data
@Entity
public class Utilisateur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String nom;
    private String email;
    private String password;
    private String role;
    private String matricule;

    @OneToMany(mappedBy = "utilisateur")
    private List<Notification> notifications;
} 