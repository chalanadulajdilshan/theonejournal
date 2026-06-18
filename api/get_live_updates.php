<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . '/db.php';

try {
    $category = $_GET['category'] ?? null;
    $limit    = isset($_GET['limit']) ? intval($_GET['limit']) : 50;

    if ($category && $category !== 'all') {
        $stmt = $pdo->prepare(
            "SELECT id, title, summary, content, image, author, category, is_published, views_count, created_at, updated_at
             FROM live_updates
             WHERE is_published = 1 AND category = ?
             ORDER BY created_at DESC
             LIMIT ?"
        );
        $stmt->execute([$category, $limit]);
    } else {
        $stmt = $pdo->prepare(
            "SELECT id, title, summary, content, image, author, category, is_published, views_count, created_at, updated_at
             FROM live_updates
             WHERE is_published = 1
             ORDER BY created_at DESC
             LIMIT ?"
        );
        $stmt->execute([$limit]);
    }

    echo json_encode($stmt->fetchAll());
} catch (\PDOException $e) {
    // Return empty array if table doesn't exist yet — frontend handles gracefully
    echo json_encode([]);
}
?>
