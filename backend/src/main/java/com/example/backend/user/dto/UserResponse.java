package com.example.backend.user.dto;

import com.example.backend.user.domain.User;

public record UserResponse(Long id, String name) {

    public static UserResponse from(User u) {
        return new UserResponse(u.getId(), u.getName());
    }
}