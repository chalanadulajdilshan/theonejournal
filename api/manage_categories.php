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

function slugify($text) {
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
    $text = preg_replace('~[^-\w]+~', '', $text);
    $text = trim($text, '-');
    $text = preg_replace('~-+~', '-', $text);
    $text = strtolower($text);
    return empty($text) ? 'n-a' : $text;
}

try {
    switch ($action) {
        case 'add_category':
            $name = trim($input['name'] ?? '');
            if (empty($name)) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'Category name is required.']);
                exit;
            }
            $dup = $pdo->prepare("SELECT id FROM categories WHERE name = ?");
            $dup->execute([$name]);
            if ($dup->fetch()) {
                header('HTTP/1.1 409 Conflict');
                echo json_encode(['error' => 'A category named "' . $name . '" already exists.']);
                exit;
            }
            $slug = slugify($name);
            $stmt = $pdo->prepare("INSERT INTO categories (name, slug) VALUES (?, ?)");
            $stmt->execute([$name, $slug]);
            echo json_encode(['success' => true, 'message' => 'Category added successfully.', 'id' => $pdo->lastInsertId()]);
            break;

        case 'edit_category':
            $id = intval($input['id'] ?? 0);
            $name = trim($input['name'] ?? '');
            if (empty($id) || empty($name)) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'Category ID and name are required.']);
                exit;
            }
            $slug = slugify($name);
            $stmt = $pdo->prepare("UPDATE categories SET name = ?, slug = ? WHERE id = ?");
            $stmt->execute([$name, $slug, $id]);
            echo json_encode(['success' => true, 'message' => 'Category updated successfully.']);
            break;

        case 'reorder_categories':
            $order = $input['order'] ?? [];   // category ids in their new order
            if (!is_array($order) || count($order) < 2) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'A list of at least two category ids is required.']);
                exit;
            }
            $pdo->beginTransaction();
            $upd = $pdo->prepare("UPDATE categories SET sort_order = ? WHERE id = ?");
            foreach ($order as $i => $id) {
                $upd->execute([$i, intval($id)]);
            }
            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Category order updated.']);
            break;

        case 'toggle_category_visibility':
            $id  = intval($input['id'] ?? 0);
            $vis = isset($input['is_visible']) ? (int)(bool)$input['is_visible'] : 1;
            if (empty($id)) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'Category ID is required.']);
                exit;
            }
            $pdo->prepare("UPDATE categories SET is_visible = ? WHERE id = ?")->execute([$vis, $id]);
            echo json_encode(['success' => true, 'message' => 'Category visibility updated.']);
            break;

        case 'delete_category':
            $id = intval($input['id'] ?? 0);
            if (empty($id)) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'Category ID is required.']);
                exit;
            }
            // Articles require a valid category (NOT NULL + FK RESTRICT), so removing a
            // category also removes its sub-tags and articles. Done atomically.
            $pdo->beginTransaction();
            $pdo->prepare("DELETE FROM articles WHERE category_id = ?")->execute([$id]);
            $pdo->prepare("DELETE FROM subcategories WHERE category_id = ?")->execute([$id]);
            $pdo->prepare("DELETE FROM categories WHERE id = ?")->execute([$id]);
            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Category, its sub-tags, and articles deleted successfully.']);
            break;

        case 'add_subcategory':
            $categoryId = intval($input['category_id'] ?? 0);
            $name = trim($input['name'] ?? '');
            if (empty($categoryId) || empty($name)) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'Category ID and subcategory name are required.']);
                exit;
            }
            $dup = $pdo->prepare("SELECT id FROM subcategories WHERE category_id = ? AND name = ?");
            $dup->execute([$categoryId, $name]);
            if ($dup->fetch()) {
                header('HTTP/1.1 409 Conflict');
                echo json_encode(['error' => 'A sub-tag named "' . $name . '" already exists in this category.']);
                exit;
            }
            $slug = slugify($name);
            $stmt = $pdo->prepare("INSERT INTO subcategories (category_id, name, slug) VALUES (?, ?, ?)");
            $stmt->execute([$categoryId, $name, $slug]);
            echo json_encode(['success' => true, 'message' => 'Subcategory added successfully.', 'id' => $pdo->lastInsertId()]);
            break;

        case 'edit_subcategory':
            $id = intval($input['id'] ?? 0);
            $name = trim($input['name'] ?? '');
            if (empty($id) || empty($name)) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'Subcategory ID and name are required.']);
                exit;
            }
            $slug = slugify($name);
            $stmt = $pdo->prepare("UPDATE subcategories SET name = ?, slug = ? WHERE id = ?");
            $stmt->execute([$name, $slug, $id]);
            echo json_encode(['success' => true, 'message' => 'Subcategory updated successfully.']);
            break;

        case 'delete_subcategory':
            $id = intval($input['id'] ?? 0);
            if (empty($id)) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'Subcategory ID is required.']);
                exit;
            }
            // Articles require a valid sub-tag, so removing it also removes its articles.
            $pdo->beginTransaction();
            $pdo->prepare("DELETE FROM articles WHERE subcategory_id = ?")->execute([$id]);
            $pdo->prepare("DELETE FROM subcategories WHERE id = ?")->execute([$id]);
            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Sub-tag and its articles deleted successfully.']);
            break;

        case 'set_category_translations':
        case 'set_subcategory_translations': {
            $id = intval($input['id'] ?? 0);
            $translations = $input['translations'] ?? null;
            if (empty($id) || !is_array($translations)) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'ID and translations object are required.']);
                exit;
            }
            // Keep only non-empty string values keyed by short locale codes.
            $clean = [];
            foreach ($translations as $code => $val) {
                $code = strtolower(trim((string)$code));
                $val = trim((string)$val);
                if ($code === '' || $val === '') continue;
                if (!preg_match('/^[a-z]{2}(-[a-z0-9]{2,8})?$/', $code)) continue;
                $clean[$code] = $val;
            }
            $json = $clean ? json_encode($clean, JSON_UNESCAPED_UNICODE) : null;
            $table = $action === 'set_category_translations' ? 'categories' : 'subcategories';
            $stmt = $pdo->prepare("UPDATE `$table` SET translations = ? WHERE id = ?");
            $stmt->execute([$json, $id]);
            echo json_encode(['success' => true, 'translations' => (object)$clean]);
            break;
        }

        default:
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['error' => 'Invalid action.']);
    }

} catch (\PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Database operation failed: ' . $e->getMessage()]);
}
?>
