CREATE TABLE IF NOT EXISTS tasks(
    id SERIAL PRIMARY KEY,
    username VARCHAR(138) NOT NULL DEFAULT 'default',
    title VARCHAR(256) NOT NULL,
    description TEXT,
    status BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP 
);

CREATE INDEX idx_tasks_username ON tasks(username);
CREATE INDEX idx_tasks_status ON tasks(status);

