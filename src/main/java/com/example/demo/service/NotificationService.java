package com.example.demo.service;

import com.example.demo.dto.NotificationDTO;
import java.util.List;

public interface NotificationService {
    List<NotificationDTO> findAll();
    NotificationDTO findById(Integer id);
    NotificationDTO save(NotificationDTO notificationDTO);
    NotificationDTO update(Integer id, NotificationDTO notificationDTO);
    void delete(Integer id);
} 