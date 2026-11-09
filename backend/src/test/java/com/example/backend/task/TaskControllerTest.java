package com.example.backend.task;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(TaskController.class)
class TaskControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    TaskRepository repository;

    private Task sample() {
        Task t = new Task();
        t.setId(1L);
        t.setTitle("Exemple");
        t.setDescription("Texte");
        t.setPriority(Priority.HIGH);
        t.setDueDate(LocalDate.of(2026, 11, 20));
        t.setStatus(TaskStatus.TODO);
        return t;
    }

    @Test
    void listReturnsContract() throws Exception {
        given(repository.findAll(any(Sort.class))).willReturn(List.of(sample()));

        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Exemple"))
                .andExpect(jsonPath("$[0].priority").value("HIGH"))
                .andExpect(jsonPath("$[0].dueDate").value("2026-11-20"))
                .andExpect(jsonPath("$[0].status").value("TODO"));
    }

    @Test
    void createReturns201() throws Exception {
        given(repository.save(any(Task.class))).willAnswer(inv -> {
            Task t = inv.getArgument(0);
            t.setId(1L);
            return t;
        });

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Exemple\",\"priority\":\"HIGH\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("TODO"));
    }

    @Test
    void createWithBlankTitleReturns400() throws Exception {
        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getUnknownReturns404() throws Exception {
        given(repository.findById(99L)).willReturn(Optional.empty());

        mockMvc.perform(get("/api/tasks/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteReturns204() throws Exception {
        given(repository.findById(1L)).willReturn(Optional.of(sample()));

        mockMvc.perform(delete("/api/tasks/1"))
                .andExpect(status().isNoContent());
    }

        @Test
    void patchChangesOnlyStatus() throws Exception {
        given(repository.findById(1L)).willReturn(Optional.of(sample()));
        given(repository.save(any(Task.class))).willAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(patch("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"DONE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DONE"))
                .andExpect(jsonPath("$.title").value("Exemple"))
                .andExpect(jsonPath("$.description").value("Texte"))
                .andExpect(jsonPath("$.dueDate").value("2026-11-20"));
    }

    @Test
    void patchWithBlankTitleReturns400() throws Exception {
        mockMvc.perform(patch("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"  \"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void patchUnknownReturns404() throws Exception {
        given(repository.findById(99L)).willReturn(Optional.empty());

        mockMvc.perform(patch("/api/tasks/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"DONE\"}"))
                .andExpect(status().isNotFound());
    }
}