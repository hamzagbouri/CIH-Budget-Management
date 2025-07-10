package com.example.demo.controller;

import com.example.demo.dto.NotificationDTO;
import com.example.demo.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notification", description = "API de gestion des notifications")
public class NotificationController {
    @Autowired
    private NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Liste toutes les notifications")
    public List<NotificationDTO> getAll() {
        return notificationService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupère une notification par son id")
    public NotificationDTO getById(@PathVariable Integer id) {
        return notificationService.findById(id);
    }

    @PostMapping
    @Operation(summary = "Crée une nouvelle notification")
    public NotificationDTO create(@RequestBody NotificationDTO notificationDTO) {
        return notificationService.save(notificationDTO);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Met à jour une notification")
    public NotificationDTO update(@PathVariable Integer id, @RequestBody NotificationDTO notificationDTO) {
        return notificationService.update(id, notificationDTO);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprime une notification")
    public void delete(@PathVariable Integer id) {
        notificationService.delete(id);
    }
} 