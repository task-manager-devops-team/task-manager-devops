package com.example.backend.task.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.task.domain.Task;
import com.example.backend.task.repository.TaskRepository;
import com.example.backend.user.domain.User;
import com.example.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TaskAssigneeIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private TaskRepository taskRepository;
    @Autowired private UserRepository userRepository;

    private User amine;
    private Task task;

    @BeforeEach
    void seed() {
        taskRepository.deleteAll();
        taskRepository.flush();
        userRepository.deleteAll();
        userRepository.flush();

        amine = new User();
        amine.setName("Amine");
        amine.setEmail("amine@example.com");
        amine = userRepository.save(amine);

        task = new Task();
        task.setTitle("Rapport");
        task.setArchived(true);
        task = taskRepository.save(task);
    }

    @Test
    void createWithAssigneeReturnsIdAndName() throws Exception {
        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Nouvelle\",\"assigneeId\":" + amine.getId() + "}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.assigneeId").value(amine.getId()))
                .andExpect(jsonPath("$.assigneeName").value("Amine"));
    }

    @Test
    void createWithUnknownAssigneeReturns400() throws Exception {
        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Nouvelle\",\"assigneeId\":999999}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void patchAssignsThenKeepsAssigneeWhenOtherFieldChanges() throws Exception {
        mockMvc.perform(patch("/api/tasks/" + task.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"assigneeId\":" + amine.getId() + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assigneeName").value("Amine"));

        mockMvc.perform(patch("/api/tasks/" + task.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"DONE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DONE"))
                .andExpect(jsonPath("$.assigneeId").value(amine.getId()));
    }

    @Test
    void patchWithNullAssigneeUnassigns() throws Exception {
        mockMvc.perform(patch("/api/tasks/" + task.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"assigneeId\":" + amine.getId() + "}"))
                .andExpect(status().isOk());

        mockMvc.perform(patch("/api/tasks/" + task.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"assigneeId\":null}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assigneeId").doesNotExist());
    }

    @Test
    void putWithoutArchivedKeepsArchivedValue() throws Exception {
        mockMvc.perform(put("/api/tasks/" + task.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Rapport modifié\",\"priority\":\"HIGH\",\"status\":\"TODO\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Rapport modifié"))
                .andExpect(jsonPath("$.archived").value(true));
    }
}