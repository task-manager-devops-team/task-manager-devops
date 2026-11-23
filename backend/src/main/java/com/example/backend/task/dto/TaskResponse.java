package com.example.backend.task.dto;

import com.example.backend.task.domain.Priority;
import com.example.backend.task.domain.Task;
import com.example.backend.task.domain.TaskStatus;
import java.time.LocalDate;

public record TaskResponse(
        Long id,
        String title,
        String description,
        Priority priority,
        LocalDate dueDate,
        TaskStatus status,
        boolean archived,
        Long assigneeId,
        String assigneeName) {

    public static TaskResponse from(Task t) {
        return new TaskResponse(t.getId(), t.getTitle(), t.getDescription(),
                t.getPriority(), t.getDueDate(), t.getStatus(), t.isArchived(),
                t.getAssignee() == null ? null : t.getAssignee().getId(),
                t.getAssignee() == null ? null : t.getAssignee().getName());
    }
}