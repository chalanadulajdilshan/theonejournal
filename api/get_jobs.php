<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

require_once __DIR__ . '/db.php';

try {
    $stmt = $pdo->query(
        "SELECT id, title, image, description, sort_order, created_at, updated_at
         FROM jobs
         WHERE is_published = 1
         ORDER BY sort_order ASC, id DESC"
    );
    echo json_encode($stmt->fetchAll());
} catch (\PDOException $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Failed: ' . $e->getMessage()]);
}
?>
