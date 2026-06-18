<?php
header("Content-Type: application/json");
require_once __DIR__ . '/db.php';

try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS jobs (
            id           INT AUTO_INCREMENT PRIMARY KEY,
            title        VARCHAR(500)  NOT NULL,
            image        VARCHAR(1000) DEFAULT NULL,
            description  LONGTEXT,
            is_published TINYINT(1)    NOT NULL DEFAULT 1,
            sort_order   INT           NOT NULL DEFAULT 0,
            created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
            updated_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo json_encode(['success' => true, 'message' => 'Table `jobs` created or already exists.']);
} catch (\PDOException $e) {
    echo json_encode(['error' => 'Failed to create table: ' . $e->getMessage()]);
}
?>
