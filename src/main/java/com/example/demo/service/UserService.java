package com.example.demo.service;

import com.example.demo.dto.*;
import java.util.List;

public interface UserService {
    // Dashboard
    UserDashboardDTO getUserDashboard(Integer annee);
    
    // Profile Management
    UserProfileDTO getUserProfile();
    UserProfileDTO updateUserProfile(UserProfileDTO profileDTO);
    void updatePassword(PasswordUpdateRequestDTO request);
    
    // Password Management
    void forgotPassword(ForgotPasswordRequestDTO request);
    void resetPassword(ResetPasswordRequestDTO request);
    
    // Expense Management (User's department only)
    List<DepenseDTO> getUserDepartmentExpenses(Integer annee, String status, String prestataire);
    DepenseDTO getUserDepartmentExpense(Integer id);
    DepenseDTO createUserDepartmentExpense(DepenseDTO depenseDTO);
    DepenseDTO updateUserDepartmentExpense(Integer id, DepenseDTO depenseDTO);
    void deleteUserDepartmentExpense(Integer id);
    
    // Analytics
    Object getUserDepartmentAnalytics(Integer annee);
    List<String> getPrestataires();
} 