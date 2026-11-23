package com.example.backend.task.dto;

import com.example.backend.task.domain.Priority;
import com.example.backend.task.domain.TaskStatus;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class TaskPatchRequest {

    @Pattern(regexp = ".*\\S.*", message = "must not be blank")
    @Size(max = 120)
    private String title;

    @Size(max = 2000)
    private String description;

    private Priority priority;
    private LocalDate dueDate;
    private TaskStatus status;
    private Boolean archived;
    private Long assigneeId;
    private boolean assigneeIdProvided;

    public String title() { return title; }
    public String description() { return description; }
    public Priority priority() { return priority; }
    public LocalDate dueDate() { return dueDate; }
    public TaskStatus status() { return status; }
    public Boolean archived() { return archived; }
    public Long assigneeId() { return assigneeId; }
    public boolean assigneeIdProvided() { return assigneeIdProvided; }

    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setPriority(Priority priority) { this.priority = priority; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public void setStatus(TaskStatus status) { this.status = status; }
    public void setArchived(Boolean archived) { this.archived = archived; }

    public void setAssigneeId(Long assigneeId) {
        this.assigneeId = assigneeId;
        this.assigneeIdProvided = true;
    }
}