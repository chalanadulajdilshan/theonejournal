<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

require_once __DIR__ . '/db.php';

// Increment a country's view counter when a visitor opens its job listings.
$countryId = isset($_GET['country_id']) && $_GET['country_id'] !== '' ? (int)$_GET['country_id'] : null;
if (!$countryId && isset($_POST['country_id'])) {
    $countryId = (int)$_POST['country_id'];
}

if (!$countryId) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'country_id is required']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE countries SET views = views + 1 WHERE id = ?");
    $stmt->execute([$countryId]);

    $vStmt = $pdo->prepare("SELECT views FROM countries WHERE id = ?");
    $vStmt->execute([$countryId]);
    $views = (int)$vStmt->fetchColumn();

    echo json_encode(['success' => true, 'views' => $views]);
} catch (\PDOException $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Failed: ' . $e->getMessage()]);
}
?>
