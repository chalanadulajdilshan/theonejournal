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

        case 'delete_category':
            $id = intval($input['id'] ?? 0);
            if (empty($id)) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'Category ID is required.']);
                exit;
            }
            // Delete category
            $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Category deleted successfully.']);
            break;

        case 'add_subcategory':
            $categoryId = intval($input['category_id'] ?? 0);
            $name = trim($input['name'] ?? '');
            if (empty($categoryId) || empty($name)) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'Category ID and subcategory name are required.']);
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
            $stmt = $pdo->prepare("DELETE FROM subcategories WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Subcategory deleted successfully.']);
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
