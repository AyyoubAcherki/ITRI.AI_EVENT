<?php
use App\Models\Admin; 
use Illuminate\Support\Facades\Hash;

// Include Laravel bootstrap
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "<h1>Admin Creation Tool</h1>";

try {
    // Note: I'm using the 'Admin' model if it exists, otherwise 'User'
    // I noticed in check_db.php output there is an 'admins' table.
    
    $email = 'admin@itri.ma'; // Default email
    $password = 'admin123';   // Default password
    
    // Check if table exists
    if (!\Illuminate\Support\Facades\Schema::hasTable('admins')) {
        echo "<span style='color:red'>Table 'admins' not found. Creating in 'users' instead?</span><br>";
        $model = \App\Models\User::class;
    } else {
        $model = \App\Models\Admin::class;
    }

    $admin = $model::updateOrCreate(
        ['email' => $email],
        [
            'name' => 'Administrator',
            'password' => Hash::make($password),
        ]
    );

    echo "<span style='color:green'><b>SUCCESS!</b></span> Admin user created/updated.<br>";
    echo "<b>Email:</b> $email<br>";
    echo "<b>Password:</b> $password<br><br>";
    echo "<b>IMPORTANT:</b> Delete this file after use for security!";

} catch (\Exception $e) {
    echo "<span style='color:red'><b>Error:</b> " . $e->getMessage() . "</span><br>";
}
