package com.example.backend.task.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.backend.task.domain.Priority;
import com.example.backend.task.domain.Task;
import com.example.backend.task.domain.TaskStatus;
import com.example.backend.task.dto.TaskFilter;
import com.example.backend.task.dto.TaskPatchRequest;
import com.example.backend.task.dto.TaskRequest;
import com.example.backend.task.dto.TaskResponse;
import com.example.backend.task.service.TaskService;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

@WebMvcTest(TaskController.class)
class TaskControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    TaskService service;

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
        given(service.list(any(TaskFilter.class))).willReturn(List.of(TaskResponse.from(sample())));

        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Exemple"))
                .andExpect(jsonPath("$[0].priority").value("HIGH"))
                .andExpect(jsonPath("$[0].dueDate").value("2026-11-20"))
                .andExpect(jsonPath("$[0].status").value("TODO"))
                .andExpect(jsonPath("$[0].archived").value(false))
                .andExpect(jsonPath("$[0].assigneeId").doesNotExist());
    }

    @Test
    void createReturns201() throws Exception {
        given(service.create(any(TaskRequest.class))).willReturn(TaskResponse.from(sample()));

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Exemple\",\"priority\":\"HIGH\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("TODO"))
                .andExpect(jsonPath("$.archived").value(false));
    }

    @Test
    void createCanSetArchived() throws Exception {
        Task archived = sample();
        archived.setArchived(true);
        given(service.create(any(TaskRequest.class))).willReturn(TaskResponse.from(archived));

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Exemple\",\"archived\":true}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.archived").value(true));
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
        given(service.get(99L)).willThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));

        mockMvc.perform(get("/api/tasks/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteReturns204() throws Exception {
        mockMvc.perform(delete("/api/tasks/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void patchChangesOnlyStatus() throws Exception {
        Task existing = sample();
        existing.setArchived(true);
        existing.setStatus(TaskStatus.DONE);
        given(service.patch(eq(1L), any(TaskPatchRequest.class)))
                .willReturn(TaskResponse.from(existing));

        mockMvc.perform(patch("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"DONE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DONE"))
                .andExpect(jsonPath("$.title").value("Exemple"))
                .andExpect(jsonPath("$.description").value("Texte"))
                .andExpect(jsonPath("$.dueDate").value("2026-11-20"))
                .andExpect(jsonPath("$.archived").value(true));
    }

    @Test
    void patchChangesArchivedWithoutChangingOtherFields() throws Exception {
        Task archived = sample();
        archived.setArchived(true);
        given(service.patch(eq(1L), any(TaskPatchRequest.class)))
                .willReturn(TaskResponse.from(archived));

        mockMvc.perform(patch("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"archived\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.archived").value(true))
                .andExpect(jsonPath("$.title").value("Exemple"))
                .andExpect(jsonPath("$.status").value("TODO"));
    }

    @Test
    void patchDistinguishesNullFromAbsentAssignee() throws Exception {
        given(service.patch(eq(1L), any(TaskPatchRequest.class)))
                .willReturn(TaskResponse.from(sample()));

        mockMvc.perform(patch("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"assigneeId\":null}"))
                .andExpect(status().isOk());
        mockMvc.perform(patch("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"DONE\"}"))
                .andExpect(status().isOk());
        mockMvc.perform(patch("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"assigneeId\":3}"))
                .andExpect(status().isOk());

        ArgumentCaptor<TaskPatchRequest> captor = ArgumentCaptor.forClass(TaskPatchRequest.class);
        verify(service, times(3)).patch(eq(1L), captor.capture());
        List<TaskPatchRequest> sent = captor.getAllValues();

        assertThat(sent.get(0).assigneeIdProvided()).isTrue();
        assertThat(sent.get(0).assigneeId()).isNull();
        assertThat(sent.get(1).assigneeIdProvided()).isFalse();
        assertThat(sent.get(2).assigneeIdProvided()).isTrue();
        assertThat(sent.get(2).assigneeId()).isEqualTo(3L);
    }

    @Test
    void putWithoutArchivedReturns200() throws Exception {
        Task updated = sample();
        updated.setTitle("Remplacée");
        updated.setPriority(Priority.MEDIUM);
        given(service.update(eq(1L), any(TaskRequest.class)))
                .willReturn(TaskResponse.from(updated));

        mockMvc.perform(put("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Remplacée\",\"priority\":\"MEDIUM\",\"status\":\"TODO\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Remplacée"));
    }

    @Test
    void putCanSetArchived() throws Exception {
        Task updated = sample();
        updated.setTitle("Remplacée");
        updated.setPriority(Priority.MEDIUM);
        updated.setArchived(true);
        given(service.update(eq(1L), any(TaskRequest.class)))
                .willReturn(TaskResponse.from(updated));

        mockMvc.perform(put("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Remplacée\",\"priority\":\"MEDIUM\",\"status\":\"TODO\",\"archived\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.archived").value(true));
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
        given(service.patch(eq(99L), any(TaskPatchRequest.class)))
                .willThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));

        mockMvc.perform(patch("/api/tasks/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"DONE\"}"))
                .andExpect(status().isNotFound());
    }
}