<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

require_once __DIR__ . '/db.php';

$countryId = isset($_GET['country_id']) && $_GET['country_id'] !== '' ? (int)$_GET['country_id'] : null;

try {
    if ($countryId) {
        $stmt = $pdo->prepare(
            "SELECT j.id, j.title, j.image, j.description, j.country_id, j.sort_order, j.created_at, j.updated_at,
                    c.name AS country_name, c.flag AS country_flag
             FROM jobs j
             LEFT JOIN countries c ON c.id = j.country_id
             WHERE j.is_published = 1 AND j.country_id = ?
             ORDER BY j.sort_order ASC, j.id DESC"
        );
        $stmt->execute([$countryId]);
    } else {
        $stmt = $pdo->query(
            "SELECT j.id, j.title, j.image, j.description, j.country_id, j.sort_order, j.created_at, j.updated_at,
                    c.name AS country_name, c.flag AS country_flag
             FROM jobs j
             LEFT JOIN countries c ON c.id = j.country_id
             WHERE j.is_published = 1
             ORDER BY j.sort_order ASC, j.id DESC"
        );
    }
    echo json_encode($stmt->fetchAll());
} catch (\PDOException $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Failed: ' . $e->getMessage()]);
}
?>
