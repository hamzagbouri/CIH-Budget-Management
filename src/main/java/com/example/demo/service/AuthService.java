package com.example.demo.service;

import com.example.demo.dto.LoginRequestDTO;
import com.example.demo.dto.LoginResponseDTO;
import com.example.demo.dto.PasswordUpdateDTO;
import com.example.demo.dto.PasswordUpdateResponseDTO;
import com.example.demo.dto.RegisterRequestDTO;
import com.example.demo.dto.RegisterResponseDTO;

public interface AuthService {
    LoginResponseDTO login(LoginRequestDTO loginRequest);
    RegisterResponseDTO register(RegisterRequestDTO registerRequest);
    PasswordUpdateResponseDTO updatePassword(Integer userId, PasswordUpdateDTO passwordUpdateDTO);
} 