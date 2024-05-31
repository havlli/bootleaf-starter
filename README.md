# BootLeaf Starter

Welcome to the repository of my custom starting kit for building SSR web applications with Spring Boot, Thymeleaf, Tailwindcss, HTMX, and _hyperscript. This project simplifies the development process and enhances productivity by providing a ready-to-use environment with live reload functionality using Node.js. It's designed for you to clone and make it your own for any new project.

## Features

- **Spring Boot**: Rapid application development with a powerful backend framework.
- **Thymeleaf**: Server-side HTML templating engine.
- **Tailwindcss**: Modern utility-first CSS framework for rapidly building custom designs.
- **HTMX**: Dynamic interfaces with minimal JavaScript.
- **_hyperscript**: Enhance HTML with simple syntax scripting.
- **Live Reload**: Immediate feedback on changes during development.

## Getting Started

These instructions will help you set up a copy of this project and customize it for your own development needs.

### Prerequisites

- Java 17 or higher
- Git

*Note: Node.js is installed with Maven locally, so you can customize which version you need in pom.xml*

### Cloning and Customizing

1. **Clone the Repository with a New Project Name**

   You can specify a new directory name at the time of cloning to immediately differentiate your new project.

    ```bash
    git clone https://github.com/havlli/bootleaf-starter.git your-new-project-name
    cd your-new-project-name
    ```

2. **Customize Project Details**

   Open the `pom.xml` file and change the `<artifactId>`, `<name>`, and any other relevant tags to reflect your new project's name and details.

    ```xml
    <groupId>com.yourcompany</groupId>
    <artifactId>your-new-project-name</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>Your New Project Name</name>
    ```

3. **Initialize Git, Node.js and npm**

   Running following script will initialize new Git repository, commit initial state and run `./mvnw verify` which will locally install Node.js, npm and required packages.

    ```bash
    ./prepare
    ```

   *Note: Scaffolding script is intended to run just once. Script itself adds all the script related files to .gitignore. You can keep the files for reference or safely delete them.*


### Running the Development Environment

#### Option 1: IntelliJ IDEA Users

For those using IntelliJ IDEA, run configurations are included in the `.run` directory, and IDEA should automatically detect them. Simply navigate to the Run/Debug configuration controls and run the compounded configuration: `spring & npm`.

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
   cd node | npm run build-watch
   ```

After running development environment you are all set to start coding your pages, node part of the configuration will try open your browser with `localhost:3000` that is proxy to the `localhost:8080` using `browser-sync` which will automatically reload the page for you when changes are detected!
#### Happy coding!
## Contributions
Contributions are welcome and encouraged! If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcome.