<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_helper.php';

// Protect this endpoint
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['error' => 'Method not allowed. Use POST.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$title = trim($input['title'] ?? '');
$excerpt = trim($input['excerpt'] ?? '');
$content = trim($input['content'] ?? '');
$image = trim($input['image'] ?? '');
$categoryId = intval($input['categoryId'] ?? 0);
$subcategoryId = intval($input['subcategoryId'] ?? 0);
$author = trim($input['author'] ?? '');
$readTime = trim($input['readTime'] ?? '');
$isSponsored = isset($input['isSponsored']) && $input['isSponsored'] ? 1 : 0;
$mediaType = !empty($input['mediaType']) ? trim($input['mediaType']) : null;
$duration = !empty($input['duration']) ? trim($input['duration']) : null;
$mediaUrl = !empty($input['mediaUrl']) ? trim($input['mediaUrl']) : null;
$seoTitle = !empty($input['seoTitle']) ? trim($input['seoTitle']) : null;
$metaDescription = !empty($input['metaDescription']) ? trim($input['metaDescription']) : null;
$seoTags = !empty($input['seoTags']) ? trim($input['seoTags']) : null;

// Validation
if (empty($title) || empty($excerpt) || empty($content) || empty($image) || empty($categoryId) || empty($subcategoryId) || empty($author)) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'All core fields (title, excerpt, content, image, categoryId, subcategoryId, author) are required.']);
    exit;
}

// Format date to: Month DD, YYYY (e.g. June 13, 2026)
$date = !empty($input['date']) ? trim($input['date']) : date("F d, Y");

// Generate unique article ID
$articleId = uniqid('art-');

try {
    $stmt = $pdo->prepare("INSERT INTO articles
        (article_id, title, excerpt, content, image, category_id, subcategory_id, author, date, read_time, is_sponsored, media_type, duration, media_url, seo_title, meta_description, seo_tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $stmt->execute([
        $articleId,
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
        $seoTitle,
        $metaDescription,
        $seoTags
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Article created successfully.',
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
            'mediaUrl' => $mediaUrl,
            'seoTitle' => $seoTitle,
            'metaDescription' => $metaDescription,
            'seoTags' => $seoTags
        ]
    ]);
} catch (\PDOException $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Failed to create article: ' . $e->getMessage()]);
}
?>
