SHELL := /bin/zsh

POSTGRES_CONTAINER ?= mcp-market-finder-postgres
POSTGRES_IMAGE ?= postgres:16
POSTGRES_PORT ?= 5432
POSTGRES_USER ?= postgres
POSTGRES_PASSWORD ?= postgres
POSTGRES_DB ?= mcp_market_finder

.PHONY: help install postgres-up postgres-down migrate setup dev lint test build verify

help:
	@echo "Available targets:"
	@echo "  make install       Install npm dependencies"
	@echo "  make postgres-up   Start local PostgreSQL in Docker"
	@echo "  make postgres-down Stop and remove local PostgreSQL container"
	@echo "  make migrate       Run database migration"
	@echo "  make setup         Install deps, start PostgreSQL, run migration"
	@echo "  make dev           Start frontend and backend dev servers"
	@echo "  make lint          Run ESLint"
	@echo "  make test          Run Vitest"
	@echo "  make build         Build frontend and backend"
	@echo "  make verify        Run lint, test, and build"

install:
	npm install

postgres-up:
	@if docker ps --format '{{.Names}}' | grep -qx '$(POSTGRES_CONTAINER)'; then \
		echo "PostgreSQL container '$(POSTGRES_CONTAINER)' is already running."; \
	elif docker ps -a --format '{{.Names}}' | grep -qx '$(POSTGRES_CONTAINER)'; then \
		echo "Starting existing PostgreSQL container '$(POSTGRES_CONTAINER)'..."; \
		docker start $(POSTGRES_CONTAINER); \
	else \
		echo "Creating PostgreSQL container '$(POSTGRES_CONTAINER)'..."; \
		docker run -d --name $(POSTGRES_CONTAINER) \
			-e POSTGRES_PASSWORD=$(POSTGRES_PASSWORD) \
			-e POSTGRES_USER=$(POSTGRES_USER) \
			-e POSTGRES_DB=$(POSTGRES_DB) \
			-p $(POSTGRES_PORT):5432 \
			$(POSTGRES_IMAGE); \
	fi

postgres-down:
	@if docker ps -a --format '{{.Names}}' | grep -qx '$(POSTGRES_CONTAINER)'; then \
		docker rm -f $(POSTGRES_CONTAINER); \
	else \
		echo "PostgreSQL container '$(POSTGRES_CONTAINER)' does not exist."; \
	fi

migrate:
	npm run db:migrate

setup: install postgres-up migrate

dev:
	npm run dev

lint:
	npm run lint

test:
	npm run test

build:
	npm run build

verify: lint test build
