<?php
$storage_root = realpath(__DIR__ . '/../storage/app/public');
$test_file = $storage_root . '/test_write.txt';

echo "<h1>Storage Permissions Check</h1>";
echo "<b>Current User:</b> " . exec('whoami') . " (" . getmyuid() . ":" . getmygid() . ")<br>";
echo "<b>Storage Root:</b> " . ($storage_root ?: 'NOT FOUND') . "<br>";

if ($storage_root) {
    echo "<b>Is Root Writable?</b> " . (is_writable($storage_root) ? "<span style='color:green'>YES</span>" : "<span style='color:red'>NO</span>") . "<br>";
    
    echo "<b>Testing actual write...</b> ";
    if (@file_put_contents($test_file, 'test')) {
        echo "<span style='color:green'>SUCCESS</span><br>";
        @unlink($test_file);
    } else {
        echo "<span style='color:red'>FAILED</span> (Check permissions)<br>";
    }

    $logs_dir = realpath(__DIR__ . '/../storage/logs');
    echo "<br><b>Logs Directory:</b> " . ($logs_dir ?: 'NOT FOUND') . "<br>";
    if ($logs_dir) {
        echo "<b>Is Logs Dir Writable?</b> " . (is_writable($logs_dir) ? "<span style='color:green'>YES</span>" : "<span style='color:red'>NO</span>") . "<br>";
    }

    echo "<br><b>Directory Contents:</b><pre>";
    $it = new RecursiveDirectoryIterator($storage_root, RecursiveDirectoryIterator::SKIP_DOTS);
    foreach (new RecursiveIteratorIterator($it) as $file) {
        echo $file->getPathname() . "\n";
    }
    echo "</pre>";
}
