package com.example.demo.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI myOpenAPI() {
        Server devServer = new Server();
        devServer.setUrl("http://localhost:8080");
        devServer.setDescription("Serveur de développement");

        Server prodServer = new Server();
        prodServer.setUrl("https://api.company.com");
        prodServer.setDescription("Serveur de production");

        Contact contact = new Contact();
        contact.setEmail("dev@company.com");
        contact.setName("Équipe de Développement");
        contact.setUrl("https://company.com");

        License mitLicense = new License()
                .name("MIT License")
                .url("https://opensource.org/licenses/MIT");

        Info info = new Info()
                .title("Système de Gestion de Budget et Dépenses API")
                .version("1.0.0")
                .contact(contact)
                .description("""
                        ## Description
                        API complète pour la gestion de budget et dépenses par département.
                        
                        ## Fonctionnalités Principales
                        - **Authentification** : Connexion, inscription, gestion des mots de passe
                        - **Gestion des Utilisateurs** : Profils, tableaux de bord, gestion des responsables
                        - **Gestion des Départements** : CRUD, budgets, analytics
                        - **Gestion des Dépenses** : Création, validation, suivi
                        - **Gestion des Budgets** : Attribution, suivi, reporting
                        - **Notifications** : Système de notifications
                        
                        ## Rôles Utilisateurs
                        - **ADMIN** : Accès complet à toutes les fonctionnalités
                        - **USER** : Responsable de département (gestion des dépenses de son département)
                        
                        ## Authentification
                        L'API utilise JWT (JSON Web Tokens) pour l'authentification.
                        Incluez le token dans le header Authorization : `Bearer <token>`
                        """)
                .termsOfService("https://company.com/terms")
                .license(mitLicense);

        return new OpenAPI()
                .info(info)
                .servers(List.of(devServer, prodServer))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT token d'authentification")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
} 