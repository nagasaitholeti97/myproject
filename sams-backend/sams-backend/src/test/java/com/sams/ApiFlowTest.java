package com.sams;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = "sams.demo-today=2026-11-11")
@AutoConfigureMockMvc
@org.springframework.transaction.annotation.Transactional // every test rolls back its changes
class ApiFlowTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    private String login(String id) throws Exception {
        String body = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"userId\":\"" + id + "\",\"password\":\"demo123\"}"))
            .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        JsonNode node = json.readTree(body);
        return "Bearer " + node.get("token").asText();
    }

    @Test
    void protectedEndpointsNeedAToken() throws Exception {
        mvc.perform(get("/api/student/attendance/summary")).andExpect(status().isUnauthorized());
    }

    @Test
    void wrongPasswordIsRejected() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
            .content("{\"userId\":\"24ECE3002\",\"password\":\"nope\"}")).andExpect(status().isUnauthorized());
    }

    @Test
    void emailCanBeUsedToSignIn() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"userId\":\"ananya.rao@student.campus.edu\",\"password\":\"demo123\"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.userId").value("24ECE3002"));
    }

    @Test
    void studentCannotUseFacultyEndpoints() throws Exception {
        mvc.perform(get("/api/faculty/classes").header("Authorization", login("24ECE3002")))
            .andExpect(status().isForbidden());
    }

    @Test
    void referenceDataAndRecordsMatchTheSampleData() throws Exception {
        String t = login("24ECE3002");
        mvc.perform(get("/api/reference").header("Authorization", t))
            .andExpect(status().isOk()).andExpect(jsonPath("$.subjects.length()").value(5))
            .andExpect(jsonPath("$.sections.length()").value(3)).andExpect(jsonPath("$.events.length()").value(15));
        mvc.perform(get("/api/student/me").header("Authorization", t))
            .andExpect(status().isOk()).andExpect(jsonPath("$.sectionName").value("3rd Year ECE-A"));
        // 5 subjects, about two thirds of the 41 school days each
        mvc.perform(get("/api/student/attendance/records").header("Authorization", t))
            .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(136));
    }

    @Test
    void studentSeesSummaryChartAndWeek() throws Exception {
        String t = login("24ECE3002");
        mvc.perform(get("/api/student/attendance/summary").header("Authorization", t))
            .andExpect(status().isOk()).andExpect(jsonPath("$.subjects.length()").value(5))
            .andExpect(jsonPath("$.attended").value(91)).andExpect(jsonPath("$.held").value(136));
        mvc.perform(get("/api/student/attendance/chart").param("subjectId", "SUB101").header("Authorization", t))
            .andExpect(status().isOk()).andExpect(jsonPath("$.rows[*].label", hasItem("All months")));
        mvc.perform(get("/api/student/attendance/hourly").header("Authorization", t))
            .andExpect(status().isOk()).andExpect(jsonPath("$.days.length()").value(5));
    }

    @Test
    void absenceMarkedByFacultyChangesTheStudentsPercentage() throws Exception {
        String f = login("F101");
        String s = login("24ECE3002");
        String ids = "24ECE3001,24ECE3002,24ECE3003,24ECE3004,24ECE3005,24ECE3006,24ECE3007,24ECE3008";
        StringBuilder marks = new StringBuilder("{\"date\":\"2026-11-11\",\"marks\":[");
        for (String id : ids.split(",")) {
            marks.append("{\"studentId\":\"").append(id).append("\",\"status\":\"ABSENT\"},");
        }
        marks.setLength(marks.length() - 1);
        marks.append("]}");
        mvc.perform(post("/api/faculty/classes/SEC3/attendance").header("Authorization", f)
                .contentType(MediaType.APPLICATION_JSON).content(marks.toString()))
            .andExpect(status().isOk()).andExpect(jsonPath("$.absent").value(8));
        mvc.perform(get("/api/student/attendance/records").header("Authorization", s))
            .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(137));
    }

    @Test
    void futureDatesAreRejected() throws Exception {
        mvc.perform(post("/api/faculty/classes/SEC3/attendance").header("Authorization", login("F101"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"date\":\"2026-12-01\",\"marks\":[{\"studentId\":\"24ECE3001\",\"status\":\"PRESENT\"}]}"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void registerGivesTheNextIdAndSignsIn() throws Exception {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Test Student\",\"gender\":\"Female\",\"sectionId\":\"SEC3\","
                    + "\"phone\":\"9876543210\",\"email\":\"test.student@example.com\",\"password\":\"password1\"}"))
            .andExpect(status().isCreated()).andExpect(jsonPath("$.userId").value("24ECE3009"));
    }

    @Test
    void changePasswordNeedsTheCurrentOne() throws Exception {
        String t = login("24ECE3001");
        mvc.perform(post("/api/auth/verify-password").header("Authorization", t).contentType(MediaType.APPLICATION_JSON)
            .content("{\"password\":\"wrong\"}")).andExpect(status().isBadRequest());
        mvc.perform(post("/api/auth/verify-password").header("Authorization", t).contentType(MediaType.APPLICATION_JSON)
            .content("{\"password\":\"demo123\"}")).andExpect(status().isOk());
    }
}
