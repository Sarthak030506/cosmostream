.PHONY: help install dev build test lint clean docker-up docker-down db-migrate db-seed deploy

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Start development environment
	docker-compose up -d
	npm run dev

build: ## Build all applications
	npm run build

test: ## Run tests
	npm test

lint: ## Run linter
	npm run lint

format: ## Format code
	npm run format

clean: ## Clean build artifacts and dependencies
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf apps/*/.next
	rm -rf apps/*/dist
	rm -rf packages/*/node_modules
	rm -rf packages/*/dist

docker-up: ## Start Docker services
	docker-compose up -d

docker-down: ## Stop Docker services
	docker-compose down

docker-logs: ## View Docker logs
	docker-compose logs -f

docker-restart: ## Restart Docker services
	docker-compose restart

db-migrate: ## Run database migrations
	docker exec cosmostream-postgres psql -U postgres -d cosmostream -f /docker-entrypoint-initdb.d/01-schema.sql

db-seed: ## Seed database with test data
	docker exec cosmostream-postgres psql -U postgres -d cosmostream -f /docker-entrypoint-initdb.d/02-seeds.sql

db-reset: ## Reset database
	docker-compose down -v postgres
	docker-compose up -d postgres
	sleep 5
	make db-migrate
	make db-seed

db-backup: ## Backup database
	docker exec cosmostream-postgres pg_dump -U postgres cosmostream > backup_$$(date +%Y%m%d_%H%M%S).sql

db-shell: ## Open database shell
	docker exec -it cosmostream-postgres psql -U postgres -d cosmostream

redis-shell: ## Open Redis shell
	docker exec -it cosmostream-redis redis-cli

logs-api: ## View API logs
	docker logs -f cosmostream-api

logs-web: ## View web logs
	docker logs -f cosmostream-web

terraform-init: ## Initialize Terraform
	cd infrastructure/terraform && terraform init

terraform-plan: ## Plan Terraform changes
	cd infrastructure/terraform && terraform plan

terraform-apply: ## Apply Terraform changes
	cd infrastructure/terraform && terraform apply

terraform-destroy: ## Destroy Terraform infrastructure
	cd infrastructure/terraform && terraform destroy

k8s-apply: ## Apply Kubernetes manifests
	kubectl apply -f kubernetes/

k8s-delete: ## Delete Kubernetes resources
	kubectl delete -f kubernetes/

k8s-logs: ## View Kubernetes logs
	kubectl logs -f deployment/api -n production

k8s-shell: ## Shell into API pod
	kubectl exec -it deployment/api -n production -- sh

deploy-staging: ## Deploy to staging
	./scripts/deploy-staging.sh

deploy-prod: ## Deploy to production
	./scripts/deploy-prod.sh

check: lint test ## Run linter and tests
