package com.example.backend.task.repository;

import com.example.backend.task.domain.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import com.example.backend.task.domain.Priority;
import com.example.backend.task.domain.TaskStatus;
import java.time.LocalDate;

public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {
    long countByArchivedFalse();

    long countByArchivedFalseAndStatus(TaskStatus status);

    long countByArchivedFalseAndPriority(Priority priority);

    long countByArchivedFalseAndStatusNotAndDueDateBefore(TaskStatus status, LocalDate date);
}