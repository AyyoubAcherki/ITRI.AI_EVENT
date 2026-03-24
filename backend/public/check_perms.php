<?php
$storage_root = realpath(__DIR__ . '/../storage/app/public');
$test_file = $storage_root . '/test_write.txt';

if (isset($_GET['fix_perms'])) {
    if ($storage_root) {
        @mkdir($storage_root . '/speakers', 0777, true);
        @chmod($storage_root, 0777);
        @chmod($storage_root . '/speakers', 0777);
    }
}

echo "<h1>Storage Permissions & User</h1>";
echo "<b>Current User:</b> " . posix_getpwuid(posix_geteuid())['name'] . "<br>";
echo "<b>Storage Root:</b> " . ($storage_root ?: 'NOT FOUND') . "<br>";

if ($storage_root) {
    $is_writable = is_writable($storage_root);
    echo "<b>Is Root Writable?</b> " . ($is_writable ? "<span style='color:green'>YES</span>" : "<span style='color:red'>NO</span>") . "<br>";
    
    if (!$is_writable) {
        echo "<a href='?fix_perms=1' style='background:blue;color:white;padding:5px;text-decoration:none;'>Try chmod 777 (Guerrilla Fix)</a><br>";
    }

    echo "<b>Testing actual write...</b> ";
    if (@file_put_contents($test_file, 'test')) {
        echo "<span style='color:green'>SUCCESS</span><br>";
        @unlink($test_file);
    } else {
        echo "<span style='color:red'>FAILED</span> (Check permissions)<br>";
    }

    echo "<br><b>Directory Contents:</b><pre>";
    $it = new RecursiveDirectoryIterator($storage_root, RecursiveDirectoryIterator::SKIP_DOTS);
    foreach (new RecursiveIteratorIterator($it) as $file) {
        echo $file->getPathname() . " (" . substr(sprintf('%o', $file->getPerms()), -4) . ")\n";
    }
    echo "</pre>";
}
echo "<br><hr><br>";
// Include original diagnostics
include __DIR__ . '/check_storage_ORIG.php'; // I'll skip this and just append.
?>
<a href="check_storage.php">Back to Main Diagnostic</a>
