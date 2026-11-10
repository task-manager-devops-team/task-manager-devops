package com.example.backend.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record TaskRequest(
        @NotBlank @Size(max = 120) String title,
        @Size(max = 2000) String description,
        Priority priority,
        LocalDate dueDate,
        TaskStatus status,
        Boolean archived) {
}