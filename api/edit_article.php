<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_helper.php';

// Protect this endpoint
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['error' => 'Method not allowed. Use POST or PUT.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$articleId = trim($input['id'] ?? '');
$title = trim($input['title'] ?? '');
$excerpt = trim($input['excerpt'] ?? '');
$content = trim($input['content'] ?? '');
$image = trim($input['image'] ?? '');
$categoryId = intval($input['categoryId'] ?? 0);
$subcategoryId = intval($input['subcategoryId'] ?? 0);
$author = trim($input['author'] ?? '');
$date = trim($input['date'] ?? '');
$readTime = trim($input['readTime'] ?? '');
$isSponsored = isset($input['isSponsored']) && $input['isSponsored'] ? 1 : 0;
$mediaType = !empty($input['mediaType']) ? trim($input['mediaType']) : null;
$duration = !empty($input['duration']) ? trim($input['duration']) : null;
$mediaUrl = !empty($input['mediaUrl']) ? trim($input['mediaUrl']) : null;

// Validation
if (empty($articleId)) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'Article ID (id) is required.']);
    exit;
}

if (empty($title) || empty($excerpt) || empty($content) || empty($image) || empty($categoryId) || empty($subcategoryId) || empty($author)) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'All core fields (title, excerpt, content, image, categoryId, subcategoryId, author) are required.']);
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

    // Keep original date if not provided
    if (empty($date)) {
        $stmtDate = $pdo->prepare("SELECT date FROM articles WHERE article_id = ?");
        $stmtDate->execute([$articleId]);
        $date = $stmtDate->fetchColumn();
    }

    $stmtUpdate = $pdo->prepare("UPDATE articles SET 
        title = ?, 
        excerpt = ?, 
        content = ?, 
        image = ?, 
        category_id = ?, 
        subcategory_id = ?, 
        author = ?, 
        date = ?, 
        read_time = ?, 
        is_sponsored = ?, 
        media_type = ?, 
        duration = ?,
        media_url = ?
        WHERE article_id = ?");
    
    $stmtUpdate->execute([
        $title,
        $excerpt,
        $content,
        $image,
        $categoryId,
        $subcategoryId,
        $author,
        $date,
        $readTime ?: '3 min read',
        $isSponsored,
        $mediaType,
        $duration,
        $mediaUrl,
        $articleId
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Article updated successfully.',
        'article' => [
            'id' => $articleId,
            'title' => $title,
            'excerpt' => $excerpt,
            'content' => $content,
            'image' => $image,
            'categoryId' => $categoryId,
            'subcategoryId' => $subcategoryId,
            'author' => $author,
            'date' => $date,
            'readTime' => $readTime ?: '3 min read',
            'isSponsored' => (bool)$isSponsored,
            'mediaType' => $mediaType,
            'duration' => $duration,
            'mediaUrl' => $mediaUrl
        ]
    ]);
} catch (\PDOException $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Failed to update article: ' . $e->getMessage()]);
}
?>
