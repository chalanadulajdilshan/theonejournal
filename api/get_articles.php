<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

require_once __DIR__ . '/db.php';

function mapRowToArticle($row) {
    $article = [
        'id' => $row['article_id'],
        'title' => $row['title'],
        'excerpt' => $row['excerpt'],
        'content' => $row['content'],
        'image' => $row['image'],
        'category' => $row['category_name'],
        'categoryId' => intval($row['category_id']),
        'tag' => $row['subcategory_name'],
        'subcategoryId' => intval($row['subcategory_id']),
        'author' => $row['author'],
        'date' => $row['date'],
        'readTime' => $row['read_time'],
        'isSponsored' => (bool)$row['is_sponsored'],
        'views' => intval($row['views_count'] ?? 0)
    ];

    if ($row['media_type'] !== null) {
        $article['mediaType'] = $row['media_type'];
    }
    if ($row['duration'] !== null) {
        $article['duration'] = $row['duration'];
    }
    if (isset($row['media_url']) && $row['media_url'] !== null) {
        $article['mediaUrl'] = $row['media_url'];
    }
    return $article;
}

try {
    // 1. Fetch all articles joined with category and subcategory tables for regular sections
    $stmt = $pdo->query("
        SELECT 
            a.*, 
            c.name AS category_name, 
            s.name AS subcategory_name 
        FROM articles a
        JOIN categories c ON a.category_id = c.id
        JOIN subcategories s ON a.subcategory_id = s.id
        ORDER BY a.sort_order ASC, a.id DESC
    ");
    $dbArticles = $stmt->fetchAll();

    // Initialize the structure mirroring mockArticles
    $response = [
        'partnerContent' => [],
        'videosAndPodcasts' => [],
        'youMayLike' => [],
        'world' => [],
        'business' => [],
        'tech' => [],
        'life' => []
    ];

    // Map DB categories to response keys (excluding 'you may like' as it is dynamic now)
    $categoryMap = [
        'partner content' => 'partnerContent',
        'videos & podcasts' => 'videosAndPodcasts',
        'world' => 'world',
        'business' => 'business',
        'tech' => 'tech',
        'life' => 'life'
    ];

    foreach ($dbArticles as $row) {
        $article = mapRowToArticle($row);
        $lowerCat = strtolower(trim($row['category_name']));
        
        // Skip adding static 'you may like' articles to response keys to avoid conflicts
        if ($lowerCat === 'you may like') {
            continue;
        }

        $targetKey = $categoryMap[$lowerCat] ?? null;
        if ($targetKey) {
            $response[$targetKey][] = $article;
        } else {
            // Default fallback if category doesn't strictly match static list
            $camelCat = lcfirst(str_replace(' ', '', ucwords($row['category_name'])));
            if (!isset($response[$camelCat])) {
                $response[$camelCat] = [];
            }
            $response[$camelCat][] = $article;
        }
    }

    // 2. Fetch top 5 most viewed articles dynamically for the "You May Like" section
    //    Only articles that have been clicked at least once will appear (starts empty)
    $stmtLike = $pdo->query("
        SELECT 
            a.*, 
            c.name AS category_name, 
            s.name AS subcategory_name 
        FROM articles a
        JOIN categories c ON a.category_id = c.id
        JOIN subcategories s ON a.subcategory_id = s.id
        WHERE a.views_count > 0
        ORDER BY a.views_count DESC, a.last_clicked_at DESC
        LIMIT 5
    ");
    $dbLikeArticles = $stmtLike->fetchAll();

    foreach ($dbLikeArticles as $row) {
        $response['youMayLike'][] = mapRowToArticle($row);
    }

    echo json_encode($response);

} catch (\PDOException $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Failed to fetch articles: ' . $e->getMessage()]);
}
?>
