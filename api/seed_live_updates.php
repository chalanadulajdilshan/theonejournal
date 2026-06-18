<?php
header("Content-Type: application/json");
require_once __DIR__ . '/db.php';

try {
    // Step 1: Create table with all columns if it doesn't exist
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS live_updates (
            id           INT AUTO_INCREMENT PRIMARY KEY,
            title        VARCHAR(500)  NOT NULL,
            summary      TEXT,
            content      LONGTEXT,
            image        VARCHAR(1000) DEFAULT NULL,
            author       VARCHAR(200)  DEFAULT 'Editorial Team',
            category     VARCHAR(100)  DEFAULT 'General',
            is_published TINYINT(1)    DEFAULT 1,
            created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
            updated_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // Add columns if they were missing from an older version of the table
    foreach (['image VARCHAR(1000) DEFAULT NULL', 'author VARCHAR(200) DEFAULT \'Editorial Team\''] as $col) {
        try { $pdo->exec("ALTER TABLE live_updates ADD COLUMN $col"); } catch (\PDOException $e) {}
    }

    // Step 2: Clear any existing rows and re-seed fresh
    $pdo->exec("TRUNCATE TABLE live_updates");

    // Step 3: Insert 4 demos with staggered timestamps
    $demos = [
        [
            'title'      => 'MARKETS: Gold Prices Stabilize Near All-Time Highs in Local Souks',
            'summary'    => 'Gold traded at AED 305 per gram in Dubai souks today, holding close to record levels as global demand continues to surge amid economic uncertainty.',
            'content'    => "Gold prices remained steady near historic highs today, with spot gold trading at approximately AED 305 per gram across major Dubai souks. Traders cited persistent demand from both retail buyers and institutional investors as the primary driver.\n\nThe rally has been fuelled by a combination of factors including a weaker US dollar, ongoing geopolitical tensions in Eastern Europe and the Middle East, and central bank buying from emerging market economies. The World Gold Council noted that central bank purchases hit a multi-decade high last quarter.\n\nLocal jewellery retailers are reporting strong footfall despite the high prices, with bridal season demand providing additional support. Industry analysts expect prices to remain elevated through the next quarter, with some forecasting a move above AED 320 per gram if the dollar weakens further.\n\nInvestors seeking safe-haven assets have also driven increased interest in gold-backed ETFs, with global holdings rising for the fourth consecutive week.",
            'image'      => 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop',
            'author'     => 'Editorial Team',
            'category'   => 'Breaking',
            'is_published' => 1,
            'offset_min' => 0,
        ],
        [
            'title'      => 'TRAVEL UPDATE: GCC Residents Can Now Apply for Unified Visa Online',
            'summary'    => 'A new unified GCC tourist visa portal has launched, allowing residents across all six Gulf states to apply for a single regional travel visa within minutes.',
            'content'    => "A landmark unified visa system for the Gulf Cooperation Council went live today, enabling residents of Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, and Oman to apply for a single multi-entry travel visa through a centralised online portal.\n\nThe initiative aims to boost intra-regional tourism and simplify travel for the estimated 35 million expatriates living across the GCC. Applicants can expect a processing time of 24 to 72 hours, with visa fees starting at USD 50 for a 30-day single entry.\n\nOfficials described the launch as a historic step toward deeper regional integration. Airlines operating across the region have already begun updating their booking platforms, and several hotels in major Gulf cities have reported a spike in forward bookings since the announcement.",
            'image'      => 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop',
            'author'     => 'Travel Desk',
            'category'   => 'International',
            'is_published' => 1,
            'offset_min' => 15,
        ],
        [
            'title'      => 'WEATHER ALERT: High Temperatures Expected Across the UAE This Weekend',
            'summary'    => 'The UAE National Centre of Meteorology has issued a heat advisory warning of temperatures reaching up to 48°C in inland areas this weekend.',
            'content'    => "The UAE National Centre of Meteorology (NCM) has issued a weather advisory warning residents and visitors of dangerously high temperatures forecast across the country this weekend, with inland areas expected to reach up to 48 degrees Celsius.\n\nThe advisory urges the public to avoid outdoor activities between 10am and 4pm, stay hydrated, and never leave children or pets unattended in vehicles. Construction workers and outdoor labourers are advised to take frequent breaks in shaded areas.\n\nCoastal cities including Dubai, Abu Dhabi, and Sharjah are expected to see temperatures between 40°C and 44°C, compounded by high humidity that may push the heat index above 55°C in some areas. The Civil Defence Authority has activated its summer safety protocol.",
            'image'      => 'https://images.unsplash.com/photo-1561484930-998b6a7b22e8?q=80&w=800&auto=format&fit=crop',
            'author'     => 'Editorial Team',
            'category'   => 'General',
            'is_published' => 1,
            'offset_min' => 60,
        ],
        [
            'title'      => 'Dubai Future District Announces New $100M Fintech Acceleration Program',
            'summary'    => 'The Dubai Future District Fund has unveiled a $100 million fintech acceleration programme targeting early-stage startups in payments, blockchain, and AI-driven financial services.',
            'content'    => "The Dubai Future District Fund (DFDF) today announced the launch of a $100 million acceleration programme designed to fast-track growth for fintech startups across the MENA region.\n\nThe programme offers selected startups access to capital, regulatory sandboxing through the Dubai Financial Services Authority, co-working space, and direct introductions to regional banks and sovereign wealth funds.\n\nApplications are open to startups at seed to Series A stage in open banking, embedded finance, digital payments, DeFi, and AI-powered wealth management. The first cohort begins Q3 2026, with up to 20 startups selected. The deadline to apply is 31 July 2026.",
            'image'      => 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?q=80&w=800&auto=format&fit=crop',
            'author'     => 'Tech & Business Desk',
            'category'   => 'Technology',
            'is_published' => 1,
            'offset_min' => 180,
        ],
    ];

    $stmt = $pdo->prepare(
        "INSERT INTO live_updates (title, summary, content, image, author, category, is_published, created_at)
         VALUES (:title, :summary, :content, :image, :author, :category, :is_published,
                 DATE_SUB(NOW(), INTERVAL :offset_min MINUTE))"
    );

    foreach ($demos as $demo) {
        $stmt->execute($demo);
    }

    echo json_encode([
        'success' => true,
        'message' => '4 demo live updates seeded successfully.',
        'next'    => 'Refresh the homepage to see them in the Live Updates widget.'
    ]);

} catch (\PDOException $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Seed failed: ' . $e->getMessage()]);
}
?>
