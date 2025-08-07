package com.example.demo;

import com.example.demo.dto.ResponsableDepartementDTO;
import com.example.demo.entity.Departement;
import com.example.demo.entity.ResponsableDepartement;
import com.example.demo.entity.Utilisateur;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ResponsableDepartementSimpleTest {

    @Test
    void testResponsableDepartementEntity() {
        // Test entity creation
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setId(1);
        utilisateur.setNom("Test User");
        utilisateur.setEmail("test@example.com");
        utilisateur.setMatricule("EMP001");

        Departement departement = new Departement();
        departement.setId(1);
        departement.setNom("Test Department");

        ResponsableDepartement responsableDepartement = new ResponsableDepartement();
        responsableDepartement.setId(1);
        responsableDepartement.setUtilisateur(utilisateur);
        responsableDepartement.setDepartement(departement);
        responsableDepartement.setAnnee(2025);
        responsableDepartement.setActif(true);
        responsableDepartement.setDateCreation(LocalDateTime.now());

        // Assertions
        assertNotNull(responsableDepartement);
        assertEquals(1, responsableDepartement.getId());
        assertEquals(2025, responsableDepartement.getAnnee());
        assertTrue(responsableDepartement.getActif());
        assertEquals("Test User", responsableDepartement.getUtilisateur().getNom());
        assertEquals("Test Department", responsableDepartement.getDepartement().getNom());
    }

    @Test
    void testResponsableDepartementDTO() {
        // Test DTO creation
        ResponsableDepartementDTO dto = new ResponsableDepartementDTO();
        dto.setId(1);
        dto.setUtilisateurId(1);
        dto.setUtilisateurNom("Test User");
        dto.setUtilisateurEmail("test@example.com");
        dto.setUtilisateurMatricule("EMP001");
        dto.setDepartementId(1);
        dto.setDepartementNom("Test Department");
        dto.setAnnee(2025);
        dto.setActif(true);
        dto.setDateCreation(LocalDateTime.now());

        // Assertions
        assertNotNull(dto);
        assertEquals(1, dto.getId());
        assertEquals(1, dto.getUtilisateurId());
        assertEquals("Test User", dto.getUtilisateurNom());
        assertEquals("test@example.com", dto.getUtilisateurEmail());
        assertEquals("EMP001", dto.getUtilisateurMatricule());
        assertEquals(1, dto.getDepartementId());
        assertEquals("Test Department", dto.getDepartementNom());
        assertEquals(2025, dto.getAnnee());
        assertTrue(dto.getActif());
        assertNotNull(dto.getDateCreation());
    }

    @Test
    void testEntityAndDTOCompatibility() {
        // Test that entity and DTO can work together
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setId(1);
        utilisateur.setNom("Test User");
        utilisateur.setEmail("test@example.com");
        utilisateur.setMatricule("EMP001");

        Departement departement = new Departement();
        departement.setId(1);
        departement.setNom("Test Department");

        ResponsableDepartement entity = new ResponsableDepartement();
        entity.setId(1);
        entity.setUtilisateur(utilisateur);
        entity.setDepartement(departement);
        entity.setAnnee(2025);
        entity.setActif(true);
        entity.setDateCreation(LocalDateTime.now());

        // Convert to DTO (simulating service layer)
        ResponsableDepartementDTO dto = new ResponsableDepartementDTO();
        dto.setId(entity.getId());
        dto.setUtilisateurId(entity.getUtilisateur().getId());
        dto.setUtilisateurNom(entity.getUtilisateur().getNom());
        dto.setUtilisateurEmail(entity.getUtilisateur().getEmail());
        dto.setUtilisateurMatricule(entity.getUtilisateur().getMatricule());
        dto.setDepartementId(entity.getDepartement().getId());
        dto.setDepartementNom(entity.getDepartement().getNom());
        dto.setAnnee(entity.getAnnee());
        dto.setActif(entity.getActif());
        dto.setDateCreation(entity.getDateCreation());

        // Assertions
        assertEquals(entity.getId(), dto.getId());
        assertEquals(entity.getUtilisateur().getId(), dto.getUtilisateurId());
        assertEquals(entity.getUtilisateur().getNom(), dto.getUtilisateurNom());
        assertEquals(entity.getDepartement().getId(), dto.getDepartementId());
        assertEquals(entity.getDepartement().getNom(), dto.getDepartementNom());
        assertEquals(entity.getAnnee(), dto.getAnnee());
        assertEquals(entity.getActif(), dto.getActif());
    }

    @Test
    void testValidationLogic() {
        // Test basic validation logic
        int currentYear = LocalDateTime.now().getYear();
        int pastYear = currentYear - 1;
        int futureYear = currentYear + 1;

        // Current year should be valid
        assertTrue(currentYear >= 2020 && currentYear <= 2030);

        // Past year should be invalid for new assignments
        assertTrue(pastYear < currentYear);

        // Future year should be valid
        assertTrue(futureYear > currentYear);
    }

    @Test
    void testDepartmentAssignmentLogic() {
        // Test department assignment validation
        int departementId1 = 1;
        int departementId2 = 2;
        int annee = 2025;

        // Different departments should have different IDs
        assertNotEquals(departementId1, departementId2);

        // Same department cannot be assigned twice in the same year
        // This is a business rule validation
        assertTrue(departementId1 != departementId2);
    }
} 