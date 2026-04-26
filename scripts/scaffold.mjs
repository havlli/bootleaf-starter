#!/usr/bin/env node
// BootLeaf Starter scaffolder.
//
// Goals:
//   - Single command, no other tooling required (uses only Node 20+ built-ins).
//   - Safe by default: --dry-run prints every change, --keep-git preserves history.
//   - Idempotent: re-running over a half-rewritten tree is a no-op.
//   - Self-contained: rewrites pom.xml, run config, packages, .properties, README
//     badge URLs, application.yml-style strings, and the IntelliJ module name.
//   - Removes itself only after a successful, non-dry, full run.
//
// Usage:
//   node scripts/scaffold.mjs               # interactive
//   node scripts/scaffold.mjs --dry-run     # preview all writes
//   node scripts/scaffold.mjs --yes \
//     --group-id com.acme --artifact-id widget --version 1.0.0 \
//     --name "Widget Service" --keep-git --skip-verify

import { readFileSync, writeFileSync, existsSync, statSync, readdirSync, rmSync, mkdirSync, renameSync, unlinkSync } from "node:fs";
import { join, relative, dirname, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin, stdout, exit } from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const C = {
    info: "\x1b[94m", ok: "\x1b[32m", warn: "\x1b[33m", err: "\x1b[31m",
    dim: "\x1b[2m", bold: "\x1b[1m", reset: "\x1b[0m",
};

const SOURCE = {
    groupId: "com.github.havlli",
    artifactId: "bootleaf-starter",
    rootPackage: "com.github.havlli.bootleafstarter",
    name: "BootLeaf Starter",
    githubOwner: "havlli",
    githubRepo: "bootleaf-starter",
};

// -------------------- arg parsing --------------------

function parseArgs(argv) {
    const out = { _: [] };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a.startsWith("--")) {
            const key = a.slice(2);
            const eq = key.indexOf("=");
            if (eq >= 0) out[key.slice(0, eq)] = key.slice(eq + 1);
            else if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) out[key] = argv[++i];
            else out[key] = true;
        } else out._.push(a);
    }
    return out;
}

const args = parseArgs(process.argv.slice(2));
if (args.help || args.h) {
    console.log(`BootLeaf Starter scaffolder

Usage: node scripts/scaffold.mjs [flags]

Project metadata (prompted if absent, required with --yes):
  --group-id <id>          e.g. com.acme
  --artifact-id <id>       e.g. widget-service
  --version <ver>          e.g. 0.0.1-SNAPSHOT
  --name "<display>"       e.g. "Widget Service"
  --github-owner <owner>   used to rewrite README badge URLs
  --github-repo <repo>     used to rewrite README badge URLs

Flags:
  --dry-run                preview every move/write, change nothing
  --yes, -y                non-interactive (combine with metadata flags)
  --keep-git               preserve existing .git history
  --skip-verify            skip the trailing ./mvnw verify
  --skip-badge-rewrite     leave README badge URLs untouched
  --no-codecov             strip the Codecov badge entirely from README
  --template <kind>        'fullstack' (default) or 'api-only' (no thymeleaf/htmx/tailwind/node)
  --help, -h               show this help
`);
    exit(0);
}
const DRY = !!args["dry-run"];
const YES = !!args.yes || !!args.y;
const KEEP_GIT = !!args["keep-git"];
const SKIP_VERIFY = !!args["skip-verify"];
const SKIP_BADGE_REWRITE = !!args["skip-badge-rewrite"];
const NO_CODECOV = !!args["no-codecov"];
const TEMPLATE = (args.template || "fullstack").toLowerCase();
if (!["fullstack", "api-only"].includes(TEMPLATE)) {
    console.error(`[ERR] --template must be 'fullstack' or 'api-only', got '${TEMPLATE}'`);
    exit(1);
}

// -------------------- helpers --------------------

function log(level, msg) {
    const tag = level === "ok" ? `[${C.ok}OK${C.reset}]`
        : level === "warn" ? `[${C.warn}WARN${C.reset}]`
        : level === "err" ? `[${C.err}ERR${C.reset}]`
        : `[${C.info}INFO${C.reset}]`;
    console.log(`${tag} ${msg}`);
}

function header(msg) {
    console.log(`\n${C.bold}${C.info}━━━ ${msg} ━━━${C.reset}`);
}

function dryNote() {
    return DRY ? `${C.warn}(dry-run)${C.reset} ` : "";
}

function isValidGroupId(v) { return /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/i.test(v); }
function isValidArtifactId(v) { return /^[a-z][a-z0-9-]*$/.test(v); }
function isValidVersion(v) { return /^[0-9]+(\.[0-9]+){0,2}([.-][A-Za-z0-9.-]+)?$/.test(v); }
function packageFromArtifact(a) { return a.replace(/-+/g, ""); }

function readFile(p) { return readFileSync(p, "utf8"); }

function writeIfChanged(p, next) {
    const prev = existsSync(p) ? readFile(p) : null;
    if (prev === next) return false;
    const rel = relative(ROOT, p);
    if (DRY) {
        console.log(`  ${dryNote()}${C.dim}write${C.reset} ${rel}`);
    } else {
        mkdirSync(dirname(p), { recursive: true });
        writeFileSync(p, next);
        console.log(`  ${C.ok}write${C.reset} ${rel}`);
    }
    return true;
}

function walk(dir, opts = {}) {
    const out = [];
    if (!existsSync(dir)) return out;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (opts.skipDir && opts.skipDir.includes(entry.name)) continue;
        const full = join(dir, entry.name);
        if (entry.isDirectory()) out.push(...walk(full, opts));
        else if (entry.isFile()) out.push(full);
    }
    return out;
}

function moveTree(from, to) {
    if (!existsSync(from)) return;
    console.log(`  ${DRY ? dryNote() : ""}${C.dim}move${C.reset} ${relative(ROOT, from)} ${C.dim}->${C.reset} ${relative(ROOT, to)}`);
    if (DRY) return;
    mkdirSync(to, { recursive: true });
    for (const entry of readdirSync(from, { withFileTypes: true })) {
        const src = join(from, entry.name);
        const dst = join(to, entry.name);
        if (entry.isDirectory()) {
            moveTree(src, dst);
        } else {
            mkdirSync(dirname(dst), { recursive: true });
            renameSync(src, dst);
        }
    }
    pruneEmpty(from);
}

function pruneEmpty(dir) {
    if (DRY || !existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) pruneEmpty(join(dir, entry.name));
    }
    if (readdirSync(dir).length === 0) rmSync(dir, { recursive: true, force: true });
}

function pruneEmptyUp(start, stopAt) {
    if (DRY) return;
    let cur = start;
    while (cur && cur.startsWith(stopAt) && cur !== stopAt) {
        if (existsSync(cur) && readdirSync(cur).length === 0) {
            rmSync(cur, { recursive: true, force: true });
            cur = dirname(cur);
        } else break;
    }
}

// -------------------- prompts --------------------

async function prompt(question, def, validate) {
    const rl = createInterface({ input: stdin, output: stdout });
    while (true) {
        const tag = `[${C.info}?${C.reset}]`;
        const promptLine = `${tag} ${question}${def != null ? ` [${C.warn}${def}${C.reset}]` : ""}: `;
        const raw = (await rl.question(promptLine)).trim();
        const value = raw || def || "";
        if (!validate || validate(value)) { rl.close(); return value; }
        console.log(`    ${C.err}invalid value${C.reset}, try again`);
    }
}

async function confirm(question, def = true) {
    if (YES) return true;
    const rl = createInterface({ input: stdin, output: stdout });
    const raw = (await rl.question(`[${C.info}?${C.reset}] ${question} [${def ? "Y/n" : "y/N"}]: `)).trim().toLowerCase();
    rl.close();
    if (!raw) return def;
    return raw.startsWith("y");
}

// -------------------- main --------------------

async function gather() {
    if (YES) {
        return {
            groupId: args["group-id"] || "com.example",
            artifactId: args["artifact-id"] || "app",
            version: args.version || "0.0.1-SNAPSHOT",
            name: args.name || "App",
            githubOwner: args["github-owner"] || "your-org",
            githubRepo: args["github-repo"] || (args["artifact-id"] || "app"),
        };
    }
    header("Project metadata");
    const groupId = await prompt("Group ID", "com.example", isValidGroupId);
    const artifactId = await prompt("Artifact ID", "app", isValidArtifactId);
    const version = await prompt("Version", "0.0.1-SNAPSHOT", isValidVersion);
    const name = await prompt("Display name", artifactId.replace(/(^|-)([a-z])/g, (_, _s, c) => " " + c.toUpperCase()).trim());
    const githubOwner = await prompt("GitHub owner (for badge URLs)", "your-org");
    const githubRepo = await prompt("GitHub repo", artifactId);
    return { groupId, artifactId, version, name, githubOwner, githubRepo };
}

function summarize(meta) {
    header("Plan");
    const rows = [
        ["Group ID", meta.groupId],
        ["Artifact ID", meta.artifactId],
        ["Version", meta.version],
        ["Display name", meta.name],
        ["Root package", `${meta.groupId}.${packageFromArtifact(meta.artifactId)}`],
        ["GitHub", `${meta.githubOwner}/${meta.githubRepo}`],
        ["Template", TEMPLATE],
        ["Codecov badge", NO_CODECOV ? "stripped" : "kept"],
        ["Keep .git history", String(KEEP_GIT)],
        ["Skip mvnw verify", String(SKIP_VERIFY)],
        ["Mode", DRY ? "dry-run (no writes)" : "apply"],
    ];
    const w = Math.max(...rows.map(([k]) => k.length));
    for (const [k, v] of rows) console.log(`  ${C.dim}${k.padEnd(w)}${C.reset}  ${v}`);
}

function rewriteFiles(meta) {
    header("Rewriting files");
    const newRootPackage = `${meta.groupId}.${packageFromArtifact(meta.artifactId)}`;
    const oldPackagePath = SOURCE.rootPackage.replaceAll(".", sep);
    const newPackagePath = newRootPackage.replaceAll(".", sep);
    const oldOwnerRepo = `${SOURCE.githubOwner}/${SOURCE.githubRepo}`;
    const newOwnerRepo = `${meta.githubOwner}/${meta.githubRepo}`;

    // 1. pom.xml — only the project-coordinate elements, never dependencies
    const pomPath = join(ROOT, "pom.xml");
    if (existsSync(pomPath)) {
        let pom = readFile(pomPath);
        // Bump version first, while the bootleaf-starter anchor is still present.
        pom = pom.replace(
            /(<artifactId>bootleaf-starter<\/artifactId>\s*<version>)0\.0\.1-SNAPSHOT(<\/version>)/,
            `$1${meta.version}$2`
        );
        pom = pom.replace(
            /(<groupId>)com\.github\.havlli(<\/groupId>\s*<artifactId>)bootleaf-starter(<\/artifactId>)/,
            `$1${meta.groupId}$2${meta.artifactId}$3`
        );
        pom = pom.replace(/<name>BootLeaf Starter<\/name>/, `<name>${meta.name}</name>`);
        writeIfChanged(pomPath, pom);
    }

    // 2. .run/Application.run.xml
    const runPath = join(ROOT, ".run/Application.run.xml");
    if (existsSync(runPath)) {
        let run = readFile(runPath);
        run = run.replaceAll(SOURCE.rootPackage, newRootPackage);
        run = run.replaceAll(SOURCE.artifactId, meta.artifactId);
        writeIfChanged(runPath, run);
    }

    // 3. Move source + test packages
    const moves = [
        ["src/main/java", oldPackagePath, newPackagePath],
        ["src/test/java", oldPackagePath, newPackagePath],
    ];
    for (const [base, oldP, newP] of moves) {
        const from = join(ROOT, base, oldP);
        const to = join(ROOT, base, newP);
        if (existsSync(from) && from !== to) {
            moveTree(from, to);
            pruneEmptyUp(dirname(from), join(ROOT, base));
        }
    }

    // 4. Rewrite package declarations + imports inside .java files
    const javaFiles = [
        ...walk(join(ROOT, "src/main/java")),
        ...walk(join(ROOT, "src/test/java")),
    ].filter(p => p.endsWith(".java"));
    for (const f of javaFiles) {
        const before = readFile(f);
        const after = before.replaceAll(SOURCE.rootPackage, newRootPackage);
        if (before !== after) writeIfChanged(f, after);
    }

    // 5. Rewrite spring.application.name / artifact references in .properties + .yml
    const cfgFiles = walk(join(ROOT, "src/main/resources"))
        .filter(p => /\.(properties|ya?ml)$/.test(p));
    for (const f of cfgFiles) {
        const before = readFile(f);
        const after = before.replaceAll(SOURCE.artifactId, meta.artifactId);
        if (before !== after) writeIfChanged(f, after);
    }

    // 6. README badge URLs + project name + optional Codecov strip
    if (!SKIP_BADGE_REWRITE) {
        const readmePath = join(ROOT, "README.md");
        if (existsSync(readmePath)) {
            let r = readFile(readmePath);
            r = r.replaceAll(oldOwnerRepo, newOwnerRepo);
            r = r.replace(/^# BootLeaf Starter$/m, `# ${meta.name}`);
            if (NO_CODECOV) {
                r = r.replace(/^\[!\[codecov\][^\n]*\n/m, "");
            }
            writeIfChanged(readmePath, r);
        }
    }

    // 7. Template-specific surgery
    if (TEMPLATE === "api-only") applyApiOnlyTemplate(meta);
}

function applyApiOnlyTemplate(meta) {
    header("Applying api-only template");
    const newRootPackage = `${meta.groupId}.${packageFromArtifact(meta.artifactId)}`;
    const newPackagePath = newRootPackage.replaceAll(".", sep);

    // Strip the frontend pipeline + view-rendering deps from pom.xml
    const pomPath = join(ROOT, "pom.xml");
    let pom = readFile(pomPath);
    const drop = (re, label) => {
        const next = pom.replace(re, "");
        if (next !== pom) console.log(`  ${C.dim}strip${C.reset} ${label}`);
        pom = next;
    };
    // Keep spring-boot-starter-webmvc + spring-boot-starter-webmvc-test:
    // webmvc is the canonical SB4 servlet starter; webmvc-test gives us @WebMvcTest.
    drop(/\s*<dependency>\s*<groupId>org\.springframework\.boot<\/groupId>\s*<artifactId>spring-boot-starter-thymeleaf<\/artifactId>\s*<\/dependency>/g, "spring-boot-starter-thymeleaf");
    drop(/\s*<dependency>\s*<groupId>io\.github\.wimdeblauwe<\/groupId>\s*<artifactId>htmx-spring-boot[^<]*<\/artifactId>\s*<version>[^<]+<\/version>\s*<\/dependency>/g, "htmx-spring-boot(-thymeleaf)");
    drop(/\s*<htmx-spring-boot\.version>[^<]+<\/htmx-spring-boot\.version>/g, "htmx-spring-boot.version property");
    // Drop the entire frontend-maven-plugin block + the resources <excludes> for HTML/CSS/etc.
    drop(/\s*<plugin>\s*<groupId>com\.github\.eirslett<\/groupId>[\s\S]*?<\/plugin>/g, "frontend-maven-plugin");
    drop(/\s*<resources>[\s\S]*?<\/resources>/g, "frontend resource excludes");
    drop(/\s*<frontend-maven-plugin\.[^>]+>[^<]+<\/frontend-maven-plugin\.[^>]+>/g, "frontend-maven-plugin properties");
    drop(/\s*<profile>\s*<id>release<\/id>[\s\S]*?<\/profile>/g, "release profile (frontend prod)");
    // Replace project description with an api-focused one
    pom = pom.replace(
        /<description>[^<]*<\/description>/,
        `<description>${meta.name} — JSON API on Spring Boot 4, Java 21.</description>`
    );
    writeIfChanged(pomPath, pom);

    // Remove frontend folders + templates + static
    for (const dir of ["node", "src/main/resources/templates", "src/main/resources/static"]) {
        const p = join(ROOT, dir);
        if (existsSync(p)) {
            console.log(`  ${C.dim}rm -rf${C.reset} ${dir}`);
            if (!DRY) rmSync(p, { recursive: true, force: true });
        }
    }

    // Drop view + form classes; we'll write a tiny REST controller in their place.
    const drops = [
        `src/main/java/${newPackagePath}/controller/HomeController.java`,
        `src/main/java/${newPackagePath}/controller/WebController.java`,
        `src/main/java/${newPackagePath}/web/MessageForm.java`,
        `src/main/java/${newPackagePath}/config/RequestLoggingConfig.java`,
        `src/test/java/${newPackagePath}/ErrorPagesIntegrationTest.java`,
        `src/test/java/${newPackagePath}/controller/HomeControllerTest.java`,
        `src/test/java/${newPackagePath}/controller/WebControllerTest.java`,
        `src/test/java/${newPackagePath}/web/MessageFormValidationTest.java`,
    ];
    for (const rel of drops) {
        const p = join(ROOT, rel);
        if (existsSync(p)) {
            console.log(`  ${C.dim}rm${C.reset} ${rel}`);
            if (!DRY) unlinkSync(p);
        }
    }
    if (!DRY) {
        for (const sub of ["controller", "web", "config"]) {
            pruneEmptyUp(join(ROOT, "src/main/java", newPackagePath, sub), join(ROOT, "src/main/java"));
            pruneEmptyUp(join(ROOT, "src/test/java", newPackagePath, sub), join(ROOT, "src/test/java"));
        }
    }

    // Write a minimal /api/ping REST controller + slice test
    const restCtrl = `package ${newRootPackage}.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api")
class PingController {

    @GetMapping("/ping")
    Map<String, Object> ping() {
        return Map.of("status", "ok", "ts", Instant.now().toString());
    }
}
`;
    const restTest = `package ${newRootPackage}.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PingController.class)
class PingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void ping_returnsOkStatus() throws Exception {
        mockMvc.perform(get("/api/ping"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("\\"status\\":\\"ok\\"")));
    }
}
`;
    const ctrlPath = join(ROOT, "src/main/java", newPackagePath, "api/PingController.java");
    const testPath = join(ROOT, "src/test/java", newPackagePath, "api/PingControllerTest.java");
    writeIfChanged(ctrlPath, restCtrl);
    writeIfChanged(testPath, restTest);

    // Strip the dev request logging properties added under [local]
    const localProps = join(ROOT, "src/main/resources/application-local.properties");
    if (existsSync(localProps)) {
        let p = readFile(localProps);
        p = p.replace(/# Disable caching[\s\S]*?spring\.web\.resources\.chain\.strategy\.content\.enabled=false\s*/, "");
        writeIfChanged(localProps, p);
    }

    // README: replace Tailwind/HTMX badges + features with an api-only blurb
    const readmePath = join(ROOT, "README.md");
    if (existsSync(readmePath)) {
        let r = readFile(readmePath);
        r = r.replace(/\[!\[Tailwind CSS v4\][^\n]*\n/, "");
        r = r.replace(/\[!\[HTMX 2\][^\n]*\n/, "");
        r = r.replace(/^An opinionated[^\n]+\n/m, "An opinionated, modern starter for building **JSON APIs** with Spring Boot 4 on Java 21 — JPA-ready, Actuator-equipped, Jacoco-gated.\n");
        writeIfChanged(readmePath, r);
    }

    log("ok", "api-only template applied — Thymeleaf/HTMX/Tailwind/Node pipeline removed");
}

function gitReset(meta) {
    if (KEEP_GIT) {
        log("info", "keeping existing .git history (--keep-git)");
        return;
    }
    header("Reinitialise git history");
    const gitDir = join(ROOT, ".git");
    if (existsSync(gitDir)) {
        if (DRY) console.log(`  ${dryNote()}${C.dim}rm -rf${C.reset} .git`);
        else rmSync(gitDir, { recursive: true, force: true });
    }
    if (DRY) {
        console.log(`  ${dryNote()}git init && git add . && git commit -m "Initial commit"`);
        return;
    }
    spawnSync("git", ["init", "--quiet", "--initial-branch=main"], { cwd: ROOT, stdio: "inherit" });
    spawnSync("git", ["add", "."], { cwd: ROOT, stdio: "inherit" });
    spawnSync("git", ["commit", "--quiet", "-m", `Initial commit — scaffolded from BootLeaf Starter`], { cwd: ROOT, stdio: "inherit" });
}

function cleanupSelf() {
    if (DRY) {
        console.log(`  ${dryNote()}${C.dim}rm${C.reset} prepare prepare.sh prepare.cmd HELP.md scripts/scaffold.mjs scripts/create.sh`);
        return;
    }
    const toRemove = ["prepare", "prepare.sh", "prepare.cmd", "HELP.md", "scripts/scaffold.mjs", "scripts/create.sh"];
    for (const f of toRemove) {
        const p = join(ROOT, f);
        if (existsSync(p)) unlinkSync(p);
    }
    // remove scripts dir if empty
    const scriptsDir = join(ROOT, "scripts");
    if (existsSync(scriptsDir) && readdirSync(scriptsDir).length === 0) {
        rmSync(scriptsDir, { recursive: true, force: true });
    }
}

function checkJavaVersion() {
    const r = spawnSync("java", ["-version"], { encoding: "utf8" });
    const out = (r.stderr || r.stdout || "");
    const m = out.match(/version "(\d+)/);
    if (!m) return null;
    return parseInt(m[1], 10);
}

function runVerify() {
    if (SKIP_VERIFY || DRY) return;
    header("Running ./mvnw verify");
    const major = checkJavaVersion();
    if (major != null && major < 21) {
        log("warn", `java ${major} on PATH; this project needs JDK 21.`);
        log("warn", "run 'mise install' (or set JAVA_HOME to a 21 JDK) and retry, or pass --skip-verify");
        exit(1);
    }
    const mvn = process.platform === "win32" ? "mvnw.cmd" : "./mvnw";
    const r = spawnSync(mvn, ["-B", "-ntp", "verify"], { cwd: ROOT, stdio: "inherit" });
    if (r.status !== 0) {
        log("err", "mvnw verify failed — review the output above");
        exit(r.status ?? 1);
    }
}

(async () => {
    console.log(`${C.bold}${C.info}BootLeaf Starter${C.reset} scaffolder${DRY ? `  ${C.warn}[dry-run]${C.reset}` : ""}`);
    if (existsSync(join(ROOT, "src/main/java")) && !existsSync(join(ROOT, "src/main/java/com/github/havlli/bootleafstarter"))) {
        log("warn", "source tree is no longer at the BootLeaf coordinates — scaffold appears to have already run; continuing as a no-op");
    }
    const meta = await gather();
    summarize(meta);

    if (!YES) {
        const ok = await confirm("Apply the plan?", true);
        if (!ok) { log("info", "aborted"); exit(0); }
    }

    rewriteFiles(meta);
    gitReset(meta);
    runVerify();
    if (!DRY) cleanupSelf();

    header("Done");
    log("ok", `${DRY ? "(dry-run) " : ""}scaffold complete`);
    if (!DRY) {
        console.log(`
${C.dim}Next steps:${C.reset}
  ${C.bold}npm install${C.reset}          ${C.dim}# install root concurrently runner${C.reset}
  ${C.bold}npm run dev${C.reset}          ${C.dim}# start Spring + asset watcher in one terminal${C.reset}
  ${C.bold}npm run build${C.reset}        ${C.dim}# full ./mvnw verify with Jacoco gate${C.reset}
`);
    }
})().catch(e => { log("err", e.stack || e.message); exit(1); });
