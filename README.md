# # 📋 TODO List

Веб-приложение для управления задачами на Go с использованием PostgreSQL, Docker и чистого HTML/CSS/JavaScript.

## 🚀 Функционал

- ✅ Создание задач
- ✅ Просмотр всех задач
- ✅ Редактирование задач
- ✅ Удаление задач
- ✅ Отметка о выполнении
- ✅ Фильтрация по статусу
- ✅ Статистика задач
- ✅ Автообновление каждые 10 секунд

## 🛠️ Технологии

### Backend
- **Go** — язык программирования
- **PostgreSQL** — база данных
- **Docker & Docker Compose** — контейнеризация
- **golang-migrate** — миграции базы данных

### Frontend
- Чистый HTML/CSS
- Ванильный JavaScript
- Адаптивный дизайн

## 📁 Структура проекта
todo-list-v2/
├── cmd/
│ ├── api/
│ │ └── main.go # Точка входа API
│ └── migrations/
│ └── main.go # Утилита для миграций
├── internal/
│ ├── config/ # Конфигурация
│ ├── handler/ # HTTP обработчики
│ ├── model/ # Модели данных
│ ├── repository/ # Работа с БД
│ └── service/ # Бизнес-логика
├── migrations/ # SQL миграции
├── web/ # Фронтенд
│ ├── index.html
│ ├── style.css
│ └── script.js
├── .env # Переменные окружения
├── docker-compose.yml # Docker Compose конфиг
├── Dockerfile # Docker образ
├── Makefile # Утилиты сборки
└── README.md # Этот файл
text


## 🚀 Запуск

### Через Makefile (рекомендуемый)

```bash
# Полный запуск (сборка + контейнеры + миграции)
make docker-up

# Остановка
make docker-down

# Запуск без Docker (только для разработки)
make run

# Запуск миграций
make migrate-up

Через Docker Compose
bash

# Сборка и запуск
docker compose up --build

# Остановка
docker compose down
