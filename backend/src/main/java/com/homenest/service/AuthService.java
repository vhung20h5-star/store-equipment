package com.homenest.service;

import com.homenest.dto.AuthResponseDTO;
import com.homenest.dto.LoginRequest;
import com.homenest.dto.RegisterRequest;
import com.homenest.dto.UpdateProfileRequest;
import com.homenest.dto.UserResponseDTO;

public interface AuthService {

    AuthResponseDTO register(RegisterRequest request);

    AuthResponseDTO login(LoginRequest request);

    UserResponseDTO getCurrentUser(String email);

    UserResponseDTO updateProfile(String email, UpdateProfileRequest request);
}

