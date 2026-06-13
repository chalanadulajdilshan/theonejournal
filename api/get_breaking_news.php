<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

require_once __DIR__ . '/db.php';

try {
    $stmt = $pdo->query("SELECT * FROM breaking_news ORDER BY id DESC");
    $items = $stmt->fetchAll();
    echo json_encode($items);
} catch (\PDOException $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Failed to fetch breaking news: ' . $e->getMessage()]);
}
?>
