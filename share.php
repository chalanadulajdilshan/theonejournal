<?php
// Server-rendered share endpoint so social-media crawlers (Facebook, WhatsApp,
// Twitter/X, LinkedIn, Telegram, etc.) can see Open Graph tags including the
// article's image. Real users are redirected to the SPA route.
//
// This file is intentionally self-contained: it does NOT include api/db.php
// because that helper hard-exits on a failed DB connect, which would turn any
// connection problem into an HTTP 500 for shares.

// ---- Production DB credentials ----------------------------------------------
// EDIT these to match your live hosting (cPanel → MySQL Databases).
$DB_HOST = '127.0.0.1';
$DB_NAME = 'news';
$DB_USER = 'root';
$DB_PASS = '';
// -----------------------------------------------------------------------------

$id = isset($_GET['id']) ? trim((string) $_GET['id']) : '';

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host   = $_SERVER['HTTP_HOST'] ?? 'theonejournal.org';
$origin = $scheme . '://' . $host;

$siteName    = 'The One Journal';
$title       = $siteName;
$description = 'Gulf, World, Business, Tech & Lifestyle News';
$image       = $origin . '/logo.webp';
// The article URL real humans should land on (hash-routed SPA).
$articleUrl  = $id !== '' ? $origin . '/#article-' . rawurlencode($id) : $origin . '/';
// The URL crawlers should treat as canonical for this share — it must be
// share.php itself, NOT the hash URL, otherwise Facebook follows the canonical
// to the bare site root (which drops the #fragment) and reads the generic
// index.html with no og:image.
$selfUrl     = $origin . '/share.php' . ($id !== '' ? '?id=' . rawurlencode($id) : '');
$canonical   = $selfUrl;

if ($id !== '') {
    try {
        $pdo = new PDO(
            "mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4",
            $DB_USER,
            $DB_PASS,
            [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]
        );

        $stmt = $pdo->prepare(
            "SELECT title, excerpt, content, image, seo_title, meta_description
             FROM articles WHERE article_id = ? LIMIT 1"
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch();

        if ($row) {
            $rawTitle = isset($row['seo_title']) && trim($row['seo_title']) !== ''
                ? $row['seo_title']
                : (isset($row['title']) ? $row['title'] : $siteName);
            $title = $rawTitle;

            $rawDesc = isset($row['meta_description']) ? trim($row['meta_description']) : '';
            if ($rawDesc === '') {
                $excerpt = isset($row['excerpt']) ? trim(strip_tags($row['excerpt'])) : '';
                $content = isset($row['content']) ? trim(strip_tags($row['content'])) : '';
                $rawDesc = $excerpt !== '' ? $excerpt : $content;
            }
            $rawDesc = preg_replace('/\s+/', ' ', $rawDesc);
            if (function_exists('mb_strlen') && mb_strlen($rawDesc) > 200) {
                $rawDesc = mb_substr($rawDesc, 0, 199) . '...';
            } elseif (strlen($rawDesc) > 200) {
                $rawDesc = substr($rawDesc, 0, 199) . '...';
            }
            if ($rawDesc !== '') $description = $rawDesc;

            $rawImage = isset($row['image']) ? trim($row['image']) : '';
            if ($rawImage !== '') {
                if (preg_match('#^https?://#i', $rawImage)) {
                    $image = $rawImage;
                } else {
                    $prefix = (substr($rawImage, 0, 1) === '/') ? '' : '/';
                    $image  = $origin . $prefix . $rawImage;
                }
            }
        }
    } catch (Exception $e) {
        // Swallow — fall through with site-default OG tags rather than 500.
        error_log('share.php DB error: ' . $e->getMessage());
    }
}

function og_esc($s) {
    return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
?><!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title><?php echo og_esc($title); ?> | <?php echo og_esc($siteName); ?></title>
  <meta name="description" content="<?php echo og_esc($description); ?>" />
  <link rel="canonical" href="<?php echo og_esc($canonical); ?>" />

  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="<?php echo og_esc($siteName); ?>" />
  <meta property="og:title" content="<?php echo og_esc($title); ?>" />
  <meta property="og:description" content="<?php echo og_esc($description); ?>" />
  <meta property="og:url" content="<?php echo og_esc($selfUrl); ?>" />
  <meta property="og:image" content="<?php echo og_esc($image); ?>" />
  <meta property="og:image:secure_url" content="<?php echo og_esc($image); ?>" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="<?php echo og_esc($title); ?>" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="<?php echo og_esc($title); ?>" />
  <meta name="twitter:description" content="<?php echo og_esc($description); ?>" />
  <meta name="twitter:image" content="<?php echo og_esc($image); ?>" />
  <meta name="twitter:image:alt" content="<?php echo og_esc($title); ?>" />
  <meta name="twitter:domain" content="<?php echo og_esc($host); ?>" />
  <meta name="twitter:url" content="<?php echo og_esc($selfUrl); ?>" />

  <!-- JS-only redirect so social-media crawlers (no JS) read the meta tags
       above and don't follow a meta-refresh to the hash URL. -->
  <script>window.location.replace(<?php echo json_encode($articleUrl); ?>);</script>
</head>
<body>
  <p>Redirecting to <a href="<?php echo og_esc($articleUrl); ?>"><?php echo og_esc($title); ?></a>...</p>
</body>
</html>
