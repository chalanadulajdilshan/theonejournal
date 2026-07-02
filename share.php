<?php
// Single entry-point for social shares.
//
// Two modes:
//   share.php?id=<article_id>           → HTML page with Open Graph tags +
//                                          JS redirect to the SPA article.
//   share.php?id=<article_id>&img=1     → On-the-fly resized JPEG (<300 KB)
//                                          so WhatsApp/Facebook can preview it.
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

$id     = isset($_GET['id']) ? trim((string) $_GET['id']) : '';
$imgMode = isset($_GET['img']) && $_GET['img'] !== '' && $_GET['img'] !== '0';

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host   = $_SERVER['HTTP_HOST'] ?? 'theonejournal.org';
$origin = $scheme . '://' . $host;

/* -------------------------------------------------------------------------- */
/* Shared DB helper                                                           */
/* -------------------------------------------------------------------------- */
function share_fetch_article($id, $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS) {
    if ($id === '') return null;
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
        // Compare in UTC so scheduled articles stay hidden here too.
        $pdo->exec("SET time_zone = '+00:00'");
        $stmt = $pdo->prepare(
            "SELECT title, excerpt, content, image, seo_title, meta_description
             FROM articles
             WHERE article_id = ?
               AND (published_at IS NULL OR published_at <= NOW())
             LIMIT 1"
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    } catch (Exception $e) {
        error_log('share.php DB error: ' . $e->getMessage());
        return null;
    }
}

/* ========================================================================== */
/* IMAGE MODE — resize the article image to a WhatsApp-safe JPEG and stream  */
/* ========================================================================== */
if ($imgMode) {
    $cacheDir = __DIR__ . '/api/uploads/share_cache';
    if (!is_dir($cacheDir)) @mkdir($cacheDir, 0775, true);
    $cacheKey  = preg_replace('/[^A-Za-z0-9_-]/', '_', $id);
    $cacheFile = $cacheDir . '/' . ($cacheKey !== '' ? $cacheKey : 'default') . '.jpg';

    // Serve cached copy if fresh (< 7 days).
    if (is_file($cacheFile) && (time() - filemtime($cacheFile)) < 604800) {
        header('Content-Type: image/jpeg');
        header('Cache-Control: public, max-age=604800');
        header('Content-Length: ' . filesize($cacheFile));
        readfile($cacheFile);
        exit;
    }

    $srcPath = __DIR__ . '/logo.webp';   // brand-logo fallback
    $row = share_fetch_article($id, $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS);
    if ($row && !empty($row['image'])) {
        $rawImage = trim($row['image']);
        if (preg_match('#^https?://#i', $rawImage)) {
            $srcPath = $rawImage;
        } else {
            $rel = (substr($rawImage, 0, 1) === '/') ? $rawImage : '/' . $rawImage;
            $srcPath = __DIR__ . str_replace('/', DIRECTORY_SEPARATOR, $rel);
        }
    }

    if (!function_exists('imagecreatefromstring')) {
        // GD unavailable — best-effort redirect to original asset.
        if (preg_match('#^https?://#i', $srcPath)) {
            header('Location: ' . $srcPath, true, 302);
        } else {
            $rel = str_replace(__DIR__, '', $srcPath);
            $rel = str_replace(DIRECTORY_SEPARATOR, '/', $rel);
            header('Location: ' . $origin . $rel, true, 302);
        }
        exit;
    }

    $bytes = false;
    if (is_file($srcPath)) {
        $bytes = @file_get_contents($srcPath);
    } elseif (preg_match('#^https?://#i', $srcPath) && ini_get('allow_url_fopen')) {
        $bytes = @file_get_contents($srcPath);
    }
    if ($bytes === false) { http_response_code(404); exit; }

    $src = @imagecreatefromstring($bytes);
    if (!$src) { http_response_code(500); exit; }

    $srcW = imagesx($src);
    $srcH = imagesy($src);

    // Target: max 1200 px on the long edge → well within WhatsApp/Facebook recs.
    $maxEdge = 1200;
    if ($srcW >= $srcH) {
        $dstW = min($srcW, $maxEdge);
        $dstH = (int) round($srcH * ($dstW / $srcW));
    } else {
        $dstH = min($srcH, $maxEdge);
        $dstW = (int) round($srcW * ($dstH / $srcH));
    }

    $dst = imagecreatetruecolor($dstW, $dstH);
    $white = imagecolorallocate($dst, 255, 255, 255);
    imagefilledrectangle($dst, 0, 0, $dstW, $dstH, $white);
    imagecopyresampled($dst, $src, 0, 0, 0, 0, $dstW, $dstH, $srcW, $srcH);
    imagedestroy($src);

    imagejpeg($dst, $cacheFile, 82);
    imagedestroy($dst);

    header('Content-Type: image/jpeg');
    header('Cache-Control: public, max-age=604800');
    header('Content-Length: ' . filesize($cacheFile));
    readfile($cacheFile);
    exit;
}

/* ========================================================================== */
/* HTML MODE — emit Open Graph tags + JS redirect                            */
/* ========================================================================== */

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
// Public-facing share URL is the pretty /s/<id> form (rewritten to share.php
// by .htaccess). Crawlers see this in og:url + canonical, so links shared on
// WhatsApp/FB stay short and clean instead of leaking ?share.php?id=...
$selfUrl     = $id !== '' ? $origin . '/s/' . rawurlencode($id) : $origin . '/';
$canonical   = $selfUrl;

$row = share_fetch_article($id, $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS);
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

    if (!empty($row['image'])) {
        // Serve through share.php?img=1 so crawlers (WhatsApp in particular)
        // get a small JPEG instead of the multi-MB raw upload that WhatsApp
        // would silently drop.
        $image = $origin . '/share.php?img=1&id=' . rawurlencode($id);
    }
}

function og_esc($s) {
    return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

// Probe the image so we emit truthful og:image:width / height / type.
$imgW = $imgH = 0;
$imgMime = '';
$imgProbe = null;
if (!empty($row['image'])) {
    // Probe the cached resized JPEG if it exists already (avoids HTTP fetch).
    $cacheKey  = preg_replace('/[^A-Za-z0-9_-]/', '_', $id);
    $cacheFile = __DIR__ . '/api/uploads/share_cache/' . $cacheKey . '.jpg';
    if (is_file($cacheFile)) {
        $imgProbe = $cacheFile;
    } else {
        // Probe the original on disk if same-origin.
        $rawImage = trim($row['image']);
        if (!preg_match('#^https?://#i', $rawImage)) {
            $rel = (substr($rawImage, 0, 1) === '/') ? $rawImage : '/' . $rawImage;
            $candidate = __DIR__ . str_replace('/', DIRECTORY_SEPARATOR, $rel);
            if (is_file($candidate)) $imgProbe = $candidate;
        }
    }
} elseif ($image !== '') {
    // Brand-logo fallback path.
    $rel = substr($image, strlen($origin));
    $candidate = __DIR__ . str_replace('/', DIRECTORY_SEPARATOR, $rel);
    if (is_file($candidate)) $imgProbe = $candidate;
}
if ($imgProbe !== null) {
    $info = @getimagesize($imgProbe);
    if (is_array($info)) {
        $imgW = (int) $info[0];
        $imgH = (int) $info[1];
        if (!empty($info['mime'])) $imgMime = $info['mime'];
    }
}
// share.php?img=1 always outputs JPEG.
if (!empty($row['image'])) $imgMime = 'image/jpeg';
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
<?php if (!empty($imgW) && !empty($imgH)): ?>
  <meta property="og:image:width" content="<?php echo (int) $imgW; ?>" />
  <meta property="og:image:height" content="<?php echo (int) $imgH; ?>" />
<?php endif; ?>
<?php if (!empty($imgMime)): ?>
  <meta property="og:image:type" content="<?php echo og_esc($imgMime); ?>" />
<?php endif; ?>
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
