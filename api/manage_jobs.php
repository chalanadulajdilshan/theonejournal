<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_helper.php';

requireAdmin();

try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS jobs (
            id           INT AUTO_INCREMENT PRIMARY KEY,
            title        VARCHAR(500)  NOT NULL,
            image        VARCHAR(1000) DEFAULT NULL,
            description  LONGTEXT,
            is_published TINYINT(1)    NOT NULL DEFAULT 1,
            sort_order   INT           NOT NULL DEFAULT 0,
            created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
            updated_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
} catch (\PDOException $e) { /* ignore */ }

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query(
            "SELECT id, title, image, description, is_published, sort_order, created_at, updated_at
             FROM jobs
             ORDER BY sort_order ASC, id DESC"
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

        case 'add': {
            $title       = trim($input['title']       ?? '');
            $image       = trim($input['image']       ?? '');
            $description = trim($input['description'] ?? '');
            $pub         = isset($input['is_published']) ? (int)$input['is_published'] : 1;

            if (empty($title)) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'Title is required.']);
                exit;
            }

            $minRow = $pdo->query("SELECT COALESCE(MIN(sort_order), 0) AS min_so FROM jobs")->fetch();
            $newSort = ((int)($minRow['min_so'] ?? 0)) - 1;

            $stmt = $pdo->prepare(
                "INSERT INTO jobs (title, image, description, is_published, sort_order)
                 VALUES (?, ?, ?, ?, ?)"
            );
            $stmt->execute([$title, $image ?: null, $description, $pub, $newSort]);
            echo json_encode(['success' => true, 'message' => 'Job added.', 'id' => $pdo->lastInsertId()]);
            break;
        }

        case 'edit': {
            $id          = intval($input['id']          ?? 0);
            $title       = trim($input['title']         ?? '');
            $image       = trim($input['image']         ?? '');
            $description = trim($input['description']   ?? '');
            $pub         = isset($input['is_published']) ? (int)$input['is_published'] : 1;

            if (!$id || empty($title)) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'ID and title are required.']);
                exit;
            }
            $stmt = $pdo->prepare(
                "UPDATE jobs SET title=?, image=?, description=?, is_published=? WHERE id=?"
            );
            $stmt->execute([$title, $image ?: null, $description, $pub, $id]);
            echo json_encode(['success' => true, 'message' => 'Job saved.']);
            break;
        }

        case 'toggle_publish': {
            $id  = intval($input['id'] ?? 0);
            $pub = intval($input['is_published'] ?? 1);
            if (!$id) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'ID required.']);
                exit;
            }
            $pdo->prepare("UPDATE jobs SET is_published=? WHERE id=?")->execute([$pub, $id]);
            echo json_encode(['success' => true]);
            break;
        }

        case 'delete': {
            $id = intval($input['id'] ?? 0);
            if (!$id) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'ID required.']);
                exit;
            }
            $pdo->prepare("DELETE FROM jobs WHERE id=?")->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Job deleted.']);
            break;
        }

        case 'reorder': {
            $order = $input['order'] ?? [];
            if (!is_array($order) || count($order) < 1) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'A list of job ids is required.']);
                exit;
            }
            $pdo->beginTransaction();
            $upd = $pdo->prepare("UPDATE jobs SET sort_order = ? WHERE id = ?");
            foreach ($order as $i => $jobId) {
                $upd->execute([$i + 1, intval($jobId)]);
            }
            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Job order updated.']);
            break;
        }

        default:
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['error' => 'Invalid action.']);
    }
} catch (\PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
