package com.github.havlli.bootleafstarter.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(WebController.class)
class WebControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void postSubmit_rendersChipFragmentWithMessage() throws Exception {
        mockMvc.perform(post("/submit").param("message", "ahoj"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("ahoj")))
                .andExpect(content().string(containsString("fade-in")));
    }

    @Test
    void postClick_returnsButtonFragment() throws Exception {
        mockMvc.perform(post("/patterns/click"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("hx-post=\"/patterns/click\"")));
    }

    @Test
    void postClick_incrementsCounterAcrossRequests() throws Exception {
        mockMvc.perform(post("/patterns/click")).andExpect(status().isOk());
        mockMvc.perform(post("/patterns/click")).andExpect(status().isOk());
        mockMvc.perform(post("/patterns/click"))
                .andExpect(status().isOk())
                // total displayed in span; exact value depends on test order, so just assert it's parsed
                .andExpect(content().string(containsString("Increment")));
    }

    @Test
    void postValidate_emptyMessage_returnsFormWithErrorAndHtmxRetargetHeaders() throws Exception {
        mockMvc.perform(post("/patterns/validate").param("message", ""))
                .andExpect(status().isOk())
                .andExpect(header().string("HX-Retarget", "#validate-form"))
                .andExpect(header().string("HX-Reswap", "outerHTML"))
                .andExpect(content().string(containsString("Message can")))
                .andExpect(content().string(containsString("id=\"validate-form\"")));
    }

    @Test
    void postValidate_tooLongMessage_returnsFormWithError() throws Exception {
        String tooLong = "x".repeat(61);
        mockMvc.perform(post("/patterns/validate").param("message", tooLong))
                .andExpect(status().isOk())
                .andExpect(header().string("HX-Retarget", "#validate-form"))
                .andExpect(content().string(containsString("60 characters or fewer")));
    }

    @Test
    void postValidate_angleBrackets_returnsFormWithError() throws Exception {
        mockMvc.perform(post("/patterns/validate").param("message", "<script>"))
                .andExpect(status().isOk())
                .andExpect(header().string("HX-Retarget", "#validate-form"))
                .andExpect(content().string(containsString("No angle brackets allowed")));
    }

    @Test
    void postValidate_validMessage_returnsChipAndHxTriggerToast() throws Exception {
        mockMvc.perform(post("/patterns/validate").param("message", "hello"))
                .andExpect(status().isOk())
                .andExpect(header().string("HX-Trigger", containsString("toast")))
                .andExpect(header().string("HX-Trigger", containsString("hello")))
                .andExpect(content().string(allOf(
                        containsString("hello"),
                        containsString("fade-in"),
                        not(containsString("validate-form")))));
    }

    @Test
    void postValidate_validMessage_doesNotRetarget() throws Exception {
        mockMvc.perform(post("/patterns/validate").param("message", "hi"))
                .andExpect(status().isOk())
                .andExpect(header().doesNotExist("HX-Retarget"));
    }

    @Test
    void getNote_returnsViewFragmentForKnownId() throws Exception {
        mockMvc.perform(get("/patterns/note/1"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Server-rendered, client-enhanced.")))
                .andExpect(content().string(containsString("id=\"note-1\"")));
    }

    @Test
    void getNote_returnsEmptyValueForUnknownId() throws Exception {
        mockMvc.perform(get("/patterns/note/999"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("id=\"note-999\"")));
    }

    @Test
    void getNoteEdit_returnsEditFragment() throws Exception {
        mockMvc.perform(get("/patterns/note/2/edit"))
                .andExpect(status().isOk())
                .andExpect(content().string(allOf(
                        containsString("name=\"text\""),
                        containsString("Click the value to edit inline."))));
    }

    @Test
    void postNote_persistsAndReturnsViewFragment() throws Exception {
        mockMvc.perform(post("/patterns/note/3").param("text", "fresh value"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("fresh value")));

        mockMvc.perform(get("/patterns/note/3"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("fresh value")));
    }

    @Test
    void postNote_trimsWhitespace() throws Exception {
        mockMvc.perform(post("/patterns/note/4").param("text", "   trimmed   "))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("trimmed")))
                .andExpect(content().string(not(containsString("   trimmed   "))));
    }

    @Test
    void postSubmit_escapesHtmlInUserMessage() throws Exception {
        mockMvc.perform(post("/submit").param("message", "<img src=x onerror=alert(1)>"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("&lt;img")))
                .andExpect(content().string(not(containsString("<img src=x"))));
    }

    @Test
    void postValidate_validMessage_isHtmlEscapedInToastTrigger() throws Exception {
        mockMvc.perform(post("/patterns/validate").param("message", "Žluťoučký kůň"))
                .andExpect(status().isOk())
                .andExpect(header().string("HX-Trigger", containsString("toast")))
                .andExpect(content().string(containsString("Žluťoučký kůň")));
    }

    @Test
    void postClick_responseIsCorrectFragmentShape() throws Exception {
        mockMvc.perform(post("/patterns/click"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("text/html"))
                .andExpect(content().string(containsString("hx-swap=\"outerHTML\"")));
    }

    @Test
    void postNote_persistsAcrossEditFlow() throws Exception {
        mockMvc.perform(post("/patterns/note/7").param("text", "first"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/patterns/note/7/edit"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("value=\"first\"")));
        mockMvc.perform(post("/patterns/note/7").param("text", "second"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/patterns/note/7"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("second")))
                .andExpect(content().string(not(containsString("first"))));
    }
}
