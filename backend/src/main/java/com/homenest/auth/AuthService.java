package com.homenest.auth;

public interface AuthService {

    AuthResponseDTO register(RegisterRequest request);

    AuthResponseDTO login(LoginRequest request);

    UserResponseDTO getCurrentUser(String email);

    UserResponseDTO updateProfile(String email, UpdateProfileRequest request);
}

