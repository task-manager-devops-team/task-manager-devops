package com.example.backend.task.dto;

import com.example.backend.task.domain.Priority;
import com.example.backend.task.domain.TaskStatus;
import java.time.LocalDate;
import java.util.List;

public record TaskFilter(
        String q,
        List<TaskStatus> status,
        List<Priority> priority,
        LocalDate dueFrom,
        LocalDate dueTo,
        Boolean archived,
        String sort,
        String order) {
}
