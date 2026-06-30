<?php
// One-off maintenance script. Walks /api/uploads/, converts each non-WebP
// image to a resized WebP, and rewrites the matching paths in every table
// that references uploaded images. Re-runnable: WebP files are skipped.
//
// Run from the browser as an admin:  /api/optimize_uploads.php
// Or from CLI:                       php api/optimize_uploads.php

header('Content-Type: text/plain; charset=utf-8');

require_once __DIR__ . '/db.php';

$cli = (php_sapi_name() === 'cli');
if (!$cli) {
    require_once __DIR__ . '/auth_helper.php';
    requireAdmin();
}

if (!extension_loaded('gd') || !function_exists('imagewebp')) {
    http_response_code(500);
    echo "GD with WebP support is required.\n";
    exit;
}

$dir = __DIR__ . '/uploads';
if (!is_dir($dir)) {
    echo "No uploads directory.\n";
    exit;
}

$maxDim = 1600;
$quality = 82;

// Tables/columns that may store an /api/uploads/... path.
$targets = [
    ['table' => 'articles',      'col' => 'image'],
    ['table' => 'jobs',          'col' => 'image'],
    ['table' => 'live_updates',  'col' => 'image'],
    ['table' => 'breaking_news', 'col' => 'image'],
    ['table' => 'countries',     'col' => 'flag'],
];

$converted = 0; $skipped = 0; $failed = 0; $dbUpdates = 0;

foreach (scandir($dir) as $entry) {
    if ($entry === '.' || $entry === '..') continue;
    $path = $dir . '/' . $entry;
    if (!is_file($path)) continue;

    $ext = strtolower(pathinfo($entry, PATHINFO_EXTENSION));
    if ($ext === 'webp') { $skipped++; continue; }
    if (!in_array($ext, ['jpg', 'jpeg', 'png'], true)) { $skipped++; continue; }

    $src = null;
    switch ($ext) {
        case 'jpg':
        case 'jpeg': $src = @imagecreatefromjpeg($path); break;
        case 'png':  $src = @imagecreatefrompng($path); break;
    }
    if (!$src) {
        echo "FAIL  read   $entry\n";
        $failed++;
        continue;
    }

    $w = imagesx($src); $h = imagesy($src);
    $scale = min(1, $maxDim / max($w, $h));
    $nw = max(1, (int) round($w * $scale));
    $nh = max(1, (int) round($h * $scale));

    if ($nw !== $w || $nh !== $h) {
        $resized = imagecreatetruecolor($nw, $nh);
        imagealphablending($resized, false);
        imagesavealpha($resized, true);
        $transparent = imagecolorallocatealpha($resized, 0, 0, 0, 127);
        imagefilledrectangle($resized, 0, 0, $nw, $nh, $transparent);
        imagecopyresampled($resized, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);
        imagedestroy($src);
        $src = $resized;
    }

    $newName = pathinfo($entry, PATHINFO_FILENAME) . '.webp';
    $newPath = $dir . '/' . $newName;
    if (!imagewebp($src, $newPath, $quality)) {
        imagedestroy($src);
        echo "FAIL  webp   $entry\n";
        $failed++;
        continue;
    }
    imagedestroy($src);

    $oldUrl = '/api/uploads/' . $entry;
    $newUrl = '/api/uploads/' . $newName;

    foreach ($targets as $t) {
        try {
            $stmt = $pdo->prepare("UPDATE {$t['table']} SET {$t['col']} = ? WHERE {$t['col']} = ?");
            $stmt->execute([$newUrl, $oldUrl]);
            $dbUpdates += $stmt->rowCount();
        } catch (PDOException $e) {
            // Table or column missing — ignore, the rest of the run still works.
        }
    }

    @unlink($path);
    $oldKB = filesize($newPath) > 0 ? round(filesize($newPath) / 1024) : 0;
    echo "OK    $entry -> $newName ({$nw}x{$nh}, {$oldKB}KB)\n";
    $converted++;
}

echo "\nConverted: $converted   Skipped: $skipped   Failed: $failed   DB rows updated: $dbUpdates\n";
?>
