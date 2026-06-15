<?php require 'api/db.php'; print_r($pdo->query('SHOW COLUMNS FROM articles')->fetchAll(PDO::FETCH_ASSOC)); ?>
