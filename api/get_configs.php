<?php
require_once 'db.php';

// Allow from any origin (if needed, adjust for production CORS)
header('Content-Type: application/json');

if (!isset($_GET['key'])) {
    echo json_encode(['error' => 'Missing config key']);
    exit;
}

$key = $_GET['key'];

try {
    $stmt = $pdo->prepare("SELECT config_value FROM site_configs WHERE config_key = ?");
    $stmt->execute([$key]);
    $result = $stmt->fetch();

    if ($result) {
        echo json_encode(['success' => true, 'value' => json_decode($result['config_value'], true)]);
    } else {
        echo json_encode(['error' => 'Config key not found']);
    }
} catch(PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
