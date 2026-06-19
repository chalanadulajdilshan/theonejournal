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

    $rows = $stmt->fetchAll();
    // Attach an absolute epoch timestamp so the client can compute "time ago"
    // correctly regardless of the visitor's browser timezone. created_at is
    // parsed in PHP's own timezone (the same one it was written in), giving the
    // true instant; the browser just compares it against Date.now().
    foreach ($rows as &$row) {
        $row['created_ts'] = !empty($row['created_at']) ? strtotime($row['created_at']) : null;
    }
    unset($row);

    echo json_encode($rows);
} catch (\PDOException $e) {
    // Return empty array if table doesn't exist yet — frontend handles gracefully
    echo json_encode([]);
}
?>
