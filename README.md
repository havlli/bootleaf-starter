# BootLeaf Starter

[![CI](https://github.com/havlli/bootleaf-starter/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/havlli/bootleaf-starter/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/havlli/bootleaf-starter/branch/master/graph/badge.svg)](https://codecov.io/gh/havlli/bootleaf-starter)
[![Java 21](https://img.shields.io/badge/Java-21-007396?logo=openjdk&logoColor=white)](https://adoptium.net/temurin/releases/?version=21)
[![Spring Boot 4.0](https://img.shields.io/badge/Spring%20Boot-4.0-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind%20CSS-v4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![HTMX 2](https://img.shields.io/badge/HTMX-2.0-3366CC)](https://htmx.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An opinionated, modern starter for building **server-rendered web applications** with Spring Boot, Thymeleaf, HTMX, _hyperscript, and Tailwind CSS — without the SPA tax.

Designed to be cloned, scaffolded with the included `prepare` script, and made your own.

## Stack

| Layer         | Technology                                                                                          |
|---------------|-----------------------------------------------------------------------------------------------------|
| Backend       | [Spring Boot](https://spring.io/projects/spring-boot) **4.0** on Java **21** (virtual threads on)   |
| HTMX bridge   | [htmx-spring-boot](https://github.com/wimdeblauwe/htmx-spring-boot) **5.1** (HtmxResponse, headers) |
| Toolchain     | Pinned via [mise](https://mise.jdx.dev) (`mise.toml`): Temurin 21, Maven 3.9, Node 24               |
| Templates     | [Thymeleaf](https://www.thymeleaf.org/) with vanilla parameterised-fragment layouts                 |
| Interactivity | [HTMX](https://htmx.org/) **2.0** + [_hyperscript](https://hyperscript.org/) **0.9**                |
| Styling       | [Tailwind CSS](https://tailwindcss.com/) **v4** (CSS-first config, standalone CLI)                  |
| Validation    | Jakarta Bean Validation (server-side, surfaced via HTMX retarget/reswap)                            |
| Dev pipeline  | [Node.js](https://nodejs.org/) **24 LTS** + [browser-sync](https://browsersync.io/) for live reload |
| Observability | Spring Boot Actuator (`/actuator/health`, `/actuator/info` with custom app metadata)                |
| Quality gate  | JUnit 5 + MockMvc + RestTestClient, Jacoco with 70% line-coverage rule, GitHub Actions CI           |

## Features

- **Layout-first templates** — vanilla Thymeleaf parameterised fragments (`templates/layouts/main.html`); no third-party layout dialect (which is currently incompatible with Spring Boot 4 / Groovy 5).
- **HTMX patterns showcase** at `/patterns`: server-side validation with retarget/reswap, click counter, inline edit, toast notifications via `HX-Trigger`.
- **Themed error pages** — `templates/error/404.html` and `templates/error/5xx.html` reuse the brand layout; `BasicErrorController` resolves them automatically.
- **Zero-config dark mode** with `prefers-color-scheme` + a click-to-toggle button (persisted in `localStorage`).
- **HTTP/2, response compression, and content-versioned static assets** turned on by default in `application.properties`.
- **Virtual threads** enabled (`spring.threads.virtual.enabled=true`) for free request throughput on Java 21.
- **Comprehensive test suite** — controller slice tests, validation unit tests, full-stack integration tests with `RestTestClient`. 35+ tests cover the golden path and HTMX edge cases.
- **`prepare` scaffolding script** that renames packages, rewrites `pom.xml`, reinitialises git, and runs `mvnw verify` in one shot.
- **CI out of the box** — GitHub Actions workflow runs build, tests, Jacoco, and uploads coverage; Dependabot keeps Maven, Actions, and npm deps fresh.

## Getting Started

### Prerequisites

- **Git**
- A version manager that reads `mise.toml` — [mise](https://mise.jdx.dev) recommended (also works with `asdf`)
  - …or just install **JDK 21**, **Maven 3.9+**, and **Node 24 LTS** manually

The exact toolchain (JDK / Maven / Node versions) is pinned in [`mise.toml`](mise.toml). With `mise` installed:

```bash
mise trust    # one-time, after cloning
mise install  # provisions Temurin 21, Maven 3.9.15, Node 24.15.0
```

`mise` will then auto-set `JAVA_HOME`, `MAVEN_HOME`, and `PATH` whenever you `cd` into the project. The Maven wrapper (`./mvnw`) and `frontend-maven-plugin` continue to work as a fallback for contributors who don't use a version manager — `frontend-maven-plugin` will download Node 24 / npm 11 on demand.

### Cloning and scaffolding

> Run the scaffolding step in a plain terminal **before** opening the project in an IDE. IntelliJ in particular will eagerly write `.idea/` metadata that conflicts with the rename the script performs.

```bash
git clone https://github.com/havlli/bootleaf-starter.git your-new-project-name
cd your-new-project-name
./prepare
```

The script prompts for `groupId`, `artifactId`, `version`, and project name, then:

1. Rewrites `pom.xml` and the IntelliJ run config.
2. Moves source/test packages (recursively — including `controller/`, `web/`, `config/`).
3. Removes the cloned git history and re-initialises a fresh repo with an initial commit.
4. Runs `./mvnw verify` (which provisions Node/npm and produces a first build with coverage).

### Running the dev environment

#### IntelliJ IDEA

Open the project — IntelliJ picks up the configurations under `.run/`. Run the compound configuration **`spring & npm`** to start the Spring Boot app and the watcher in one click.

#### Other IDEs / plain terminal

Two terminals:

```bash
# 1. Spring Boot (local profile disables template/static caching and adds request logging)
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

```bash
# 2. Tailwind + asset watcher + browser-sync proxy
cd node && npm run dev
```

Browse to **http://localhost:3000** — browser-sync proxies to Spring on `:8080` and reloads the page whenever a watched file changes.

### Building for production

```bash
./mvnw -Prelease clean package
```

The `release` profile runs `npm run prod`, which builds CSS through the Tailwind v4 CLI with `--minify`. The default `verify` lifecycle also runs Jacoco and enforces a 70% line-coverage rule (excluding `Application.class`).

### Container image

The Spring Boot Maven plugin can build an OCI image without a `Dockerfile`:

```bash
./mvnw spring-boot:build-image
```

## Project layout

```
src/main/
├── java/.../
│   ├── Application.java
│   ├── config/
│   │   └── RequestLoggingConfig.java     # @Profile("local") request logging filter
│   ├── controller/
│   │   ├── HomeController.java           # GET /, GET /patterns
│   │   └── WebController.java            # /submit, /patterns/* HTMX endpoints
│   └── web/
│       └── MessageForm.java              # Jakarta validation record
└── resources/
    ├── META-INF/
    │   └── additional-spring-configuration-metadata.json   # custom info.app.* keys
    ├── application.properties
    ├── application-local.properties
    ├── static/                           # favicon, images, js/, vendored htmx + _hyperscript
    └── templates/
        ├── index.html
        ├── error.html                    # generic fallback
        ├── error/
        │   ├── 404.html                  # resolved by BasicErrorController on 404
        │   └── 5xx.html                  # resolved on 500-class errors
        ├── fragments/                    # reusable HTMX response fragments
        │   ├── chip.html
        │   ├── click.html
        │   ├── error-card.html
        │   ├── note.html
        │   └── validate-form.html
        ├── layouts/
        │   └── main.html                 # parameterised layout(title, head, content)
        └── pages/
            └── patterns.html             # HTMX patterns showcase

src/test/java/.../
├── ApplicationTests.java                 # Spring context smoke test
├── ErrorPagesIntegrationTest.java        # full-stack via RestTestClient
├── controller/
│   ├── HomeControllerTest.java           # @WebMvcTest slice
│   └── WebControllerTest.java            # HTMX retarget/trigger header assertions
└── web/
    └── MessageFormValidationTest.java    # pure Jakarta Validator tests

node/
├── package.json                          # @tailwindcss/cli, cpx2, browser-sync, npm-run-all2
├── styles.css                            # Tailwind v4 entry: @import + @theme + @utility
└── setup-dirs.js
```

## Useful endpoints

| Path                    | Description                                                         |
|-------------------------|---------------------------------------------------------------------|
| `/`                     | Landing page                                                        |
| `/patterns`             | HTMX patterns showcase: validation, click counter, inline edit      |
| `/submit`               | HTMX endpoint — returns the chip fragment                           |
| `/patterns/click`       | HTMX `POST` — increments shared counter, returns updated fragment   |
| `/patterns/validate`    | HTMX `POST` — server-side validation with `HX-Retarget` on failure  |
| `/patterns/note/{id}`   | HTMX `GET`/`POST` — inline-edit pattern for a note store            |
| `/actuator/health`      | Health probe (Kubernetes-friendly)                                  |
| `/actuator/info`        | Build & app metadata (custom `info.app.*` keys)                     |

## Quality gates

- `./mvnw verify` runs unit + integration tests, then the Jacoco line-coverage rule (≥ 70%, excluding `Application.class`).
- The GitHub Actions workflow at [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs the same on every push and PR, uploads the Jacoco HTML report as an artifact, and pushes coverage to Codecov.
- [Dependabot](.github/dependabot.yml) opens grouped PRs weekly for Maven (Spring + testing groups) and monthly for GitHub Actions and npm.

## Contributions

Contributions are welcome. Fork, branch, and open a pull request — the CI workflow will run automatically.
