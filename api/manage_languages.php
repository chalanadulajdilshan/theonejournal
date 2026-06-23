<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_helper.php';

// Ensure languages table & articles.language_id exist (auto-migrate).
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS languages (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            name       VARCHAR(100) NOT NULL,
            code       VARCHAR(20)  DEFAULT NULL,
            sort_order INT          NOT NULL DEFAULT 0,
            is_visible TINYINT(1)   NOT NULL DEFAULT 1,
            created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_language_name (name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // Seed defaults once
    $count = (int)$pdo->query("SELECT COUNT(*) FROM languages")->fetchColumn();
    if ($count === 0) {
        $pdo->exec("INSERT INTO languages (name, code, sort_order) VALUES
            ('English','en',0),('Arabic','ar',1),('Sinhala','si',2),('Tamil','ta',3)");
    }

    // Add language_id column to articles if missing
    $col = $pdo->query("SHOW COLUMNS FROM articles LIKE 'language_id'")->fetch();
    if (!$col) {
        $pdo->exec("ALTER TABLE articles ADD COLUMN language_id INT NULL AFTER subcategory_id");
    }
} catch (\PDOException $e) { /* ignore migration races */ }

// Public GET (no auth) so the home page can list languages.
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query(
            "SELECT id, name, code, sort_order, is_visible
             FROM languages
             ORDER BY sort_order ASC, name ASC"
        );
        echo json_encode($stmt->fetchAll());
    } catch (\PDOException $e) {
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['error' => 'Failed: ' . $e->getMessage()]);
    }
    exit;
}

// Mutations require admin
requireAdmin();

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
            $code = trim($input['code'] ?? '');
            if (empty($name)) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'Language name is required.']);
                exit;
            }
            $dup = $pdo->prepare("SELECT id FROM languages WHERE name = ?");
            $dup->execute([$name]);
            if ($dup->fetch()) {
                header('HTTP/1.1 409 Conflict');
                echo json_encode(['error' => 'A language named "' . $name . '" already exists.']);
                exit;
            }
            $stmt = $pdo->prepare("INSERT INTO languages (name, code) VALUES (?, ?)");
            $stmt->execute([$name, $code ?: null]);
            echo json_encode(['success' => true, 'message' => 'Language added.', 'id' => $pdo->lastInsertId()]);
            break;
        }

        case 'edit': {
            $id   = intval($input['id'] ?? 0);
            $name = trim($input['name'] ?? '');
            $code = trim($input['code'] ?? '');
            if (!$id || empty($name)) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'ID and name are required.']);
                exit;
            }
            $stmt = $pdo->prepare("UPDATE languages SET name=?, code=? WHERE id=?");
            $stmt->execute([$name, $code ?: null, $id]);
            echo json_encode(['success' => true, 'message' => 'Language saved.']);
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
            $pdo->prepare("UPDATE articles SET language_id = NULL WHERE language_id = ?")->execute([$id]);
            $pdo->prepare("DELETE FROM languages WHERE id=?")->execute([$id]);
            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Language deleted.']);
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
