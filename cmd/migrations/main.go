package main

import (
	"flag"
	"log"
	"todo-list-v2/interanl/confing"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
)

func main() {
	cfg := confing.Load()

	cmd := flag.String("cmd", "up", "migration command: up or down")
	flag.Parse()

	m, err := migrate.New(
		"file://migrations",
		cfg.PostgresURL,
	)
	if err != nil {
		log.Fatal("Failed to create migrate instance:", err)
	}
	defer m.Close()

	log.Println("migrations instance created")

	switch *cmd {
	case "up":
		if err := m.Up(); err != nil && err != migrate.ErrNoChange {
			log.Fatalf("Migrations up failed: %v", err)
		}
		log.Println("Migrations up completed successfully")

	case "down":
		if err := m.Down(); err != nil && err != migrate.ErrNoChange {
			log.Fatalf("Migrations down failed: %v", err)
		}
		log.Println("Migrations down completed successfully")

	default:
		log.Fatalf("Unknown command: %s", *cmd)
	}
}
