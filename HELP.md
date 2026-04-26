## Running the development environment

### IntelliJ IDEA

Run configurations live under `.run/`. Use the compound **`spring & npm`** to start Spring Boot and the asset watcher together.

### Other IDEs

Two terminals:

```bash
# Spring Boot, local profile (disables caching of templates + static)
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

```bash
# Tailwind v4 CLI + cpx2 watchers + browser-sync proxy
cd node && npm run dev
```

Open **http://localhost:3000** — browser-sync proxies to `localhost:8080` and reloads on changes under `target/classes/templates` and `target/classes/static`.

## Reference documentation

* [Spring Boot 4 reference](https://docs.spring.io/spring-boot/index.html)
* [Spring Boot Maven Plugin](https://docs.spring.io/spring-boot/maven-plugin/reference/html/)
* [Spring Boot OCI image build](https://docs.spring.io/spring-boot/maven-plugin/reference/html/#build-image)
* [Thymeleaf docs](https://www.thymeleaf.org/documentation.html)
* [HTMX 2 docs](https://htmx.org/docs/) · [HTMX 1 → 2 migration](https://htmx.org/migration-guide-htmx-1/)
* [_hyperscript docs](https://hyperscript.org/docs/)
* [Tailwind CSS v4 docs](https://tailwindcss.com/docs) · [v3 → v4 upgrade guide](https://tailwindcss.com/docs/upgrade-guide)
* [BrowserSync](https://browsersync.io/)

## Guides

* [Handling Form Submission](https://spring.io/guides/gs/handling-form-submission/)
* [Building a RESTful Web Service](https://spring.io/guides/gs/rest-service/)
* [Serving Web Content with Spring MVC](https://spring.io/guides/gs/serving-web-content/)
* [HTMX examples](https://htmx.org/examples)
* [_hyperscript introduction](https://hyperscript.org/docs/#introduction)
