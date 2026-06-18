<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

require_once __DIR__ . '/db.php';

try {
    // Ensure the key/value config store exists (shared with other site settings)
    $pdo->exec("CREATE TABLE IF NOT EXISTS site_configs (
        config_key VARCHAR(100) PRIMARY KEY,
        config_value LONGTEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // A POST registers a new visit; a GET just reads the current total.
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Atomically increment the global counter, creating the row at 1 if absent.
        $pdo->prepare("INSERT INTO site_configs (config_key, config_value)
            VALUES ('site_views', '1')
            ON DUPLICATE KEY UPDATE config_value = config_value + 1")->execute();
    }

    $stmt = $pdo->query("SELECT config_value FROM site_configs WHERE config_key = 'site_views'");
    $views = (int) ($stmt->fetchColumn() ?: 0);

    echo json_encode(['views' => $views]);
} catch (\PDOException $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Failed to update site views: ' . $e->getMessage()]);
}
?>
