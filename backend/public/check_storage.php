<?php
$photo = $_GET['photo'] ?? 'speakers/LZWVx3gMv3aFPy39MghHqr7zI0aCGJ0sE5H38aVX.jpg';
$path = realpath(__DIR__ . '/../storage/app/public/' . $photo);
$link = realpath(__DIR__ . '/storage');

echo "<h1>Storage Diagnostics</h1>";
echo "<b>Current Directory:</b> " . __DIR__ . "<br>";
echo "<b>Searching for Photo:</b> $photo<br>";
echo "<b>Absolute Path:</b> " . ($path ?: 'NOT FOUND') . "<br>";

if ($path && file_exists($path)) {
    echo "<span style='color:green'><b>FILE EXISTS!</b></span><br>";
    echo "<b>Permissions:</b> " . substr(sprintf('%o', fileperms($path)), -4) . "<br>";
} else {
    echo "<span style='color:red'><b>FILE NOT FOUND ON DISK!</b></span><br>";
}

echo "<br><b>Public Storage Link:</b> " . ($link ?: 'NOT FOUND/BROKEN') . "<br>";
if (is_link(__DIR__ . '/storage')) {
    echo "<b>Type:</b> Symbolic Link<br>";
    echo "<b>Target:</b> " . readlink(__DIR__ . '/storage') . "<br>";
} elseif (is_dir(__DIR__ . '/storage')) {
    echo "<b>Type:</b> ⚠️ REAL DIRECTORY (Blocking link)<br>";
}
