<?php
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;

// Include Laravel bootstrap
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); // Ensure Artisan is ready

echo "<h1>Database Diagnostics</h1>";

try {
    $connection = DB::getDefaultConnection();
    echo "<b>Default Connection:</b> $connection<br>";
    
    $driver = DB::connection()->getDriverName();
    echo "<b>Driver:</b> $driver<br>";

    if ($driver == 'sqlite') {
        $db_path = config('database.connections.sqlite.database');
        echo "<b>DB Path:</b> $db_path<br>";
        echo "<b>DB Writable?</b> " . (is_writable($db_path) ? "YES" : "NO") . "<br>";
        $tables_query = "SELECT name FROM sqlite_master WHERE type='table'";
    } else {
        $tables_query = "SHOW TABLES";
    }

    $tables = DB::select($tables_query);
    echo "<b>Tables found:</b><ul>";
    foreach ($tables as $table) {
        $table_name = array_values((array)$table)[0];
        echo "<li>" . $table_name . "</li>";
    }
    echo "</ul>";

    if (Schema::hasTable('speakers')) {
        echo "<span style='color:green'><b>'speakers' table EXISTS!</b></span><br>";
        $count = DB::table('speakers')->count();
        echo "<b>Speaker count:</b> $count<br>";
    } else {
        echo "<span style='color:red'><b>'speakers' table MISSING!</b></span><br>";
        echo "<a href='?migrate=1' style='background:orange;padding:10px;color:white;text-decoration:none;display:inline-block;margin:10px 0;'>RUN MIGRATIONS (php artisan migrate)</a><br>";
    }
} catch (\Exception $e) {
    echo "<span style='color:red'><b>Error:</b> " . $e->getMessage() . "</span><br>";
    echo "<a href='?migrate=1' style='background:orange;padding:10px;color:white;text-decoration:none;display:inline-block;margin:10px 0;'>TRY RUN MIGRATIONS REGARDLESS</a><br>";
}

if (isset($_GET['migrate'])) {
    echo "<h2>Running Migrations...</h2><pre>";
    try {
        $exitCode = Artisan::call('migrate', ['--force' => true]);
        echo "<b>Exit Code:</b> $exitCode<br>";
        echo Artisan::output();
    } catch (\Exception $e) {
        echo "Migration failed: " . $e->getMessage();
    }
    echo "</pre>";
}
