<?php
require_once 'db.php';
require_once 'auth_helper.php';

header('Content-Type: application/json');

// Ensure user is authenticated as admin
requireAdmin();

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Invalid request method']);
    exit;
}

// Read raw POST data
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!isset($input['key']) || !isset($input['value'])) {
    echo json_encode(['error' => 'Missing key or value parameter']);
    exit;
}

$key = $input['key'];
// Store as JSON string
$value = json_encode($input['value']); 

try {
    // Upsert logic
    $stmt = $pdo->prepare("
        INSERT INTO site_configs (config_key, config_value) 
        VALUES (?, ?) 
        ON DUPLICATE KEY UPDATE config_value = ?
    ");
    $stmt->execute([$key, $value, $value]);
    
    echo json_encode(['success' => true, 'message' => 'Configuration updated successfully']);
} catch(PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
