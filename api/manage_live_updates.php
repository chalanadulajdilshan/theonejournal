<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_helper.php';

requireAdmin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query(
            "SELECT id, title, summary, content, image, author, category, is_published, created_at, updated_at
             FROM live_updates
             ORDER BY created_at DESC"
        );
        echo json_encode($stmt->fetchAll());
    } catch (\PDOException $e) {
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['error' => 'Failed: ' . $e->getMessage()]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['error' => 'Method not allowed.']);
    exit;
}

$input  = json_decode(file_get_contents('php://input'), true);
$action = trim($input['action'] ?? '');

try {
    switch ($action) {

        case 'add':
            $title   = trim($input['title']   ?? '');
            $summary = trim($input['summary'] ?? '');
            $content = trim($input['content'] ?? '');
            $image   = trim($input['image']   ?? '');
            $author  = trim($input['author']  ?? 'Editorial Team');
            $cat     = trim($input['category'] ?? 'General');
            $pub     = isset($input['is_published']) ? (int)$input['is_published'] : 1;

            if (empty($title)) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'Title is required.']);
                exit;
            }
            // Stamp with PHP/system time so "time ago" matches the visitor's clock
            // (MySQL's session timezone can be offset from the server).
            $stmt = $pdo->prepare(
                "INSERT INTO live_updates (title, summary, content, image, author, category, is_published, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
            );
            $stmt->execute([$title, $summary, $content, $image ?: null, $author, $cat, $pub, date('Y-m-d H:i:s')]);
            echo json_encode(['success' => true, 'message' => 'Live update added.', 'id' => $pdo->lastInsertId()]);
            break;

        case 'edit':
            $id      = intval($input['id']     ?? 0);
            $title   = trim($input['title']    ?? '');
            $summary = trim($input['summary']  ?? '');
            $content = trim($input['content']  ?? '');
            $image   = trim($input['image']    ?? '');
            $author  = trim($input['author']   ?? 'Editorial Team');
            $cat     = trim($input['category'] ?? 'General');
            $pub     = isset($input['is_published']) ? (int)$input['is_published'] : 1;

            if (!$id || empty($title)) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'ID and title are required.']);
                exit;
            }
            $stmt = $pdo->prepare(
                "UPDATE live_updates
                 SET title=?, summary=?, content=?, image=?, author=?, category=?, is_published=?
                 WHERE id=?"
            );
            $stmt->execute([$title, $summary, $content, $image ?: null, $author, $cat, $pub, $id]);
            echo json_encode(['success' => true, 'message' => 'Live update saved.']);
            break;

        case 'toggle_publish':
            $id  = intval($input['id'] ?? 0);
            $pub = intval($input['is_published'] ?? 1);
            if (!$id) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'ID required.']);
                exit;
            }
            $pdo->prepare("UPDATE live_updates SET is_published=? WHERE id=?")->execute([$pub, $id]);
            echo json_encode(['success' => true]);
            break;

        case 'delete':
            $id = intval($input['id'] ?? 0);
            if (!$id) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'ID required.']);
                exit;
            }
            $pdo->prepare("DELETE FROM live_updates WHERE id=?")->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Live update deleted.']);
            break;

        default:
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['error' => 'Invalid action.']);
    }
} catch (\PDOException $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
