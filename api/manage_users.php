<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_helper.php';

// Only a signed-in admin may manage users.
requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT id, username, created_at FROM admins ORDER BY id ASC");
        echo json_encode($stmt->fetchAll());
        exit;
    }

    if ($method !== 'POST') {
        header('HTTP/1.1 405 Method Not Allowed');
        echo json_encode(['error' => 'Method not allowed.']);
        exit;
    }

    $input    = json_decode(file_get_contents('php://input'), true) ?: [];
    $action   = $input['action'] ?? '';
    $username = trim($input['username'] ?? '');
    $password = $input['password'] ?? '';
    $id       = isset($input['id']) ? (int)$input['id'] : 0;

    if ($action === 'add') {
        if ($username === '' || $password === '') {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['error' => 'Username and password are required.']);
            exit;
        }
        if (strlen($password) < 8) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['error' => 'Password must be at least 8 characters.']);
            exit;
        }

        $check = $pdo->prepare("SELECT id FROM admins WHERE username = ?");
        $check->execute([$username]);
        if ($check->fetch()) {
            header('HTTP/1.1 409 Conflict');
            echo json_encode(['error' => 'That username is already taken.']);
            exit;
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);
        $ins  = $pdo->prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)");
        $ins->execute([$username, $hash]);

        echo json_encode(['success' => true, 'id' => (int)$pdo->lastInsertId()]);
        exit;
    }

    if ($action === 'edit') {
        if ($id <= 0) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['error' => 'User id is required.']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM admins WHERE id = ?");
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        if (!$user) {
            header('HTTP/1.1 404 Not Found');
            echo json_encode(['error' => 'User not found.']);
            exit;
        }

        $finalUsername = $username !== '' ? $username : $user['username'];

        if ($finalUsername !== $user['username']) {
            $check = $pdo->prepare("SELECT id FROM admins WHERE username = ? AND id <> ?");
            $check->execute([$finalUsername, $id]);
            if ($check->fetch()) {
                header('HTTP/1.1 409 Conflict');
                echo json_encode(['error' => 'That username is already taken.']);
                exit;
            }
        }

        if ($password !== '') {
            if (strlen($password) < 8) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'Password must be at least 8 characters.']);
                exit;
            }
            $finalHash = password_hash($password, PASSWORD_DEFAULT);
        } else {
            $finalHash = $user['password_hash'];
        }

        $upd = $pdo->prepare("UPDATE admins SET username = ?, password_hash = ? WHERE id = ?");
        $upd->execute([$finalUsername, $finalHash, $id]);

        // Keep the live session label in sync if the signed-in user renamed themselves.
        if (($_SESSION['admin_username'] ?? '') === $user['username']) {
            $_SESSION['admin_username'] = $finalUsername;
        }

        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'delete') {
        if ($id <= 0) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['error' => 'User id is required.']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT username FROM admins WHERE id = ?");
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        if (!$user) {
            header('HTTP/1.1 404 Not Found');
            echo json_encode(['error' => 'User not found.']);
            exit;
        }

        // Never let the panel lock itself out — refuse to delete the last account.
        $count = (int)$pdo->query("SELECT COUNT(*) FROM admins")->fetchColumn();
        if ($count <= 1) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['error' => 'Cannot delete the last remaining user.']);
            exit;
        }

        // Don't let an admin delete the account they're currently signed in as.
        if (($_SESSION['admin_username'] ?? '') === $user['username']) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['error' => 'You cannot delete the account you are currently signed in as.']);
            exit;
        }

        $del = $pdo->prepare("DELETE FROM admins WHERE id = ?");
        $del->execute([$id]);

        echo json_encode(['success' => true]);
        exit;
    }

    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'Unknown action.']);
} catch (\PDOException $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
