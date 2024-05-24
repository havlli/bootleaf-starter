package com.github.havlli.htmxdemo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class WebController {

    @PostMapping("/submit")
    public ResponseEntity<String> submit(@RequestParam String message) {
        System.out.println("submit: " + message);
        return ResponseEntity.ok(message);
    }
}
