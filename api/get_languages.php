<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

require_once __DIR__ . '/db.php';

try {
    // Ensure table exists (no-op if already there) so home page never 500s on fresh installs.
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS languages (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            name       VARCHAR(100) NOT NULL,
            code       VARCHAR(20)  DEFAULT NULL,
            sort_order INT          NOT NULL DEFAULT 0,
            is_visible TINYINT(1)   NOT NULL DEFAULT 1,
            created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_language_name (name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    $stmt = $pdo->query(
        "SELECT id, name, code, sort_order
         FROM languages
         WHERE is_visible = 1
         ORDER BY sort_order ASC, name ASC"
    );
    echo json_encode($stmt->fetchAll());
} catch (\PDOException $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Failed: ' . $e->getMessage()]);
}
?>
