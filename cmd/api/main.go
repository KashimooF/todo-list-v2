package main

import (
	"log"
	"net/http"
	"todo-list-v2/interanl/confing"
	"todo-list-v2/interanl/handler"
	"todo-list-v2/interanl/repository"
	"todo-list-v2/interanl/service"
)

func main() {

	cfg := confing.Load()

	db, err := repository.NewPostgresDB(cfg.PostgresURL)
	if err != nil {
		log.Fatal("Falied to connect database", err)
	}

	defer db.Close()

	log.Println("Connecting to database")

	taskRepo := repository.NewTaskRepository(db)
	taskService := service.NewTaskSevice(taskRepo)
	taskHandler := handler.NewHandlerTask(taskService)

	http.HandleFunc("GET /tasks", taskHandler.GetAllTask)
	http.HandleFunc("POST /tasks", taskHandler.CreateTask)
	http.HandleFunc("GET /tasks/{id}", taskHandler.GetTaskById)
	http.HandleFunc("PUT /tasks/{id}", taskHandler.UpdateTask)
	http.HandleFunc("PATCH /tasks/{id}/toggle", taskHandler.UpdateStatus)
	http.HandleFunc("DELETE /tasks/{id}", taskHandler.DelateTask)

	http.Handle("/", http.FileServer(http.Dir("./web")))

	log.Printf("Server starting on %s", cfg.Port)
	log.Printf("Web interface: http://localhost:%s", cfg.Port)

	if err := http.ListenAndServe(":"+cfg.Port, nil); err != nil {

		log.Fatal(err)
	}

}
