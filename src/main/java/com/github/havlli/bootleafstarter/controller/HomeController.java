package com.github.havlli.bootleafstarter.controller;

import com.github.havlli.bootleafstarter.web.MessageForm;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/patterns")
    public String patterns(Model model) {
        model.addAttribute("messageForm", new MessageForm(""));
        return "pages/patterns";
    }
}
