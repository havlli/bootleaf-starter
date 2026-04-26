# BootLeaf Starter

An opinionated, modern starter for building **server-rendered web applications** with Spring Boot, Thymeleaf, HTMX, _hyperscript, and Tailwind CSS — without the SPA tax.

Designed to be cloned, scaffolded with the included `prepare` script, and made your own.

## Stack

| Layer        | Technology                                                                                          |
|--------------|-----------------------------------------------------------------------------------------------------|
| Backend      | [Spring Boot](https://spring.io/projects/spring-boot) **4.0** on Java **21** (virtual threads on)   |
| Toolchain    | Pinned via [mise](https://mise.jdx.dev) (`mise.toml`): Temurin 21, Maven 3.9, Node 24               |
| Templates    | [Thymeleaf](https://www.thymeleaf.org/) (server-side, with HTMX-friendly fragment routing)          |
| Interactivity| [HTMX](https://htmx.org/) **2.0** + [_hyperscript](https://hyperscript.org/) **0.9**                |
| Styling      | [Tailwind CSS](https://tailwindcss.com/) **v4** (CSS-first config, standalone CLI)                  |
| Dev pipeline | [Node.js](https://nodejs.org/) **24 LTS** + [browser-sync](https://browsersync.io/) for live reload |
| Observability| Spring Boot Actuator (`/actuator/health`, `/actuator/info`)                                         |

## Features

- **Zero-config dark mode** with `prefers-color-scheme` + a click-to-toggle button (persisted in `localStorage`).
- **HTMX 2 + Thymeleaf fragment** demo that returns a styled chip the user can dismiss.
- **HTTP/2, response compression, and content-versioned static assets** turned on by default in `application.properties`.
- **Virtual threads** enabled (`spring.threads.virtual.enabled=true`) for free request throughput on Java 21.
- **Custom themed error page** that reuses the brand palette.
- **`prepare` scaffolding script** that renames packages, rewrites `pom.xml`, reinitialises git, and runs `mvnw verify` in one shot.

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
2. Moves source/test packages.
3. Removes the cloned git history and re-initialises a fresh repo with an initial commit.
4. Runs `./mvnw verify` (which provisions Node/npm and produces a first build).

### Running the dev environment

#### IntelliJ IDEA

Open the project — IntelliJ picks up the configurations under `.run/`. Run the compound configuration **`spring & npm`** to start the Spring Boot app and the watcher in one click.

#### Other IDEs / plain terminal

Two terminals:

```bash
# 1. Spring Boot (local profile disables template + static caching)
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

The `release` profile runs `npm run prod`, which builds CSS through the Tailwind v4 CLI with `--minify`.

## Project layout

```
src/main/
├── java/.../
│   ├── Application.java
│   └── controller/
│       ├── HomeController.java     # GET /
│       └── WebController.java      # POST /submit (returns chip fragment)
└── resources/
    ├── application.properties
    ├── application-local.properties
    ├── static/
    │   ├── favicon.svg
    │   ├── images/                 # raster brand logos
    │   ├── js/                     # your vanilla JS (no transpile step)
    │   ├── lib/                    # vendored htmx + _hyperscript
    │   └── svg/
    └── templates/
        ├── index.html
        ├── error.html
        └── fragments/
            └── chip.html

node/
├── package.json                    # @tailwindcss/cli, cpx2, browser-sync, npm-run-all2
├── styles.css                      # Tailwind v4 entry: @import "tailwindcss" + @theme + @utility
└── setup-dirs.js                   # ensures static/ and target/ dirs exist before watch
```

## Useful endpoints

| Path                  | Description                                |
|-----------------------|--------------------------------------------|
| `/`                   | Demo page                                  |
| `/submit`             | HTMX endpoint — returns the chip fragment  |
| `/actuator/health`    | Health probe (Kubernetes-friendly)         |
| `/actuator/info`      | Build & app metadata                       |

## Contributions

Contributions are welcome. Fork, branch, and open a pull request.
