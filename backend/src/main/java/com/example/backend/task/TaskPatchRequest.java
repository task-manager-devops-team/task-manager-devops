package com.example.backend.task;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record TaskPatchRequest(
        @Size(max = 120) @Pattern(regexp = ".*\\S.*", message = "must not be blank") String title,
        @Size(max = 2000) String description,
        Priority priority,
        LocalDate dueDate,
        TaskStatus status,
        Boolean archived) {
}