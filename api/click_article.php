<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['error' => 'Method not allowed. Use POST.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$articleId = $input['id'] ?? '';

if (empty($articleId)) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'Article ID is required.']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE articles SET last_clicked_at = NOW(), views_count = views_count + 1 WHERE article_id = ?");
    $stmt->execute([$articleId]);
    
    echo json_encode(['success' => true, 'message' => 'Article view recorded.']);
} catch (\PDOException $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Failed to record click: ' . $e->getMessage()]);
}
?>
