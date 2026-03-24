<?php
echo "<h1>Laravel Logs</h1>";
$log_path = __DIR__ . '/../storage/logs/laravel.log';

if (file_exists($log_path)) {
    echo "<b>Log Path:</b> $log_path<br>";
    echo "<b>Size:</b> " . filesize($log_path) . " bytes<br><br>";
    
    $lines = file($log_path);
    $last_lines = array_slice($lines, -100);
    echo "<pre style='background:#f4f4f4;padding:10px;overflow:auto;height:500px;'>";
    foreach ($last_lines as $line) {
        echo htmlspecialchars($line);
    }
    echo "</pre>";
} else {
    echo "<span style='color:red'>Log file not found at $log_path</span>";
}
