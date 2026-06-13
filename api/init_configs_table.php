<?php
require_once 'db.php';

try {
    // Create site_configs table
    $sql = "
    CREATE TABLE IF NOT EXISTS site_configs (
        config_key VARCHAR(100) PRIMARY KEY,
        config_value LONGTEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $pdo->exec($sql);
    echo "Table site_configs created successfully or already exists.<br>";

    // Default rates JSON
    $defaultRates = [
        [ "label" => "Dubai", "val" => "38°C", "extra" => "Sunny", "type" => "weather" ],
        [ "label" => "Gold 24K", "val" => "AED 284.25", "change" => "+0.45%", "trend" => "up" ],
        [ "label" => "Gold 22K", "val" => "AED 263.00", "change" => "+0.40%", "trend" => "up" ],
        [ "label" => "USD to AED", "val" => "3.67", "change" => "0.00%", "trend" => "neutral" ],
        [ "label" => "GBP to AED", "val" => "4.68", "change" => "-0.12%", "trend" => "down" ],
        [ "label" => "Next Prayer", "val" => "Dhuhr 12:22", "type" => "prayer" ]
    ];
    $jsonRates = json_encode($defaultRates);

    // Insert or update default rates
    $stmt = $pdo->prepare("
        INSERT INTO site_configs (config_key, config_value) 
        VALUES ('top_header_rates', ?)
        ON DUPLICATE KEY UPDATE config_value = config_value
    ");
    $stmt->execute([$jsonRates]);
    
    echo "Default top_header_rates configuration inserted successfully.<br>";

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
