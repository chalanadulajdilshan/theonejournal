<?php
require_once __DIR__ . '/db.php';

echo "Migrating database to relational schema...\n";

function slugify($text) {
    // replace non letter or digits by -
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);
    // transliterate
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
    // remove unwanted characters
    $text = preg_replace('~[^-\w]+~', '', $text);
    // trim
    $text = trim($text, '-');
    // remove duplicate -
    $text = preg_replace('~-+~', '-', $text);
    // lowercase
    $text = strtolower($text);
    if (empty($text)) {
        return 'n-a';
    }
    return $text;
}

try {
    // Disable foreign key checks to safely drop tables
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $pdo->exec("DROP TABLE IF EXISTS articles;");
    $pdo->exec("DROP TABLE IF EXISTS subcategories;");
    $pdo->exec("DROP TABLE IF EXISTS categories;");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");
    echo "Dropped old tables.\n";

    // 1. Create categories table
    $pdo->exec("CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Table 'categories' created.\n";

    // 2. Create subcategories table
    $pdo->exec("CREATE TABLE IF NOT EXISTS subcategories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        UNIQUE KEY (category_id, name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Table 'subcategories' created.\n";

    // 3. Create articles table with FK relations
    $pdo->exec("CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        article_id VARCHAR(50) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        excerpt TEXT NOT NULL,
        content TEXT NOT NULL,
        image TEXT NOT NULL,
        category_id INT NOT NULL,
        subcategory_id INT NOT NULL,
        author VARCHAR(100) NOT NULL,
        date VARCHAR(50) NOT NULL,
        read_time VARCHAR(50) NOT NULL,
        is_sponsored BOOLEAN DEFAULT FALSE,
        media_type VARCHAR(50) DEFAULT NULL,
        duration VARCHAR(50) DEFAULT NULL,
        last_clicked_at DATETIME DEFAULT NULL,
        views_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (subcategory_id) REFERENCES subcategories(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Table 'articles' created.\n";

    // 4. Re-verify admins table
    $pdo->exec("CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    
    // Ensure default admin exists
    $stmtCountAdmins = $pdo->query("SELECT COUNT(*) FROM admins WHERE username = 'admin'");
    if ($stmtCountAdmins->fetchColumn() == 0) {
        $hash = password_hash('AdminPassword123!', PASSWORD_DEFAULT);
        $pdo->prepare("INSERT INTO admins (username, password_hash) VALUES ('admin', ?)")->execute([$hash]);
        echo "Default admin user 'admin' created.\n";
    }

    // 5. Seed Category, Subcategory, and Articles
    $jsonPath = __DIR__ . '/seed_data.json';
    if (file_exists($jsonPath)) {
        $jsonData = json_decode(file_get_contents($jsonPath), true);
        if ($jsonData) {
            $catStmt = $pdo->prepare("INSERT INTO categories (name, slug) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)");
            $subStmt = $pdo->prepare("INSERT INTO subcategories (category_id, name, slug) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)");
            
            $artStmt = $pdo->prepare("INSERT INTO articles 
                (article_id, title, excerpt, content, image, category_id, subcategory_id, author, date, read_time, is_sponsored, media_type, duration)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

            $articlesCount = 0;
            $catsCount = 0;
            $subsCount = 0;

            foreach ($jsonData as $categoryKey => $articlesList) {
                // Get the standard category name from the first item if available, else format key
                $categoryName = !empty($articlesList[0]['category']) ? $articlesList[0]['category'] : ucwords(str_replace('Content', ' Content', $categoryKey));
                
                // Insert category
                $catStmt->execute([$categoryName, slugify($categoryName)]);
                $categoryId = $pdo->lastInsertId();
                if ($categoryId) $catsCount++;

                foreach ($articlesList as $art) {
                    $tagName = $art['tag'] ?? 'General';
                    
                    // Insert subcategory
                    try {
                        $subStmt->execute([$categoryId, $tagName, slugify($tagName)]);
                        $subcategoryId = $pdo->lastInsertId();
                        $subsCount++;
                    } catch (\PDOException $e) {
                        // In case of duplicate, retrieve the subcategory id
                        $getIdStmt = $pdo->prepare("SELECT id FROM subcategories WHERE category_id = ? AND name = ?");
                        $getIdStmt->execute([$categoryId, $tagName]);
                        $subcategoryId = $getIdStmt->fetchColumn();
                    }

                    // Insert article
                    $articleId = $art['id'] ?? uniqid('article-');
                    $title = $art['title'] ?? '';
                    $excerpt = $art['excerpt'] ?? '';
                    $content = $art['content'] ?? '';
                    $image = $art['image'] ?? '';
                    $author = $art['author'] ?? '';
                    $date = $art['date'] ?? '';
                    $readTime = $art['readTime'] ?? '';
                    $isSponsored = isset($art['isSponsored']) && $art['isSponsored'] ? 1 : 0;
                    $mediaType = $art['mediaType'] ?? null;
                    $duration = $art['duration'] ?? null;

                    $artStmt->execute([
                        $articleId,
                        $title,
                        $excerpt,
                        $content,
                        $image,
                        $categoryId,
                        $subcategoryId,
                        $author,
                        $date,
                        $readTime ?: '3 min read',
                        $isSponsored,
                        $mediaType,
                        $duration
                    ]);
                    $articlesCount++;
                }
            }
            echo "Seeded database: $catsCount categories, $subsCount subcategories, and $articlesCount articles.\n";
        } else {
            echo "Error: Failed to decode 'seed_data.json'.\n";
        }
    } else {
        echo "Error: 'seed_data.json' not found.\n";
    }

    echo "Migration completed successfully.\n";

} catch (\PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>
