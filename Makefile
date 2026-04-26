.DEFAULT_GOAL := help
SHELL := /usr/bin/env bash

MVN := ./mvnw -B -ntp

.PHONY: help dev test verify build image clean scaffold scaffold-dry create up down logs hooks

help: ## list targets
	@awk 'BEGIN {FS = ":.*##"; printf "Targets:\n"} /^[a-zA-Z0-9_-]+:.*##/ { printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

dev: ## spring-boot:run + asset watcher in one terminal (needs npm install once)
	@npm run dev

test: ## ./mvnw test
	@$(MVN) test

verify: ## ./mvnw verify (Jacoco gate)
	@$(MVN) verify

build: verify ## alias for verify

image: ## build OCI image via spring-boot:build-image
	@$(MVN) spring-boot:build-image

clean: ## ./mvnw clean
	@$(MVN) clean

scaffold: ## interactive scaffold
	@./prepare

scaffold-dry: ## preview scaffold rewrites without changing anything
	@./prepare --dry-run

create: ## one-command bootstrap: make create DIR=my-app [ARGS='--yes --template api-only ...']
	@if [ -z "$(DIR)" ]; then echo 'usage: make create DIR=my-app [ARGS=...]'; exit 1; fi
	@bash scripts/create.sh $(DIR) $(ARGS)

up: ## docker compose up (builds the OCI image first if needed)
	@ls target/*.jar >/dev/null 2>&1 || $(MVN) -DskipTests package
	@docker compose up -d --build
	@echo 'browse to http://localhost:$${HTTP_PORT:-8080}'

down: ## docker compose down
	@docker compose down

logs: ## tail compose logs
	@docker compose logs -f --tail=100

hooks: ## install lefthook git hooks
	@command -v lefthook >/dev/null 2>&1 || { echo 'lefthook not on PATH; brew install lefthook'; exit 1; }
	@lefthook install
