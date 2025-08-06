package com.example.demo.service;

public interface EmailService {
    void sendPasswordEmail(String to, String nom, String generatedPassword);
    void sendEmail(String to, String subject, String content);
} 