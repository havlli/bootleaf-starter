package com.github.havlli.bootleafstarter.web;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class MessageFormValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void validMessage_passes() {
        Set<ConstraintViolation<MessageForm>> violations = validator.validate(new MessageForm("hello"));
        assertThat(violations).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "   ", "\t"})
    void blankMessage_fails(String value) {
        Set<ConstraintViolation<MessageForm>> violations = validator.validate(new MessageForm(value));
        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .anyMatch(m -> m.contains("blank"));
    }

    @Test
    void nullMessage_fails() {
        Set<ConstraintViolation<MessageForm>> violations = validator.validate(new MessageForm(null));
        assertThat(violations).isNotEmpty();
    }

    @Test
    void messageOver60Chars_fails() {
        String tooLong = "x".repeat(61);
        Set<ConstraintViolation<MessageForm>> violations = validator.validate(new MessageForm(tooLong));
        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .anyMatch(m -> m.contains("60 characters"));
    }

    @Test
    void messageExactly60Chars_passes() {
        Set<ConstraintViolation<MessageForm>> violations = validator.validate(new MessageForm("x".repeat(60)));
        assertThat(violations).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {"<", ">", "<script>", "a > b", "<b>bold</b>"})
    void messageWithAngleBrackets_fails(String value) {
        Set<ConstraintViolation<MessageForm>> violations = validator.validate(new MessageForm(value));
        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .anyMatch(m -> m.contains("angle brackets"));
    }
}
