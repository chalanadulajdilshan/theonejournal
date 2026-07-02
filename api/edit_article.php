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
$imageCredit = array_key_exists('imageCredit', $input)
    ? (empty($input['imageCredit']) ? null : trim($input['imageCredit']))
    : false; // false = "not provided, leave existing"
$categoryId = intval($input['categoryId'] ?? 0);
$subcategoryId = intval($input['subcategoryId'] ?? 0);
$languageId = array_key_exists('languageId', $input)
    ? (empty($input['languageId']) ? null : intval($input['languageId']))
    : false; // false = "not provided, leave existing"
$author = trim($input['author'] ?? '');
$date = trim($input['date'] ?? '');
// Scheduling: publishedAt is an optional datetime. false = "not provided, leave existing".
$publishedAtRaw = array_key_exists('publishedAt', $input) ? trim($input['publishedAt'] ?? '') : false;
$publishedAt = false;
if ($publishedAtRaw !== false && $publishedAtRaw !== '') {
    $ts = strtotime($publishedAtRaw);
    if ($ts !== false) {
        $publishedAt = date('Y-m-d H:i:s', $ts);
    }
}
$readTime = trim($input['readTime'] ?? '');
$isSponsored = isset($input['isSponsored']) && $input['isSponsored'] ? 1 : 0;
$mediaType = !empty($input['mediaType']) ? trim($input['mediaType']) : null;
$duration = !empty($input['duration']) ? trim($input['duration']) : null;
$mediaUrl = !empty($input['mediaUrl']) ? trim($input['mediaUrl']) : null;
$seoTitle = !empty($input['seoTitle']) ? trim($input['seoTitle']) : null;
$metaDescription = !empty($input['metaDescription']) ? trim($input['metaDescription']) : null;
$seoTags = !empty($input['seoTags']) ? trim($input['seoTags']) : null;

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

    // When a (re)schedule datetime is provided, keep the displayed date in sync with it.
    if ($publishedAt !== false) {
        $date = date('F d, Y', strtotime($publishedAt));
    }

    // Keep original date if not provided
    if (empty($date)) {
        $stmtDate = $pdo->prepare("SELECT date FROM articles WHERE article_id = ?");
        $stmtDate->execute([$articleId]);
        $date = $stmtDate->fetchColumn();
    }

    // Auto-add language_id column on first run after deploy
    $hasLang = $pdo->query("SHOW COLUMNS FROM articles LIKE 'language_id'")->fetch();
    if (!$hasLang) {
        $pdo->exec("ALTER TABLE articles ADD COLUMN language_id INT NULL AFTER subcategory_id");
    }
    // Auto-add image_credit column on first run after deploy
    $hasImgCredit = $pdo->query("SHOW COLUMNS FROM articles LIKE 'image_credit'")->fetch();
    if (!$hasImgCredit) {
        $pdo->exec("ALTER TABLE articles ADD COLUMN image_credit VARCHAR(255) NULL AFTER image");
    }
    // Auto-add published_at column on first run after deploy (scheduling support)
    $hasPublishedAt = $pdo->query("SHOW COLUMNS FROM articles LIKE 'published_at'")->fetch();
    if (!$hasPublishedAt) {
        $pdo->exec("ALTER TABLE articles ADD COLUMN published_at DATETIME NULL AFTER date");
    }

    $setLanguage = $languageId !== false;
    $setImageCredit = $imageCredit !== false;
    $setPublishedAt = $publishedAt !== false;
    $sql = "UPDATE articles SET
        title = ?,
        excerpt = ?,
        content = ?,
        image = ?, "
        . ($setImageCredit ? "image_credit = ?, " : "") .
        "category_id = ?,
        subcategory_id = ?, "
        . ($setLanguage ? "language_id = ?, " : "") .
        "author = ?,
        date = ?, "
        . ($setPublishedAt ? "published_at = ?, " : "") .
        "read_time = ?,
        is_sponsored = ?,
        media_type = ?,
        duration = ?,
        media_url = ?,
        seo_title = ?,
        meta_description = ?,
        seo_tags = ?
        WHERE article_id = ?";

    $params = [
        $title,
        $excerpt,
        $content,
        $image,
    ];
    if ($setImageCredit) $params[] = $imageCredit;
    array_push($params, $categoryId, $subcategoryId);
    if ($setLanguage) $params[] = $languageId;
    array_push($params, $author, $date);
    if ($setPublishedAt) $params[] = $publishedAt;
    array_push($params,
        $readTime ?: '3 min read',
        $isSponsored,
        $mediaType,
        $duration,
        $mediaUrl,
        $seoTitle,
        $metaDescription,
        $seoTags,
        $articleId
    );

    $stmtUpdate = $pdo->prepare($sql);
    $stmtUpdate->execute($params);

    echo json_encode([
        'success' => true,
        'message' => 'Article updated successfully.',
        'article' => [
            'id' => $articleId,
            'title' => $title,
            'excerpt' => $excerpt,
            'content' => $content,
            'image' => $image,
            'imageCredit' => $imageCredit === false ? null : $imageCredit,
            'categoryId' => $categoryId,
            'subcategoryId' => $subcategoryId,
            'languageId' => $languageId === false ? null : $languageId,
            'author' => $author,
            'date' => $date,
            'publishedAt' => $publishedAt === false ? null : $publishedAt,
            'isScheduled' => $publishedAt !== false && strtotime($publishedAt) > time(),
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
    echo json_encode(['error' => 'Failed to update article: ' . $e->getMessage()]);
}
?>
