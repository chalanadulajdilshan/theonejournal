<?php
require_once __DIR__ . '/db.php';

echo "Initializing database...\n";

try {
    // 1. Create admins table
    $pdo->exec("CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Table 'admins' created or verified.\n";

    // 2. Create articles table
    $pdo->exec("CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        article_id VARCHAR(50) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        excerpt TEXT NOT NULL,
        content TEXT NOT NULL,
        image TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        tag VARCHAR(50) NOT NULL,
        author VARCHAR(100) NOT NULL,
        date VARCHAR(50) NOT NULL,
        read_time VARCHAR(50) NOT NULL,
        is_sponsored BOOLEAN DEFAULT FALSE,
        media_type VARCHAR(50) DEFAULT NULL,
        duration VARCHAR(50) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Table 'articles' created or verified.\n";

    // 3. Create default admin if not exists
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM admins WHERE username = 'admin'");
    $stmt->execute();
    if ($stmt->fetchColumn() == 0) {
        $defaultPassword = 'AdminPassword123!';
        $hash = password_hash($defaultPassword, PASSWORD_DEFAULT);
        $stmtInsert = $pdo->prepare("INSERT INTO admins (username, password_hash) VALUES ('admin', ?)");
        $stmtInsert->execute([$hash]);
        echo "Default admin user 'admin' created. Password is: $defaultPassword\n";
    } else {
        echo "Admin user 'admin' already exists.\n";
    }

    // 4. Seed articles from seed_data.json if table is empty
    $stmtCount = $pdo->query("SELECT COUNT(*) FROM articles");
    if ($stmtCount->fetchColumn() == 0) {
        $jsonPath = __DIR__ . '/seed_data.json';
        if (file_exists($jsonPath)) {
            $jsonData = json_decode(file_get_contents($jsonPath), true);
            if ($jsonData) {
                $stmtInsertArt = $pdo->prepare("INSERT INTO articles 
                    (article_id, title, excerpt, content, image, category, tag, author, date, read_time, is_sponsored, media_type, duration)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

                $count = 0;
                foreach ($jsonData as $categoryKey => $articlesList) {
                    foreach ($articlesList as $art) {
                        $articleId = $art['id'] ?? uniqid('article-');
                        $title = $art['title'] ?? '';
                        $excerpt = $art['excerpt'] ?? '';
                        $content = $art['content'] ?? '';
                        $image = $art['image'] ?? '';
                        $category = $art['category'] ?? '';
                        $tag = $art['tag'] ?? '';
                        $author = $art['author'] ?? '';
                        $date = $art['date'] ?? '';
                        $readTime = $art['readTime'] ?? '';
                        $isSponsored = isset($art['isSponsored']) && $art['isSponsored'] ? 1 : 0;
                        $mediaType = $art['mediaType'] ?? null;
                        $duration = $art['duration'] ?? null;

                        $stmtInsertArt->execute([
                            $articleId,
                            $title,
                            $excerpt,
                            $content,
                            $image,
                            $category,
                            $tag,
                            $author,
                            $date,
                            $readTime,
                            $isSponsored,
                            $mediaType,
                            $duration
                        ]);
                        $count++;
                    }
                }
                echo "Successfully seeded $count articles into the 'articles' table.\n";
            } else {
                echo "Error: Failed to decode 'seed_data.json'.\n";
            }
        } else {
            echo "Error: 'seed_data.json' not found.\n";
        }
    } else {
        echo "Table 'articles' already contains data. Skipping seeding.\n";
    }

    echo "Database initialization complete.\n";

} catch (\PDOException $e) {
    echo "Error during database initialization: " . $e->getMessage() . "\n";
    exit(1);
}
?>
