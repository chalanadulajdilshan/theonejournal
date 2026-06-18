<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

require_once __DIR__ . '/auth_helper.php';

// Only logged-in admins may upload images.
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['error' => 'Method not allowed. Use POST.']);
    exit;
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'No image file received.']);
    exit;
}

$file = $_FILES['image'];

// Validate type by actual content, not just extension.
$allowed = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/gif'  => 'gif',
    'image/webp' => 'webp'
];
$mime = function_exists('mime_content_type') ? mime_content_type($file['tmp_name']) : ($file['type'] ?? '');
if (!isset($allowed[$mime])) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'Only JPG, PNG, GIF or WEBP images are allowed.']);
    exit;
}

// Limit to 5 MB.
if ($file['size'] > 5 * 1024 * 1024) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'Image must be 5 MB or smaller.']);
    exit;
}

$dir = __DIR__ . '/uploads';
if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Could not create the uploads folder.']);
    exit;
}

$ext = $allowed[$mime];
$name = 'img_' . date('Ymd_His') . '_' . bin2hex(random_bytes(5)) . '.' . $ext;
$dest = $dir . '/' . $name;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Failed to save the uploaded image.']);
    exit;
}

// Served through the same /api path the rest of the app already uses.
echo json_encode(['success' => true, 'url' => '/api/uploads/' . $name]);
?>
