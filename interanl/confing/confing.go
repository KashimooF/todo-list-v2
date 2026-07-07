package confing

import (
	"os"
)

type Confing struct {
	PostgresURL string
	Port        string
}

func Load() *Confing {
	return &Confing{
		PostgresURL: getEnv("POSTGRES_URL", "postgres://postgres:100@postgres_db:5432/todo_list?sslmode=disable"),
		Port:        getEnv("PORT", "8080"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
