# Makefile for managing Docker containers

# List of all service names
SERVICES = delivery-service order-service payment-service restaurant-service gateway frontend

.PHONY: all build up down restart logs clean help

# Default target: show help
all: help

# Build all services
build:
	@echo "Building all services..."
	@$(foreach service, $(SERVICES), docker compose build $(service);)

# Start all services
up:
	@echo "Starting all services..."
	@docker compose up -d

# Stop all services
down:
	@echo "Stopping all services..."
	@docker compose down

# Restart all services
restart: down up
	@echo "Restarted all services."

# View logs of all services
logs:
	@echo "Showing logs for all services..."
	@docker compose logs -f

# Clean up containers, volumes, and networks
clean:
	@echo "Cleaning up containers, volumes, and networks..."
	@docker compose down -v --remove-orphans

# Open a shell in the specified container
shell-%:
	@echo "Opening shell in container $*..."
	@docker exec -it $* sh || docker exec -it $* sh

# Show help information
help:
	@echo "Usage:"
	@echo "  make build       Build all services"
	@echo "  make up          Start all services"
	@echo "  make down        Stop all services"
	@echo "  make restart     Restart all services"
	@echo "  make logs        View logs of all services"
	@echo "  make clean       Remove containers, volumes, and networks"
	@echo "  make shell-[service-name]  Open a shell in a specific container"
	@echo "  make help        Show this help message"
	@echo ""
	@echo "Available services:"
	@echo "  $(SERVICES)"
