package com.github.havlli.bootleafstarter.controller;

import com.github.havlli.bootleafstarter.web.MessageForm;
import io.github.wimdeblauwe.htmx.spring.boot.mvc.HtmxResponse;
import io.github.wimdeblauwe.htmx.spring.boot.mvc.HtmxReswap;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Controller
public class WebController {

    private final AtomicInteger clickCount = new AtomicInteger();
    private final Map<Long, String> notes = new ConcurrentHashMap<>(Map.of(
            1L, "Server-rendered, client-enhanced.",
            2L, "Click the value to edit inline.",
            3L, "Press Esc or click away to cancel."
    ));

    @PostMapping("/submit")
    public String submit(@RequestParam String message, Model model) {
        model.addAttribute("content", message);
        return "fragments/chip :: chip";
    }

    @PostMapping("/patterns/validate")
    public String validate(@Valid MessageForm form,
                           BindingResult bindingResult,
                           Model model,
                           HtmxResponse htmxResponse) {
        if (bindingResult.hasErrors()) {
            htmxResponse.setRetarget("#validate-form");
            htmxResponse.setReswap(HtmxReswap.outerHtml());
            model.addAttribute("messageForm", form);
            model.addAttribute("errors", bindingResult);
            return "fragments/validate-form :: form";
        }
        model.addAttribute("content", form.message());
        htmxResponse.addTrigger("toast", "Saved \"" + form.message() + "\"");
        return "fragments/chip :: chip";
    }

    @PostMapping("/patterns/click")
    public String click(Model model) {
        int total = clickCount.incrementAndGet();
        model.addAttribute("total", total);
        return "fragments/click :: button";
    }

    @GetMapping("/patterns/note/{id}")
    public String note(@PathVariable Long id, Model model) {
        model.addAttribute("id", id);
        model.addAttribute("text", notes.getOrDefault(id, ""));
        return "fragments/note :: view";
    }

    @GetMapping("/patterns/note/{id}/edit")
    public String noteEdit(@PathVariable Long id, Model model) {
        model.addAttribute("id", id);
        model.addAttribute("text", notes.getOrDefault(id, ""));
        return "fragments/note :: edit";
    }

    @PostMapping("/patterns/note/{id}")
    public String noteSave(@PathVariable Long id,
                           @RequestParam String text,
                           Model model) {
        String trimmed = text.strip();
        notes.put(id, trimmed);
        model.addAttribute("id", id);
        model.addAttribute("text", trimmed);
        return "fragments/note :: view";
    }
}
