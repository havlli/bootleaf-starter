package com.github.havlli.htmxdemo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class WebController {

    @PostMapping("/submit")
    public String submit(@RequestParam String message, Model model) {
        model.addAttribute("content", message);
        return "response";
    }
}
