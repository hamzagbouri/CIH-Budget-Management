package com.example.demo.service.impl;

import com.example.demo.dto.NotificationDTO;
import com.example.demo.entity.Notification;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    private NotificationDTO toDTO(Notification n) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(n.getId());
        if (n.getUtilisateur() != null) dto.setUtilisateurId(n.getUtilisateur().getId());
        return dto;
    }

    private Notification toEntity(NotificationDTO dto) {
        Notification n = new Notification();
        n.setId(dto.getId());
        // Pour utilisateur, il faut injecter UtilisateurRepository si besoin
        return n;
    }

    @Override
    public List<NotificationDTO> findAll() {
        return notificationRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public NotificationDTO findById(Integer id) {
        return notificationRepository.findById(id).map(this::toDTO).orElse(null);
    }

    @Override
    public NotificationDTO save(NotificationDTO notificationDTO) {
        Notification n = toEntity(notificationDTO);
        return toDTO(notificationRepository.save(n));
    }

    @Override
    public NotificationDTO update(Integer id, NotificationDTO notificationDTO) {
        Notification n = toEntity(notificationDTO);
        n.setId(id);
        return toDTO(notificationRepository.save(n));
    }

    @Override
    public void delete(Integer id) {
        notificationRepository.deleteById(id);
    }
} 