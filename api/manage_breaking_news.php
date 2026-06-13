<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_helper.php';

// Protect this endpoint
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['error' => 'Method not allowed. Use POST.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$action = trim($input['action'] ?? '');

try {
    switch ($action) {
        case 'add_breaking':
            $title = trim($input['title'] ?? '');
            if (empty($title)) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'Breaking news headline is required.']);
                exit;
            }
            $stmt = $pdo->prepare("INSERT INTO breaking_news (title) VALUES (?)");
            $stmt->execute([$title]);
            echo json_encode(['success' => true, 'message' => 'Breaking news added successfully.', 'id' => $pdo->lastInsertId()]);
            break;

        case 'edit_breaking':
            $id = intval($input['id'] ?? 0);
            $title = trim($input['title'] ?? '');
            if (empty($id) || empty($title)) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'ID and headline are required.']);
                exit;
            }
            $stmt = $pdo->prepare("UPDATE breaking_news SET title = ? WHERE id = ?");
            $stmt->execute([$title, $id]);
            echo json_encode(['success' => true, 'message' => 'Breaking news updated successfully.']);
            break;

        case 'delete_breaking':
            $id = intval($input['id'] ?? 0);
            if (empty($id)) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'ID is required.']);
                exit;
            }
            $stmt = $pdo->prepare("DELETE FROM breaking_news WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Breaking news deleted successfully.']);
            break;

        default:
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['error' => 'Invalid action.']);
    }
} catch (\PDOException $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Database operation failed: ' . $e->getMessage()]);
}
?>
