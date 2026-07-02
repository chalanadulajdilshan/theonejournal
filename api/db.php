<?php
// Run the whole app in UTC. Scheduled publish times are stored as absolute
// instants in UTC (converted from whatever timezone the scheduler's browser is
// in) so a post always goes live at the exact moment its author intended,
// regardless of where the author, the reader, or the server happens to be.
date_default_timezone_set('UTC');

// Database connection configuration
$host = '127.0.0.1';
$db   = 'news';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
     // Keep MySQL's session clock (NOW(), CURRENT_TIMESTAMP) in UTC to match PHP
     // so scheduled-publish comparisons are done consistently in UTC.
     $pdo->exec("SET time_zone = '+00:00'");
} catch (\PDOException $e) {
     header('Content-Type: application/json', true, 500);
     echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
     exit;
}
?>
