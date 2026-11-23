package com.example.backend.stats.service;

import com.example.backend.stats.dto.StatsResponse;
import com.example.backend.task.domain.Priority;
import com.example.backend.task.domain.TaskStatus;
import com.example.backend.task.repository.TaskRepository;
import java.time.LocalDate;
import java.util.EnumMap;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class StatsService {

    private final TaskRepository repository;

    public StatsService(TaskRepository repository) {
        this.repository = repository;
    }

    public StatsResponse compute() {
        Map<TaskStatus, Long> byStatus = new EnumMap<>(TaskStatus.class);
        for (TaskStatus status : TaskStatus.values()) {
            byStatus.put(status, repository.countByArchivedFalseAndStatus(status));
        }

        Map<Priority, Long> byPriority = new EnumMap<>(Priority.class);
        for (Priority priority : Priority.values()) {
            byPriority.put(priority, repository.countByArchivedFalseAndPriority(priority));
        }

        long overdue = repository.countByArchivedFalseAndStatusNotAndDueDateBefore(
                TaskStatus.DONE, LocalDate.now());

        return new StatsResponse(repository.countByArchivedFalse(), overdue, byStatus, byPriority);
    }
}