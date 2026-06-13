<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_helper.php';

// Protect this endpoint
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['error' => 'Method not allowed. Use POST or DELETE.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$articleId = trim($input['id'] ?? '');

if (empty($articleId)) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'Article ID (id) is required.']);
    exit;
}

try {
    // Check if article exists
    $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM articles WHERE article_id = ?");
    $stmtCheck->execute([$articleId]);
    if ($stmtCheck->fetchColumn() == 0) {
        header('HTTP/1.1 404 Not Found');
        echo json_encode(['error' => 'Article not found.']);
        exit;
    }

    $stmtDelete = $pdo->prepare("DELETE FROM articles WHERE article_id = ?");
    $stmtDelete->execute([$articleId]);

    echo json_encode([
        'success' => true,
        'message' => 'Article deleted successfully.',
        'id' => $articleId
    ]);
} catch (\PDOException $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Failed to delete article: ' . $e->getMessage()]);
}
?>
