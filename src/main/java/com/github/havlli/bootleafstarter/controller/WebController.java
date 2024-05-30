package com.github.havlli.bootleafstarter.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class WebController {

    @PostMapping("/submit")
    public String submit(@RequestParam String message, Model model) {
        model.addAttribute("content", message);
        return "response";
    }
}
