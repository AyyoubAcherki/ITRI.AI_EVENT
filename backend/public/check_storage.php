<?php
$photo = $_GET['photo'] ?? 'speakers/rIQvMybqSX1HlwoG5PERRKCbtrfSAtbzT0lYIjrv.jpg';
$storage_root = realpath(__DIR__ . '/../storage/app/public');
$path = $storage_root ? realpath($storage_root . '/' . ltrim($photo, '/')) : false;
$link = __DIR__ . '/media';

echo "<h1>Media Storage Diagnostics</h1>";
echo "<b>Current Directory:</b> " . __DIR__ . "<br>";
echo "<b>Storage Root:</b> " . ($storage_root ?: 'NOT FOUND') . "<br>";

if ($storage_root) {
    echo "<b>Contents of Storage Root:</b><pre>";
    $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($storage_root));
    foreach ($files as $name => $file) {
        if (!$file->isDir()) echo "$name\n";
    }
    echo "</pre>";
}

echo "<b>Searching for Photo (via /media/):</b> $photo<br>";
echo "<b>Absolute Path:</b> " . ($path ?: 'NOT FOUND') . "<br>";

if ($path && file_exists($path)) {
    echo "<span style='color:green'><b>FILE EXISTS!</b></span><br>";
} else {
    echo "<span style='color:red'><b>FILE NOT FOUND ON DISK!</b></span><br>";
}

echo "<br><b>Public MEDIA Link:</b> $link<br>";
if (is_link($link)) {
    echo "<b>Type:</b> Symbolic Link ✅<br>";
    echo "<b>Target:</b> " . readlink($link) . "<br>";
} elseif (is_dir($link)) {
    echo "<b>Type:</b> ⚠️ REAL DIRECTORY<br>";
} else {
    echo "<b>Status:</b> MISSING (Will be created by AppServiceProvider at next visit)<br>";
}
