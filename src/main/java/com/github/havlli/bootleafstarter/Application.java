package com.github.havlli.bootleafstarter;

import io.github.wimdeblauwe.htmx.spring.boot.mvc.EnableHtmxResponse;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableHtmxResponse
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

}
