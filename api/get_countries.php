<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

require_once __DIR__ . '/db.php';

$onlyWithJobs = isset($_GET['with_jobs']) && $_GET['with_jobs'] == '1';

try {
    if ($onlyWithJobs) {
        $sql = "SELECT c.id, c.name, c.flag, c.sort_order, COUNT(j.id) AS job_count
                FROM countries c
                INNER JOIN jobs j ON j.country_id = c.id AND j.is_published = 1
                GROUP BY c.id, c.name, c.flag, c.sort_order
                ORDER BY c.sort_order ASC, c.name ASC";
    } else {
        $sql = "SELECT id, name, flag, sort_order
                FROM countries
                ORDER BY sort_order ASC, name ASC";
    }
    $stmt = $pdo->query($sql);
    echo json_encode($stmt->fetchAll());
} catch (\PDOException $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Failed: ' . $e->getMessage()]);
}
?>
