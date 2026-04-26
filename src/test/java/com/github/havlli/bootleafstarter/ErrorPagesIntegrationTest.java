package com.github.havlli.bootleafstarter;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.client.RestTestClient;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
class ErrorPagesIntegrationTest {

    @Autowired
    private RestTestClient client;

    @Test
    void unknownPath_returnsThemed404Html_whenAcceptIsHtml() {
        client.get().uri("/no-such-page")
                .accept(MediaType.TEXT_HTML)
                .exchange()
                .expectStatus().isNotFound()
                .expectHeader().contentTypeCompatibleWith(MediaType.TEXT_HTML)
                .expectBody(String.class).value(body -> {
                    org.assertj.core.api.Assertions.assertThat(body)
                            .contains("Page not found")
                            .contains("Back to home");
                });
    }

    @Test
    void unknownPath_returnsJson_whenAcceptIsJson() {
        client.get().uri("/no-such-page")
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isNotFound()
                .expectBody(String.class).value(body -> {
                    org.assertj.core.api.Assertions.assertThat(body)
                            .contains("\"status\":404")
                            .contains("\"path\":\"/no-such-page\"");
                });
    }

    @Test
    void healthEndpoint_isExposedAndUp() {
        client.get().uri("/actuator/health")
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).value(body ->
                        org.assertj.core.api.Assertions.assertThat(body).contains("\"status\":\"UP\""));
    }

    @Test
    void infoEndpoint_isExposed_withCustomAppMetadata() {
        client.get().uri("/actuator/info")
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).value(body ->
                        org.assertj.core.api.Assertions.assertThat(body).contains("\"app\""));
    }

    @Test
    void homePage_rendersWithExpectedHeadingAndAssets() {
        client.get().uri("/")
                .accept(MediaType.TEXT_HTML)
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentTypeCompatibleWith(MediaType.TEXT_HTML)
                .expectBody(String.class).value(body -> {
                    org.assertj.core.api.Assertions.assertThat(body)
                            .contains("Server-rendered apps")
                            .containsPattern("/css/main[^\"]*\\.css")
                            .containsPattern("/lib/htmx\\.2\\.0\\.10\\.min[^\"]*\\.js")
                            .containsPattern("/lib/_hyperscript\\.0\\.9\\.14\\.min[^\"]*\\.js");
                });
    }

    @Test
    void patternsPage_rendersFullLayoutAndShowcaseSections() {
        client.get().uri("/patterns")
                .accept(MediaType.TEXT_HTML)
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).value(body -> {
                    org.assertj.core.api.Assertions.assertThat(body)
                            .contains("Common HTMX patterns")
                            .contains("Server-side validation")
                            .contains("Click counter")
                            .contains("Inline edit")
                            .contains("Toast notifications")
                            .contains("id=\"toast-host\"")
                            .contains("id=\"validate-form\"");
                });
    }

    @Test
    void httpCompressionAndCaching_areEnabled() {
        HttpHeaders headers = client.get().uri("/css/main.css")
                .header("Accept-Encoding", "gzip")
                .exchange()
                .expectStatus().isOk()
                .returnResult(String.class).getResponseHeaders();
        org.assertj.core.api.Assertions.assertThat(headers.getCacheControl())
                .as("static resources should have a long cache-control")
                .isNotNull();
    }
}
