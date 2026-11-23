package com.example.backend.task.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.hasSize;

import com.example.backend.task.domain.Priority;
import com.example.backend.task.domain.Task;
import com.example.backend.task.domain.TaskStatus;
import com.example.backend.task.repository.TaskRepository;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TaskSearchIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TaskRepository repository;

    @BeforeEach
    void seedTasks() {
        repository.deleteAll();
        repository.flush();
        repository.saveAll(List.of(
                task("Prepare report", Priority.LOW, TaskStatus.TODO, "2026-01-10", false),
                task("Plan 100%_done", Priority.HIGH, TaskStatus.DONE, "2026-01-20", true),
                task("Plan 100x_done", Priority.MEDIUM, TaskStatus.IN_PROGRESS, null, false),
                task("Plan review", Priority.HIGH, TaskStatus.TODO, "2026-01-20", false),
                task("Task_one", Priority.LOW, TaskStatus.DONE, "2026-01-20", false),
                task("TaskXone", Priority.MEDIUM, TaskStatus.IN_PROGRESS, "2026-01-30", true)));
        repository.flush();
    }

    @Test
    void noParametersReturnsAllTasksIncludingArchivedInIdOrder() throws Exception {
        assertTitles(get("/api/tasks"),
                "Prepare report", "Plan 100%_done", "Plan 100x_done",
                "Plan review", "Task_one", "TaskXone");
    }

    @Test
    void searchesTitleIgnoringCaseAndBlankKeywords() throws Exception {
        assertTitles(get("/api/tasks").param("q", "PREPARE"), "Prepare report");
        assertTitles(get("/api/tasks").param("q", "  "),
                "Prepare report", "Plan 100%_done", "Plan 100x_done",
                "Plan review", "Task_one", "TaskXone");
        repository.save(task("Écrire le rapport", Priority.LOW, TaskStatus.TODO, "2026-01-15", false));
        repository.flush();
        assertTitles(get("/api/tasks").param("q", "ÉCRIRE"), "Écrire le rapport");
    }

    @Test
    void treatsLikeWildcardsAsLiteralCharacters() throws Exception {
        assertTitles(get("/api/tasks").param("q", "%"), "Plan 100%_done");
        assertTitles(get("/api/tasks").param("q", "_"),
                "Plan 100%_done", "Plan 100x_done", "Task_one");
    }

    @Test
    void filtersBySingleStatusAndPriority() throws Exception {
        assertTitles(get("/api/tasks").param("status", "TODO"), "Prepare report", "Plan review");
        assertTitles(get("/api/tasks").param("priority", "HIGH"), "Plan 100%_done", "Plan review");
    }

    @Test
    void acceptsRepeatedStatusAndPriorityValues() throws Exception {
        assertTitles(get("/api/tasks")
                        .param("status", "TODO", "DONE")
                        .param("priority", "LOW", "HIGH"),
                "Prepare report", "Plan 100%_done", "Plan review", "Task_one");
    }

    @Test
    void filtersByInclusiveDueDateBoundsAndExcludesTasksWithoutDueDate() throws Exception {
        assertTitles(get("/api/tasks").param("dueFrom", "2026-01-20"),
                "Plan 100%_done", "Plan review", "Task_one", "TaskXone");
        assertTitles(get("/api/tasks").param("dueTo", "2026-01-20"),
                "Prepare report", "Plan 100%_done", "Plan review", "Task_one");
        assertTitles(get("/api/tasks")
                        .param("dueFrom", "2026-01-20")
                        .param("dueTo", "2026-01-20"),
                "Plan 100%_done", "Plan review", "Task_one");
    }

    @Test
    void filtersArchivedTrueAndFalse() throws Exception {
        assertTitles(get("/api/tasks").param("archived", "true"), "Plan 100%_done", "TaskXone");
        assertTitles(get("/api/tasks").param("archived", "false"),
                "Prepare report", "Plan 100x_done", "Plan review", "Task_one");
    }

    @Test
    void combinesAllFiltersWithAndLogic() throws Exception {
        assertTitles(get("/api/tasks")
                        .param("q", "plan")
                        .param("status", "TODO", "DONE")
                        .param("priority", "HIGH", "LOW")
                        .param("dueFrom", "2026-01-20")
                        .param("dueTo", "2026-01-20")
                        .param("archived", "false"),
                "Plan review");
    }

    @Test
    void sortsDueDatesAscendingAndKeepsMissingDatesLast() throws Exception {
        assertTitles(get("/api/tasks").param("sort", "dueDate"),
                "Prepare report", "Plan 100%_done", "Plan review", "Task_one", "TaskXone", "Plan 100x_done");
    }

    @Test
    void sortsDueDatesDescendingAndKeepsMissingDatesLast() throws Exception {
        assertTitles(get("/api/tasks").param("sort", "dueDate").param("order", "desc"),
                "TaskXone", "Plan 100%_done", "Plan review", "Task_one", "Prepare report", "Plan 100x_done");
    }

    @Test
    void sortsByLogicalPriorityWithDefaultsAndOrderOverride() throws Exception {
        assertTitles(get("/api/tasks").param("sort", "priority"),
                "Plan 100%_done", "Plan review", "Plan 100x_done", "TaskXone", "Prepare report", "Task_one");
        assertTitles(get("/api/tasks").param("sort", "priority").param("order", "asc"),
                "Prepare report", "Task_one", "Plan 100x_done", "TaskXone", "Plan 100%_done", "Plan review");
    }

    @Test
    void invalidFilterAndSortValuesReturn400() throws Exception {
        List<MockHttpServletRequestBuilder> invalidRequests = List.of(
                get("/api/tasks").param("status", "INVALID"),
                get("/api/tasks").param("priority", "INVALID"),
                get("/api/tasks").param("sort", "title"),
                get("/api/tasks").param("order", "sideways"),
                get("/api/tasks").param("dueFrom", "not-a-date"),
                get("/api/tasks").param("dueFrom", "2026-01-21").param("dueTo", "2026-01-20"),
                get("/api/tasks").param("archived", "maybe"));

        for (MockHttpServletRequestBuilder request : invalidRequests) {
            mockMvc.perform(request).andExpect(status().isBadRequest());
        }
    }

    private void assertTitles(MockHttpServletRequestBuilder request, String... expected) throws Exception {
        ResultActions actions = mockMvc.perform(request)
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$", hasSize(expected.length)));
        for (int i = 0; i < expected.length; i++) {
            actions.andExpect(MockMvcResultMatchers.jsonPath("$[" + i + "].title").value(expected[i]));
        }
    }

    private Task task(String title, Priority priority, TaskStatus status, String dueDate, boolean archived) {
        Task task = new Task();
        task.setTitle(title);
        task.setPriority(priority);
        task.setStatus(status);
        task.setDueDate(dueDate == null ? null : LocalDate.parse(dueDate));
        task.setArchived(archived);
        return task;
    }
}
