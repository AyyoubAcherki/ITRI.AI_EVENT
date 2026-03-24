<?php
// Function to delete a directory recursively
function deleteDir($dirPath) {
    if (!is_dir($dirPath)) return false;
    if (substr($dirPath, strlen($dirPath) - 1, 1) != '/') $dirPath .= '/';
    $files = glob($dirPath . '*', GLOB_MARK);
    foreach ($files as $file) {
        if (is_dir($file)) {
            deleteDir($file);
        } else {
            unlink($file);
        }
    }
    return rmdir($dirPath);
}

if (isset($_GET['fix']) && $_GET['fix'] == 'yes') {
    $link = __DIR__ . '/storage';
    if (is_dir($link) && !is_link($link)) {
        deleteDir($link);
        echo "<p style='color:orange'>Deleted blocking directory: $link</p>";
    }
    if (!file_exists($link)) {
        $target = realpath(__DIR__ . '/../storage/app/public');
        if ($target) {
            @symlink($target, $link);
            echo "<p style='color:green'>Created symlink: $link -> $target</p>";
        } else {
            echo "<p style='color:red'>Target directory not found: " . __DIR__ . '/../storage/app/public' . "</p>";
        }
    }
}

$photo = $_GET['photo'] ?? 'speakers/LZWVx3gMv3aFPy39MghHqr7zI0aCGJ0sE5H38aVX.jpg';
$storage_root = realpath(__DIR__ . '/../storage/app/public');
$path = $storage_root ? realpath($storage_root . '/' . ltrim($photo, '/')) : false;
$link = __DIR__ . '/storage';

echo "<h1>Storage Diagnostics & Fixer</h1>";
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

echo "<b>Searching for Photo:</b> $photo<br>";
echo "<b>Absolute Path:</b> " . ($path ?: 'NOT FOUND') . "<br>";

if ($path && file_exists($path)) {
    echo "<span style='color:green'><b>FILE EXISTS!</b></span><br>";
} else {
    echo "<span style='color:red'><b>FILE NOT FOUND ON DISK!</b></span><br>";
}

echo "<br><b>Public Storage Link:</b> $link<br>";
if (is_link($link)) {
    echo "<b>Type:</b> Symbolic Link ✅<br>";
    echo "<b>Target:</b> " . readlink($link) . "<br>";
} elseif (is_dir($link)) {
    echo "<b>Type:</b> ⚠️ REAL DIRECTORY (Blocking link)<br>";
    echo "<a href='?fix=yes' style='background:red;color:white;padding:10px;text-decoration:none;display:inline-block;margin-top:10px;'>FORCE FIX (Delete folder & create link)</a>";
} else {
    echo "<b>Status:</b> MISSING<br>";
    echo "<a href='?fix=yes' style='background:green;color:white;padding:10px;text-decoration:none;display:inline-block;margin-top:10px;'>CREATE LINK</a>";
}
