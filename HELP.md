## Toolchain

JDK / Maven / Node versions are pinned in `mise.toml`. After cloning:

```bash
mise trust && mise install
```

You can also stick with the bundled Maven wrapper (`./mvnw`) and let `frontend-maven-plugin` provision Node — `mise` is a quality-of-life addition, not a hard requirement, but it keeps `JAVA_HOME` aligned with the project.

## Scaffold flow

The scaffolder is `scripts/scaffold.mjs` (Node 20+). The legacy `prepare` / `prepare.sh` / `prepare.cmd` files are thin shims that forward to it.

```bash
./prepare                  # interactive prompts
./prepare --dry-run        # show every write/move without touching the tree
./prepare --keep-git       # rename project but keep existing .git history
./prepare --skip-verify    # skip ./mvnw verify after rewrites

# Fully non-interactive (CI / template engines):
./prepare --yes \
  --group-id com.acme --artifact-id widget --version 1.0.0 \
  --name "Widget Service" --github-owner acme --github-repo widget
```

What it rewrites:

- `pom.xml` — `<groupId>` / `<artifactId>` / `<version>` / `<name>` only (never dependency coordinates).
- `.run/Application.run.xml` — main class + module name.
- Source + test packages — moved on disk and `package` / `import` lines rewritten in-place.
- `application.properties` / `application-local.properties` — `spring.application.name` and any `bootleaf-starter` references.
- `README.md` — title and GitHub badge URLs (`havlli/bootleaf-starter` → your `owner/repo`).

After a successful run the scaffolder removes `prepare*` and itself. The resulting tree is yours.

## Running the development environment

### Single-terminal (recommended)

```bash
npm install        # one-time, installs concurrently as a root dev-dep
npm run dev        # ./mvnw spring-boot:run + npm --prefix node run dev, side by side
```

### IntelliJ IDEA

Run configurations live under `.run/`. Use the compound **`spring & npm`** to start Spring Boot and the asset watcher together.

### Two-terminal (fallback)

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
