<?php
header("Content-Type: application/json");
require_once __DIR__ . '/db.php';

$messages = [];

try {
    // Create table with all fields if not exists
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS live_updates (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            title       VARCHAR(500)  NOT NULL,
            summary     TEXT,
            content     LONGTEXT,
            image       VARCHAR(1000) DEFAULT NULL,
            author      VARCHAR(200)  DEFAULT 'Editorial Team',
            category    VARCHAR(100)  DEFAULT 'General',
            is_published TINYINT(1)   DEFAULT 1,
            views_count INT           NOT NULL DEFAULT 0,
            created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
            updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    $messages[] = 'Table created or already exists.';
} catch (\PDOException $e) {
    echo json_encode(['error' => 'Failed to create table: ' . $e->getMessage()]);
    exit;
}

// Add image column if missing (safe ALTER — fails silently if already exists)
try {
    $pdo->exec("ALTER TABLE live_updates ADD COLUMN image VARCHAR(1000) DEFAULT NULL");
    $messages[] = 'Column `image` added.';
} catch (\PDOException $e) { $messages[] = 'Column `image` already exists.'; }

// Add author column if missing
try {
    $pdo->exec("ALTER TABLE live_updates ADD COLUMN author VARCHAR(200) DEFAULT 'Editorial Team'");
    $messages[] = 'Column `author` added.';
} catch (\PDOException $e) { $messages[] = 'Column `author` already exists.'; }

// Add views_count column if missing
try {
    $pdo->exec("ALTER TABLE live_updates ADD COLUMN views_count INT NOT NULL DEFAULT 0");
    $messages[] = 'Column `views_count` added.';
} catch (\PDOException $e) { $messages[] = 'Column `views_count` already exists.'; }

echo json_encode(['success' => true, 'messages' => $messages]);
?>
