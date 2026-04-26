# BootLeaf Starter

[![CI](https://github.com/havlli/bootleaf-starter/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/havlli/bootleaf-starter/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/havlli/bootleaf-starter/branch/master/graph/badge.svg)](https://codecov.io/gh/havlli/bootleaf-starter)
[![Java 21](https://img.shields.io/badge/Java-21-007396?logo=openjdk&logoColor=white)](https://adoptium.net/temurin/releases/?version=21)
[![Spring Boot 4.0](https://img.shields.io/badge/Spring%20Boot-4.0-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind%20CSS-v4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![HTMX 2](https://img.shields.io/badge/HTMX-2.0-3366CC)](https://htmx.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An opinionated, modern starter for building **server-rendered web applications** with Spring Boot, Thymeleaf, HTMX, _hyperscript, and Tailwind CSS — without the SPA tax.

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/havlli/bootleaf-starter/master/scripts/create.sh) my-app
```

That single line clones, scaffolds (your group/artifact/version), installs the dev runner, and gives you a fresh git history. See [One-command bootstrap](#one-command-bootstrap) below for the non-interactive variant and full flag list.

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

### One-command bootstrap

The fastest path: a single line that clones, scaffolds, installs the root npm runner, and `git init`s a fresh history. Interactive (asks for groupId / artifactId / etc.):

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/havlli/bootleaf-starter/master/scripts/create.sh) my-app
```

Fully non-interactive — every prompt answered up front:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/havlli/bootleaf-starter/master/scripts/create.sh) my-app \
  --yes --template api-only --no-codecov \
  --group-id com.acme --artifact-id myapp --version 1.0.0 \
  --name "My App" --github-owner acme --github-repo myapp
```

When you're done you have a green-build project: `cd my-app && npm run dev`.

> Prefer not to pipe `curl` into a shell? `git clone` then `bash scripts/create.sh ../my-app …` does the same thing locally; or use the manual flow below.

### Manual cloning and scaffolding

> Run scaffolding in a plain terminal **before** opening the project in an IDE — IntelliJ will eagerly write `.idea/` metadata that fights the rename.

```bash
git clone https://github.com/havlli/bootleaf-starter.git your-new-project-name
cd your-new-project-name
./prepare                    # interactive
# or, fully non-interactive:
./prepare --yes \
  --group-id com.acme --artifact-id widget --version 1.0.0 \
  --name "Widget Service" --github-owner acme --github-repo widget
```

The scaffolder ([`scripts/scaffold.mjs`](scripts/scaffold.mjs), Node 20+) is **idempotent**, **dry-runnable**, and rewrites everything in one shot:

| Flag                | Effect                                                                 |
|---------------------|------------------------------------------------------------------------|
| `--dry-run`              | Print every move/write — change nothing                                |
| `--keep-git`             | Rename project but preserve existing `.git` history (no fresh init)    |
| `--skip-verify`          | Skip the trailing `./mvnw verify`                                      |
| `--skip-badge-rewrite`   | Leave README badge URLs pointing at `havlli/bootleaf-starter`          |
| `--no-codecov`           | Strip the Codecov badge from README (use until you wire Codecov)       |
| `--template <kind>`      | `fullstack` (default) or `api-only` (no Thymeleaf/HTMX/Tailwind/Node)  |
| `--yes`                  | Non-interactive; combine with `--group-id`, `--artifact-id`, etc.      |
| `--help`                 | Show usage and exit                                                    |

What gets rewritten: `pom.xml` coordinates (never dependency coords), `.run/Application.run.xml`, source + test packages, `application*.properties`, and the README's title + GitHub badge URLs (so `acme/widget` shows green CI / Codecov badges immediately after you push).

`--template api-only` additionally strips the frontend pipeline: removes Thymeleaf, htmx-spring-boot, the `frontend-maven-plugin`, the `node/`, `templates/`, and `static/` folders, and drops the view classes/tests in favour of a minimal `/api/ping` REST controller and `@WebMvcTest` slice.

After a successful run the scaffolder removes `prepare*` and itself. The legacy `prepare`, `prepare.sh`, and `prepare.cmd` files are thin shims that forward all flags to the Node scaffolder, so muscle memory still works.

### Running the dev environment

#### Single terminal (recommended)

```bash
npm install        # one-time, installs concurrently as a root dev-dep
npm run dev        # Spring Boot (local profile) + Tailwind/cpx2/browser-sync, side by side
```

Browse to **http://localhost:3000** — browser-sync proxies to Spring on `:8080` and reloads the page whenever a watched file changes. `Ctrl-C` once stops both processes.

#### IntelliJ IDEA

Run configurations live under `.run/`. Use the compound **`spring & npm`** to start Spring Boot and the watcher in one click.

#### VS Code

[`.vscode/launch.json`](.vscode/launch.json) ships a Java debug profile (Spring `local` profile pre-set) and [`.vscode/tasks.json`](.vscode/tasks.json) wires `npm run dev`, `verify`, `test`, and the OCI image build into the command palette. [`.vscode/extensions.json`](.vscode/extensions.json) recommends the Java/Spring/Tailwind/HTMX extension bundle on first open.

#### Two-terminal fallback

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

```bash
cd node && npm run dev
```

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

### Docker Compose (app + Caddy)

For collaborators without JDK 21 on their machine — or to demo the patterns page behind a real reverse proxy:

```bash
make up         # builds the jar if needed, runs `docker compose up -d --build`
# browse to http://localhost:8080  (override with HTTP_PORT=9000 make up)
make logs       # tail compose logs
make down       # tear down
```

[`compose.yaml`](compose.yaml) ships a two-service stack: the Spring Boot app (built via an inline `Dockerfile` from `target/*.jar`) plus a Caddy reverse proxy that gzip/zstd-encodes responses and adds `Cache-Control: immutable` headers for content-versioned static assets. The Spring service exposes an Actuator-backed health check; Caddy waits for it to go green before accepting traffic.

### Makefile facade

A thin Makefile wraps the most common verbs so non-npm folks (and CI scripts) can run things without remembering Maven goal flags:

```bash
make            # list all targets
make dev        # npm run dev (Spring + Tailwind + browser-sync)
make test       # ./mvnw test
make verify     # ./mvnw verify (Jacoco gate)
make image      # OCI image via spring-boot:build-image
make scaffold   # interactive ./prepare
make hooks      # install lefthook git hooks
```

### Git hooks (lefthook)

Optional but recommended. [`lefthook.yml`](lefthook.yml) wires:

- **pre-commit** (fast): `./mvnw test-compile` (offline, parallel) + a trailing-whitespace check on `*.properties`.
- **pre-push** (slow): full `./mvnw verify` so the local gate matches CI.

```bash
brew install lefthook   # or: go install github.com/evilmartians/lefthook@latest
make hooks              # installs the .git/hooks shims
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

## Security posture

Out of the box this starter ships **no authentication, no authorization, and no CSRF protection** — Spring Security is intentionally not on the classpath, because adding it without an opinion (form login? OAuth2? JWT?) would force the wrong choice on you. The HTMX patterns page exists to demo client-server interactions, not to be deployed user-facing as-is.

Before exposing this to the public internet:

1. Add `spring-boot-starter-security` and configure CSRF (the HTMX form posts will need the `_csrf` token surfaced into headers — `htmx-spring-boot` has helpers for this).
2. Lock down the actuator: `management.endpoints.web.exposure.include` is currently `health,info`; review the Spring Boot Actuator docs before exposing more.
3. `info.app.*` keys are surfaced via `/actuator/info` — keep nothing sensitive in `application.properties` under that prefix.
4. Configure rate limiting / request-size limits / CORS at the reverse-proxy layer (Caddy in `compose.yaml`, or your platform).

## Quality gates

- `./mvnw verify` runs unit + integration tests, then the Jacoco line-coverage rule (≥ 70%, excluding `Application.class`).
- The GitHub Actions workflow at [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs the same on every push and PR, uploads the Jacoco HTML report as an artifact, and pushes coverage to Codecov.
- [Dependabot](.github/dependabot.yml) opens grouped PRs weekly for Maven (Spring + testing groups) and monthly for GitHub Actions and npm.

## Roadmap / known rough edges

Honest list of what could still be smoother — open to PRs:

- **Test data builders.** The `MessageForm` validation is well-covered, but as the project grows a `*Fixtures` builder pattern (or `instancio`) keeps test setup terse.
- **Formatter in pre-commit.** Lefthook currently runs `test-compile` + a properties-whitespace check; adding `palantir-java-format` (Java) and `prettier` (templates/CSS) would normalise style end-to-end.
- **JetBrains Fleet run configs.** IntelliJ `.run/` and VS Code `.vscode/` ship; Fleet still needs a hand-rolled task graph.
- **More `--template` presets.** Beyond `fullstack` and `api-only`, a `worker` (no web stack, just `@Scheduled` jobs + Actuator) preset would be useful for batch services.

## Contributions

Contributions are welcome. Fork, branch, and open a pull request — the CI workflow will run automatically.
