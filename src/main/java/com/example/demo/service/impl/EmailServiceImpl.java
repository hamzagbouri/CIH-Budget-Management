package com.example.demo.service.impl;

import com.example.demo.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Override
    public void sendPasswordEmail(String to, String nom, String generatedPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Vos identifiants de connexion - Gestion des départements");
        message.setText(
            "Bonjour " + nom + ",\n\n" +
            "Votre compte responsable de département a été créé avec succès.\n\n" +
            "Vos identifiants de connexion :\n" +
            "Email : " + to + "\n" +
            "Mot de passe temporaire : " + generatedPassword + "\n\n" +
            "Veuillez changer votre mot de passe lors de votre première connexion.\n\n" +
            "Cordialement,\n" +
            "L'équipe de gestion des départements"
        );
        
        mailSender.send(message);
    }
    
    @Override
    public void sendEmail(String to, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        mailSender.send(message);
    }
} 