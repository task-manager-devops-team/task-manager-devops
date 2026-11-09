package com.example.backend.task;

import java.time.LocalDate;

public record TaskResponse(
        Long id,
        String title,
        String description,
        Priority priority,
        LocalDate dueDate,
        TaskStatus status) {

    public static TaskResponse from(Task t) {
        return new TaskResponse(t.getId(), t.getTitle(), t.getDescription(),
                t.getPriority(), t.getDueDate(), t.getStatus());
    }
}