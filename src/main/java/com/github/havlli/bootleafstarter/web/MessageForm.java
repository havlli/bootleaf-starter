package com.github.havlli.bootleafstarter.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record MessageForm(
        @NotBlank(message = "Message can't be blank.")
        @Size(max = 60, message = "Message must be 60 characters or fewer.")
        @Pattern(regexp = "^[^<>]*$", message = "No angle brackets allowed.")
        String message
) {
}
