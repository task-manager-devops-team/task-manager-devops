package com.example.backend.stats.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.task.domain.Priority;
import com.example.backend.task.domain.Task;
import com.example.backend.task.domain.TaskStatus;
import com.example.backend.task.repository.TaskRepository;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class StatsControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TaskRepository repository;

    @BeforeEach
    void clean() {
        repository.deleteAll();
        repository.flush();
    }

    @Test
    void returnsAllKeysWithZerosWhenNoTasks() throws Exception {
        mockMvc.perform(get("/api/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(0))
                .andExpect(jsonPath("$.overdue").value(0))
                .andExpect(jsonPath("$.byStatus.TODO").value(0))
                .andExpect(jsonPath("$.byStatus.IN_PROGRESS").value(0))
                .andExpect(jsonPath("$.byStatus.DONE").value(0))
                .andExpect(jsonPath("$.byPriority.LOW").value(0))
                .andExpect(jsonPath("$.byPriority.MEDIUM").value(0))
                .andExpect(jsonPath("$.byPriority.HIGH").value(0));
    }

    @Test
    void countsActiveTasksOverdueStatusAndPriority() throws Exception {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        LocalDate tomorrow = LocalDate.now().plusDays(1);

        repository.save(task("A", TaskStatus.TODO, Priority.HIGH, yesterday, false));
        repository.save(task("B", TaskStatus.IN_PROGRESS, Priority.MEDIUM, yesterday, false));
        repository.save(task("C", TaskStatus.DONE, Priority.LOW, yesterday, false));
        repository.save(task("D", TaskStatus.TODO, Priority.LOW, tomorrow, false));
        repository.save(task("E", TaskStatus.TODO, Priority.HIGH, null, false));
        repository.save(task("F archivée", TaskStatus.TODO, Priority.HIGH, yesterday, true));
        repository.flush();

        mockMvc.perform(get("/api/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(5))
                .andExpect(jsonPath("$.overdue").value(2))
                .andExpect(jsonPath("$.byStatus.TODO").value(3))
                .andExpect(jsonPath("$.byStatus.IN_PROGRESS").value(1))
                .andExpect(jsonPath("$.byStatus.DONE").value(1))
                .andExpect(jsonPath("$.byPriority.LOW").value(2))
                .andExpect(jsonPath("$.byPriority.MEDIUM").value(1))
                .andExpect(jsonPath("$.byPriority.HIGH").value(2));
    }

    private Task task(String title, TaskStatus status, Priority priority,
                      LocalDate dueDate, boolean archived) {
        Task task = new Task();
        task.setTitle(title);
        task.setStatus(status);
        task.setPriority(priority);
        task.setDueDate(dueDate);
        task.setArchived(archived);
        return task;
    }
}