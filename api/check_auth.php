<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

require_once __DIR__ . '/auth_helper.php';

if (isAdminLoggedIn()) {
    echo json_encode([
        'authenticated' => true,
        'username' => $_SESSION['admin_username']
    ]);
} else {
    echo json_encode([
        'authenticated' => false
    ]);
}
?>
