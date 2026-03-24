<?php
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;

// Include Laravel bootstrap
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

echo "<h1>Database Diagnostics</h1>";

$db_path = config('database.connections.sqlite.database');
echo "<b>DB Path:</b> $db_path<br>";
echo "<b>DB Writable?</b> " . (is_writable($db_path) ? "YES" : "NO") . "<br>";
echo "<b>DB Folder Writable?</b> " . (is_writable(dirname($db_path)) ? "YES" : "NO") . "<br>";

try {
    $tables = DB::select("SELECT name FROM sqlite_master WHERE type='table'");
    echo "<b>Tables found:</b><ul>";
    foreach ($tables as $table) {
        echo "<li>" . $table->name . "</li>";
    }
    echo "</ul>";

    if (Schema::hasTable('speakers')) {
        echo "<span style='color:green'><b>'speakers' table EXISTS!</b></span><br>";
        $count = DB::table('speakers')->count();
        echo "<b>Speaker count:</b> $count<br>";
    } else {
        echo "<span style='color:red'><b>'speakers' table MISSING!</b></span><br>";
        echo "<a href='?migrate=1' style='background:orange;padding:5px;'>Run Migrations</a>";
    }
} catch (\Exception $e) {
    echo "<span style='color:red'><b>Error:</b> " . $e->getMessage() . "</span><br>";
}

if (isset($_GET['migrate'])) {
    echo "<h2>Running Migrations...</h2><pre>";
    try {
        Artisan::call('migrate', ['--force' => true]);
        echo Artisan::output();
    } catch (\Exception $e) {
        echo "Migration failed: " . $e->getMessage();
    }
    echo "</pre>";
}
