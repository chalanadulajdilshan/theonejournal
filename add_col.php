<?php require 'api/db.php'; $pdo->exec('ALTER TABLE articles ADD COLUMN youtube_link VARCHAR(255) DEFAULT NULL'); echo 'success'; ?>
