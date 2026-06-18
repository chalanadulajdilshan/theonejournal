<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_helper.php';

requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['error' => 'Method not allowed. Use POST.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$order = $input['order'] ?? [];   // article_id values in their new display order

if (!is_array($order) || count($order) < 2) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'A list of at least two article ids is required.']);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Normalise every article to a distinct sort_order, preserving the
    //    current ordering. This keeps the maths simple even right after a seed
    //    where all sort_order values are 0.
    $pdo->exec("SET @r := 0");
    $pdo->exec("UPDATE articles SET sort_order = (@r := @r + 1) ORDER BY sort_order ASC, id DESC");

    // 2. Read back the (now distinct) slots occupied by the dragged subset.
    $placeholders = implode(',', array_fill(0, count($order), '?'));
    $stmt = $pdo->prepare("SELECT article_id, sort_order FROM articles WHERE article_id IN ($placeholders)");
    $stmt->execute($order);

    $slots = [];
    foreach ($stmt as $row) {
        $slots[] = (int) $row['sort_order'];
    }
    sort($slots, SORT_NUMERIC);

    if (count($slots) !== count($order)) {
        $pdo->rollBack();
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(['error' => 'Some articles were not found.']);
        exit;
    }

    // 3. Reassign the sorted slots to the new visual order so only the dragged
    //    items are permuted; everything else keeps its place.
    $upd = $pdo->prepare("UPDATE articles SET sort_order = ? WHERE article_id = ?");
    foreach ($order as $i => $articleId) {
        $upd->execute([$slots[$i], $articleId]);
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Article order updated.']);
} catch (\PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Failed to reorder: ' . $e->getMessage()]);
}
?>
