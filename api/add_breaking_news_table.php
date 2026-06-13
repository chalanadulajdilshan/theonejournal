<?php
require_once __DIR__ . '/db.php';

echo "Adding breaking_news table to schema...\n";

try {
    // 1. Create table
    $pdo->exec("CREATE TABLE IF NOT EXISTS breaking_news (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Table 'breaking_news' created successfully.\n";

    // 2. Seed default items if empty
    $count = $pdo->query("SELECT COUNT(*) FROM breaking_news")->fetchColumn();
    if ($count == 0) {
        $stmt = $pdo->prepare("INSERT INTO breaking_news (title) VALUES (?)");
        $defaults = [
            "Dubai Future District Announces New $100M Fintech Acceleration Program",
            "WEATHER ALERT: High Temperatures Expected Across the UAE This Weekend",
            "TRAVEL UPDATE: GCC Residents Can Now Apply for Unified Visa Online",
            "MARKETS: Gold Prices Stabilize Near All-Time Highs in Local Souks"
        ];
        foreach ($defaults as $title) {
            $stmt->execute([$title]);
        }
        echo "Seeded 4 default breaking news items.\n";
    } else {
        echo "Table already has items. Seeding skipped.\n";
    }

    echo "Schema update completed successfully.\n";

} catch (\PDOException $e) {
    echo "Error updating schema: " . $e->getMessage() . "\n";
    exit(1);
}
?>
