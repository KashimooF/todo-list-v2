package service

import (
	"errors"
	"todo-list-v2/interanl/model"
	"todo-list-v2/interanl/repository"
)

type TaskService struct {
	repo *repository.TaskRepository
}

func NewTaskSevice(repo *repository.TaskRepository) *TaskService {

	return &TaskService{repo: repo}
}

func (t *TaskService) CreateTask(username string, req *model.CreateTaskRequest) (*model.Task, error) {

	task := &model.Task{
		Username:    username,
		Title:       req.Title,
		Description: req.Description,
		Status:      false,
	}
	err := t.repo.Create(task)

	return task, err
}
func (t *TaskService) GetAllTask() ([]model.Task, error) {

	return t.repo.GetAllTask()

}

func (t *TaskService) GetById(id int64) (*model.Task, error) {

	task, err := t.repo.GetById(id)
	if err != nil {
		return nil, err
	}
	if task == nil {
		return nil, errors.New("task not found")
	}
	return task, nil
}

func (t *TaskService) UpdateTask(id int64, req *model.UpdateTaskRequest) error {

	task, err := t.repo.GetById(id)

	if err != nil {
		return err
	}
	if task == nil {
		return errors.New("task not found")
	}

	if req.Title != "" {
		task.Title = req.Title
	}
	if req.Description != "" {
		task.Description = req.Description
	}
	if req.Status != "" {

		task.Status = req.Status == "done"
	}
	return t.repo.UptadeTask(id, task)

}

func (t *TaskService) DelateTask(id int64) error {
	return t.repo.DelateTask(id)
}

func (t *TaskService) UpdateStatus(id int64) error {

	task, err := t.repo.GetById(id)

	if err != nil {
		return err
	}
	if task == nil {
		return errors.New("task not found")
	}

	newStatus := !task.Status

	return t.repo.UpdateStatus(id, newStatus)
}
