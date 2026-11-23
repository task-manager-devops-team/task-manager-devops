package com.example.backend.task.web;

import com.example.backend.task.domain.Priority;
import com.example.backend.task.domain.TaskStatus;
import com.example.backend.task.dto.TaskFilter;
import com.example.backend.task.dto.TaskPatchRequest;
import com.example.backend.task.dto.TaskRequest;
import com.example.backend.task.dto.TaskResponse;
import com.example.backend.task.service.TaskService;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    @GetMapping
    public List<TaskResponse> list(
            @RequestParam(name = "q", required = false) String q,
            @RequestParam(name = "status", required = false) List<TaskStatus> status,
            @RequestParam(name = "priority", required = false) List<Priority> priority,
            @RequestParam(name = "dueFrom", required = false)
                    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueFrom,
            @RequestParam(name = "dueTo", required = false)
                    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueTo,
            @RequestParam(name = "archived", required = false) Boolean archived,
            @RequestParam(name = "sort", required = false) String sort,
            @RequestParam(name = "order", required = false) String order) {
        return service.list(new TaskFilter(q, status, priority, dueFrom, dueTo, archived, sort, order));
    }

    @GetMapping("/{id}")
    public TaskResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    public ResponseEntity<TaskResponse> create(@Valid @RequestBody TaskRequest request) {
        TaskResponse saved = service.create(request);
        return ResponseEntity.created(URI.create("/api/tasks/" + saved.id())).body(saved);
    }

    @PutMapping("/{id}")
    public TaskResponse update(@PathVariable Long id, @Valid @RequestBody TaskRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}")
    public TaskResponse patch(@PathVariable Long id, @Valid @RequestBody TaskPatchRequest request) {
        return service.patch(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}