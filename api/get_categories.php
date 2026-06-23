<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

require_once __DIR__ . '/db.php';

try {
    // Idempotently add the `translations` column on first call so existing
    // installs pick it up without a manual migration. Stored shape is a small
    // JSON map keyed by language code, e.g. {"ar":"دولي","si":"ජාත්‍යන්තර"}.
    // information_schema is used so the ALTER only runs when needed (some
    // shared-hosting MySQL builds reject IF NOT EXISTS for ADD COLUMN).
    foreach (['categories', 'subcategories'] as $tbl) {
        $check = $pdo->prepare(
            "SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ?
               AND COLUMN_NAME = 'translations'"
        );
        $check->execute([$tbl]);
        if ((int)$check->fetchColumn() === 0) {
            $pdo->exec("ALTER TABLE `$tbl` ADD COLUMN translations TEXT NULL");
        }
    }

    $decodeTranslations = function ($raw) {
        if (!$raw) return new stdClass();
        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : new stdClass();
    };

    // Fetch all categories in the admin-defined drag order
    $catStmt = $pdo->query("SELECT * FROM categories ORDER BY sort_order ASC, name ASC");
    $categories = $catStmt->fetchAll();

    // Fetch all subcategories
    $subStmt = $pdo->query("SELECT * FROM subcategories ORDER BY name ASC");
    $subcategories = $subStmt->fetchAll();

    // Group subcategories by category_id (cast to int so hosts without mysqlnd still return numeric IDs)
    $subsByCategory = [];
    foreach ($subcategories as $sub) {
        $catId = (int)$sub['category_id'];
        if (!isset($subsByCategory[$catId])) {
            $subsByCategory[$catId] = [];
        }
        $subsByCategory[$catId][] = [
            'id' => (int)$sub['id'],
            'name' => $sub['name'],
            'slug' => $sub['slug'],
            'translations' => $decodeTranslations($sub['translations'] ?? null)
        ];
    }

    // Combine them into a single array
    $response = [];
    foreach ($categories as $cat) {
        $catId = (int)$cat['id'];
        $response[] = [
            'id' => $catId,
            'name' => $cat['name'],
            'slug' => $cat['slug'],
            'is_visible' => isset($cat['is_visible']) ? (int)$cat['is_visible'] : 1,
            'translations' => $decodeTranslations($cat['translations'] ?? null),
            'subcategories' => $subsByCategory[$catId] ?? []
        ];
    }

    echo json_encode($response);

} catch (\PDOException $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Failed to fetch categories: ' . $e->getMessage()]);
}
?>
