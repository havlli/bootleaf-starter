package com.github.havlli.bootleafstarter.controller;

import com.github.havlli.bootleafstarter.web.MessageForm;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.model;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

@WebMvcTest(HomeController.class)
class HomeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getRoot_returnsIndexView() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(view().name("index"))
                .andExpect(content().contentTypeCompatibleWith("text/html"))
                .andExpect(content().string(containsString("Server-rendered apps")));
    }

    @Test
    void getPatterns_returnsPatternsView_withEmptyForm() throws Exception {
        mockMvc.perform(get("/patterns"))
                .andExpect(status().isOk())
                .andExpect(view().name("pages/patterns"))
                .andExpect(model().attributeExists("messageForm"))
                .andExpect(model().attribute("messageForm", new MessageForm("")))
                .andExpect(content().string(containsString("Common HTMX patterns")));
    }
}
