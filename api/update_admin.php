<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_helper.php';

// Only a logged-in admin may change their credentials.
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['error' => 'Method not allowed. Use POST.']);
    exit;
}

$input           = json_decode(file_get_contents('php://input'), true);
$currentPassword = $input['current_password'] ?? '';
$newUsername     = trim($input['new_username'] ?? '');
$newPassword     = $input['new_password'] ?? '';
$currentUsername = $_SESSION['admin_username'] ?? '';

if (empty($currentPassword)) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'Current password is required to confirm changes.']);
    exit;
}

if ($newUsername === '' && $newPassword === '') {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'Provide a new username and/or a new password.']);
    exit;
}

if ($newPassword !== '' && strlen($newPassword) < 8) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'New password must be at least 8 characters.']);
    exit;
}

try {
    // Load the currently signed-in admin and verify the supplied password.
    $stmt = $pdo->prepare("SELECT * FROM admins WHERE username = ?");
    $stmt->execute([$currentUsername]);
    $admin = $stmt->fetch();

    if (!$admin || !password_verify($currentPassword, $admin['password_hash'])) {
        header('HTTP/1.1 401 Unauthorized');
        echo json_encode(['error' => 'Current password is incorrect.']);
        exit;
    }

    $finalUsername = $newUsername !== '' ? $newUsername : $admin['username'];

    // Reject a username already used by a different admin account.
    if ($finalUsername !== $admin['username']) {
        $check = $pdo->prepare("SELECT id FROM admins WHERE username = ? AND id <> ?");
        $check->execute([$finalUsername, $admin['id']]);
        if ($check->fetch()) {
            header('HTTP/1.1 409 Conflict');
            echo json_encode(['error' => 'That username is already taken.']);
            exit;
        }
    }

    $finalHash = $newPassword !== '' ? password_hash($newPassword, PASSWORD_DEFAULT) : $admin['password_hash'];

    $upd = $pdo->prepare("UPDATE admins SET username = ?, password_hash = ? WHERE id = ?");
    $upd->execute([$finalUsername, $finalHash, $admin['id']]);

    // Keep the active session in sync with the new username.
    $_SESSION['admin_username'] = $finalUsername;

    echo json_encode([
        'success'  => true,
        'message'  => 'Credentials updated successfully.',
        'username' => $finalUsername
    ]);
} catch (\PDOException $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Failed to update credentials: ' . $e->getMessage()]);
}
?>
