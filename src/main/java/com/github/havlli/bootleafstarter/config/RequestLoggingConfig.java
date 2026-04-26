package com.github.havlli.bootleafstarter.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.filter.CommonsRequestLoggingFilter;

@Configuration(proxyBeanMethods = false)
@Profile("local")
class RequestLoggingConfig {

    @Bean
    CommonsRequestLoggingFilter requestLoggingFilter() {
        CommonsRequestLoggingFilter filter = new CommonsRequestLoggingFilter();
        filter.setIncludeQueryString(true);
        filter.setIncludeHeaders(false);
        filter.setIncludeClientInfo(false);
        filter.setIncludePayload(true);
        filter.setMaxPayloadLength(2_000);
        filter.setBeforeMessagePrefix("--> ");
        filter.setAfterMessagePrefix("<-- ");
        return filter;
    }
}
