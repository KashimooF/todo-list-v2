package repository

import (
	"database/sql"
	"todo-list-v2/interanl/model"
)

type TaskRepository struct {
	db *sql.DB
}

func NewTaskRepository(db *sql.DB) *TaskRepository {
	return &TaskRepository{db: db}
}

func (r *TaskRepository) Create(task *model.Task) error {

	query := `INSERT INTO tasks(username,title,description,status)
			VALUES($1, $2, $3, $4)
			RETURNING id,created_at`

	return r.db.QueryRow(query, task.Username, task.Title, task.Description, task.Status).Scan(&task.ID, &task.CreatedAt)
}
func (r *TaskRepository) GetAllTask() ([]model.Task, error) {

	rows, err := r.db.Query(`SELECT id, username, title, description, status, created_at,completed_at
				FROM tasks ORDER BY id DESC`)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var task []model.Task

	for rows.Next() {

		var t model.Task

		err := rows.Scan(&t.ID, &t.Username, &t.Title, &t.Description,
			&t.Status, &t.CreatedAt, &t.CompletedAt)

		if err != nil {
			return nil, err
		}
		task = append(task, t)
	}

	return task, nil
}

func (r *TaskRepository) GetById(id int64) (*model.Task, error) {

	var t model.Task
	query := `SELECT id , username, title, description, status,  created_at, completed_at
			FROM tasks WHERE id = $1`

	err := r.db.QueryRow(query, id).Scan(&t.ID, &t.Username, &t.Title, &t.Description, &t.Status, &t.CreatedAt, &t.CompletedAt)

	if err != nil {
		return nil, err
	}

	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &t, err
}

func (r *TaskRepository) UptadeTask(id int64, task *model.Task) error {

	query := `UPDATE tasks SET title = $1, description = $2, status = $3
		WHERE id = $4`

	_, err := r.db.Exec(query, task.Title, task.Description, task.Status, id)

	return err
}

func (r TaskRepository) DelateTask(id int64) error {

	query := `DELETE FROM tasks WHERE id = $1`

	_, err := r.db.Exec(query, id)
	return err
}

func (r *TaskRepository) UpdateStatus(id int64, status bool) error {

	query := `UPDATE tasks SET status = $1, completed_at  = CASE WHEN $1 = true THEN CURRENT_TIMESTAMP ELSE NULL END
		WHERE id = $2`

	_, err := r.db.Exec(query, status, id)

	return err
}
