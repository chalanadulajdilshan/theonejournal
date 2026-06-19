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
        CREATE TABLE IF NOT EXISTS countries (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            name       VARCHAR(255)  NOT NULL,
            flag       VARCHAR(1000) DEFAULT NULL,
            sort_order INT           NOT NULL DEFAULT 0,
            created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_country_name (name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
} catch (\PDOException $e) { /* ignore */ }

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query(
            "SELECT id, name, flag, sort_order, created_at, updated_at
             FROM countries
             ORDER BY sort_order ASC, name ASC"
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
            $name = trim($input['name'] ?? '');
            $flag = trim($input['flag'] ?? '');
            if (empty($name)) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'Country name is required.']);
                exit;
            }
            $dup = $pdo->prepare("SELECT id FROM countries WHERE name = ?");
            $dup->execute([$name]);
            if ($dup->fetch()) {
                header('HTTP/1.1 409 Conflict');
                echo json_encode(['error' => 'A country named "' . $name . '" already exists.']);
                exit;
            }
            $stmt = $pdo->prepare("INSERT INTO countries (name, flag) VALUES (?, ?)");
            $stmt->execute([$name, $flag ?: null]);
            echo json_encode(['success' => true, 'message' => 'Country added.', 'id' => $pdo->lastInsertId()]);
            break;
        }

        case 'edit': {
            $id   = intval($input['id'] ?? 0);
            $name = trim($input['name'] ?? '');
            $flag = trim($input['flag'] ?? '');
            if (!$id || empty($name)) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'ID and name are required.']);
                exit;
            }
            $stmt = $pdo->prepare("UPDATE countries SET name=?, flag=? WHERE id=?");
            $stmt->execute([$name, $flag ?: null, $id]);
            echo json_encode(['success' => true, 'message' => 'Country saved.']);
            break;
        }

        case 'delete': {
            $id = intval($input['id'] ?? 0);
            if (!$id) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'ID required.']);
                exit;
            }
            $pdo->beginTransaction();
            try { $pdo->prepare("UPDATE jobs SET country_id = NULL WHERE country_id = ?")->execute([$id]); } catch (\PDOException $e) { /* jobs may not have country_id yet */ }
            $pdo->prepare("DELETE FROM countries WHERE id=?")->execute([$id]);
            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Country deleted.']);
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
