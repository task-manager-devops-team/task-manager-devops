package com.example.backend.task.service;

import com.example.backend.task.domain.Task;
import com.example.backend.task.dto.TaskFilter;
import com.example.backend.task.dto.TaskPatchRequest;
import com.example.backend.task.dto.TaskRequest;
import com.example.backend.task.dto.TaskResponse;
import com.example.backend.task.repository.TaskRepository;
import com.example.backend.task.repository.TaskSpecifications;
import java.util.List;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TaskService {

    private final TaskRepository repository;

    public TaskService(TaskRepository repository) {
        this.repository = repository;
    }

    public List<TaskResponse> list(TaskFilter filter) {
        validate(filter);
        return repository.findAll(TaskSpecifications.matching(filter))
                .stream()
                .map(TaskResponse::from)
                .toList();
    }

    public TaskResponse get(Long id) {
        return TaskResponse.from(find(id));
    }

    public TaskResponse create(TaskRequest request) {
        return TaskResponse.from(repository.save(apply(new Task(), request)));
    }

    public TaskResponse update(Long id, TaskRequest request) {
        return TaskResponse.from(repository.save(apply(find(id), request)));
    }

    public TaskResponse patch(Long id, TaskPatchRequest request) {
        Task task = find(id);
        if (request.title() != null) task.setTitle(request.title());
        if (request.description() != null) task.setDescription(request.description());
        if (request.priority() != null) task.setPriority(request.priority());
        if (request.dueDate() != null) task.setDueDate(request.dueDate());
        if (request.status() != null) task.setStatus(request.status());
        if (request.archived() != null) task.setArchived(request.archived());
        return TaskResponse.from(repository.save(task));
    }

    public void delete(Long id) {
        repository.delete(find(id));
    }

    private Task find(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tâche introuvable"));
    }

    private Task apply(Task task, TaskRequest request) {
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setDueDate(request.dueDate());
        if (request.priority() != null) task.setPriority(request.priority());
        if (request.status() != null) task.setStatus(request.status());
        task.setArchived(Boolean.TRUE.equals(request.archived()));
        return task;
    }

    private void validate(TaskFilter filter) {
        if (filter.sort() != null
                && !filter.sort().equals("dueDate")
                && !filter.sort().equals("priority")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }
        if (filter.order() != null
                && !filter.order().equals("asc")
                && !filter.order().equals("desc")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }
        if (filter.dueFrom() != null && filter.dueTo() != null
                && filter.dueFrom().isAfter(filter.dueTo())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }
        if ((filter.status() != null && filter.status().stream().anyMatch(Objects::isNull))
                || (filter.priority() != null && filter.priority().stream().anyMatch(Objects::isNull))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }
    }
}
