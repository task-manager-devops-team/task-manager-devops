package com.example.backend.stats.dto;

import com.example.backend.task.domain.Priority;
import com.example.backend.task.domain.TaskStatus;
import java.util.Map;

public record StatsResponse(
        long total,
        long overdue,
        Map<TaskStatus, Long> byStatus,
        Map<Priority, Long> byPriority) {
}