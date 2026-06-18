<?php
header("Content-Type: application/json");
require_once __DIR__ . '/db.php';

// Category ID 3 = "You May Like" (only shows in International/youMayLike section)
// Subcategory IDs from "You May Like": 12=Trending, 14=Luxury, 15=Travel
$categoryId = 3;

$articles = [
    [
        'title'      => 'GCC Leaders Convene in Riyadh to Finalize Unified Digital Currency Framework',
        'excerpt'    => 'Finance ministers from all six Gulf states gathered in Riyadh this week to sign off on the final architecture of a regional digital currency that could reshape cross-border trade across the bloc.',
        'content'    => "Finance ministers and central bank governors from Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, and Oman convened for a landmark summit in Riyadh this week, marking the final milestone in a three-year effort to establish a unified Gulf digital currency.\n\nThe proposed currency, provisionally named the \"Khaleeji Digital Dinar\" (KDD), is designed to facilitate instantaneous, low-cost cross-border payments between member states — eliminating the need for correspondent banking and reducing settlement times from days to seconds.\n\nThe initiative, backed by the Bank for International Settlements (BIS), leverages distributed ledger technology and builds on infrastructure developed jointly by Saudi Arabia and the UAE in Project Aber, which successfully piloted a dual-nation CBDC as early as 2020.\n\nOfficials confirmed that the KDD will be fully collateralised, pegged at a fixed conversion rate to each member state's existing currency, and governed by a new independent body — the Gulf Digital Currency Authority (GDCA) — headquartered in Abu Dhabi.\n\nAnalysts say the move positions the GCC as one of the most advanced regional blocs in the world in terms of monetary digitalisation, surpassing the European Union's digital euro timeline. A pilot rollout for interbank transactions is expected by mid-2027, with retail access to follow in 2028.",
        'image'      => 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop',
        'subcategoryId' => 12,
        'author'     => 'Riyadh Bureau',
        'date'       => 'June 11, 2026',
        'readTime'   => '5 min read',
        'views'      => 320,
    ],
    [
        'title'      => 'UN Climate Summit Reaches Historic Accord on Carbon Border Tax for Emerging Markets',
        'excerpt'    => 'After marathon overnight negotiations, 142 countries agreed to a phased carbon border adjustment mechanism that will reshape global trade flows and accelerate the energy transition in developing nations.',
        'content'    => "In what negotiators are calling the most consequential climate finance agreement since the Paris Accord, representatives from 142 nations signed a historic carbon border adjustment framework early Thursday morning at the United Nations Environment Assembly in Nairobi.\n\nThe deal establishes a tiered Carbon Border Adjustment Mechanism (CBAM) that will impose levies on goods entering signatory markets based on the carbon intensity of their production. Unlike the European Union's existing CBAM — which critics argued unfairly penalised developing nations — the new global framework includes a ring-fenced Climate Transition Fund, funded by CBAM revenues, specifically to support low-income economies in decarbonising their manufacturing sectors.\n\nOver USD 180 billion has been pledged to the fund over the next decade, with contributions from the G7, China, and Gulf sovereign wealth funds. Saudi Arabia's Public Investment Fund (PIF) committed USD 15 billion alone, a signal of the Gulf state's pivot toward climate leadership as part of its Vision 2030 strategy.\n\nThe mechanism will be phased in over six years, starting with steel, cement, aluminium, fertilisers, and chemicals from 2027, with expansion to a broader range of manufactured goods by 2031.\n\nEnvironmental groups cautiously welcomed the deal but called for stronger enforcement mechanisms and faster timelines, warning that the window to limit warming to 1.5°C remains critically narrow.",
        'image'      => 'https://images.unsplash.com/photo-1569025743873-ea3a9ade89f9?q=80&w=800&auto=format&fit=crop',
        'subcategoryId' => 12,
        'author'     => 'International Desk',
        'date'       => 'June 13, 2026',
        'readTime'   => '6 min read',
        'views'      => 275,
    ],
    [
        'title'      => 'India and UAE Sign Landmark Trade Agreement Worth $100 Billion Over Five Years',
        'excerpt'    => 'New Delhi and Abu Dhabi have formalised one of the most ambitious bilateral trade pacts in the region\'s history, spanning sectors from technology and renewables to agriculture and defence manufacturing.',
        'content'    => "India and the United Arab Emirates have signed a landmark Comprehensive Economic Partnership Agreement (CEPA) expansion valued at USD 100 billion over five years — deepening what has become one of the most strategically significant bilateral relationships in the Indo-Pacific region.\n\nThe agreement, signed at a state ceremony in Abu Dhabi attended by both Prime Minister Narendra Modi and UAE President Sheikh Mohamed bin Zayed Al Nahyan, covers 19 sectors including digital infrastructure, renewable energy, pharmaceuticals, food security, defence manufacturing, and financial services.\n\nAmong the headline commitments, India will establish a dedicated UAE–India technology corridor in the GIFT City (Gujarat International Finance Tec-City) special economic zone, attracting Emirati sovereign capital to Indian deep-tech startups and semiconductor manufacturing. In return, the UAE will provide preferential access for Indian agricultural exports including wheat, rice, and organic produce.\n\nThe two countries already trade over USD 85 billion annually, making the UAE India's second-largest trading partner. This new framework is designed to push bilateral trade past USD 200 billion by 2030.\n\nA joint infrastructure fund of USD 25 billion has also been established to co-finance port connectivity, logistics corridors, and data centre development across both nations and along the India–Middle East–Europe Economic Corridor (IMEC).\n\nMarkets responded positively: the Bombay Stock Exchange rose 1.4% on the news, while UAE-listed logistics and real estate stocks climbed an average of 2.1%.",
        'image'      => 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=800&auto=format&fit=crop',
        'subcategoryId' => 14,
        'author'     => 'Trade & Economics Desk',
        'date'       => 'June 14, 2026',
        'readTime'   => '7 min read',
        'views'      => 410,
    ],
];

try {
    $inserted = 0;
    $stmt = $pdo->prepare("
        INSERT INTO articles
            (article_id, title, excerpt, content, image, category_id, subcategory_id,
             author, date, read_time, is_sponsored, views_count)
        VALUES
            (:article_id, :title, :excerpt, :content, :image, :category_id, :subcategory_id,
             :author, :date, :read_time, 0, :views_count)
    ");

    foreach ($articles as $art) {
        $stmt->execute([
            ':article_id'     => uniqid('intl-'),
            ':title'          => $art['title'],
            ':excerpt'        => $art['excerpt'],
            ':content'        => $art['content'],
            ':image'          => $art['image'],
            ':category_id'    => $categoryId,
            ':subcategory_id' => $art['subcategoryId'],
            ':author'         => $art['author'],
            ':date'           => $art['date'],
            ':read_time'      => $art['readTime'],
            ':views_count'    => $art['views'],
        ]);
        $inserted++;
    }

    echo json_encode([
        'success'  => true,
        'message'  => "$inserted international articles seeded successfully.",
        'note'     => 'Articles appear in the International section (You May Like) on the homepage. Refresh the site to see them.'
    ]);

} catch (\PDOException $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Seed failed: ' . $e->getMessage()]);
}
?>
