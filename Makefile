run:
	@go run cmd/api/main.go

migrate-create:
	@migrate create -ext sql -dir migrations $(name)

migrate-up:
	@go run cmd/migrations/main.go -cmd=up

migrate down:
	@go run cmd/migrations/main.go -cmd=down 

docker-up:
	@docker compose up --build

docker-down:
	@docker compose down

build:
	go build -o bin/main_app cmd/api/main.go
	go build -o bin/migrate_tool cmd/migrations/main.go.go

clean:
	rm -rf bin/
	docker compose down -v
	docker system prune -f

rebuild: clean docker-up