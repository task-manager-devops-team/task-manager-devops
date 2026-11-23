package com.example.backend.user.service;

import com.example.backend.user.dto.UserResponse;
import com.example.backend.user.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public List<UserResponse> list() {
        return repository.findAllByOrderByNameAsc().stream()
                .map(UserResponse::from)
                .toList();
    }
}