## Running the Development Environment

#### Option 1: IntelliJ IDEA Users

For those using IntelliJ IDEA, run configurations are included in the `.run` directory, and IDEA should automatically detect them. Simply navigate to the Run/Debug configuration controls and run the compounded configuration: `spring & npm`

#### Option 2: Non-IntelliJ IDEA Users

If you're not using IntelliJ IDEA or prefer to run your own custom configurations, follow these steps:

1. **Run Spring Boot with the Local Profile**
   Ensure you're using the `application-local.properties` profile to disable caching of static resources in the development environment.

   ```bash
   ./mvnw spring-boot:run -Dspring-boot.run.profiles=local
   ```
2. **Start the Live Reload Process**
   In a second terminal instance, start the live reload process to watch changes:

   ```bash
   cd node 
   npm run build-watch
   ```

After running development environment you are all set to start coding your pages, node part of the configuration will try open your browser with `localhost:3000` that is proxy to the `localhost:8080` using `browser-sync` which will automatically reload the page for you when changes are detected!
#### Happy coding!

## Reference Documentation

For further reference, please consider the following sections:

* [Official Apache Maven documentation](https://maven.apache.org/guides/index.html)
* [Spring Boot Maven Plugin Reference Guide](https://docs.spring.io/spring-boot/docs/3.3.0/maven-plugin/reference/html/)
* [Create an OCI image](https://docs.spring.io/spring-boot/docs/3.3.0/maven-plugin/reference/html/#build-image)
* [Thymeleaf](https://docs.spring.io/spring-boot/docs/3.3.0/reference/htmlsingle/index.html#web.servlet.spring-mvc.template-engines)
* [Spring Web](https://docs.spring.io/spring-boot/docs/3.3.0/reference/htmlsingle/index.html#web)
* [HTMX](https://htmx.org/docs/)
* [_hyperscript](https://hyperscript.org/docs/)
* [tailwindcss](https://tailwindcss.com/docs/utility-first)
* [BrowserSync](https://browsersync.io/)

### Guides

The following guides illustrate how to use some features concretely:

* [Handling Form Submission](https://spring.io/guides/gs/handling-form-submission/)
* [Building a RESTful Web Service](https://spring.io/guides/gs/rest-service/)
* [Serving Web Content with Spring MVC](https://spring.io/guides/gs/serving-web-content/)
* [Building REST services with Spring](https://spring.io/guides/tutorials/rest/)
* [Using HTMX to Enhance Your Web Pages](https://htmx.org/examples)
* [Introduction to Tailwind CSS](https://www.geeksforgeeks.org/introduction-to-tailwind-css/)
* [Introduction to hyperscript](https://hyperscript.org/docs/#introduction)

