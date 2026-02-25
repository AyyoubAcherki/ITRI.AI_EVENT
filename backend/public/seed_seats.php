<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=itri_event_2026', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Clear existing seats
    $pdo->exec("DELETE FROM seats");

    $stmt = $pdo->prepare("INSERT INTO seats (seat_number, block, row_number, seat_index, type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())");

    $blocks = ['left', 'right'];
    $rowsPerBlock = 10;
    $seatsPerRow = 5;
    $vipRows = [1, 2];

    foreach ($blocks as $block) {
        $blockPrefix = $block === 'left' ? 'L' : 'R';
        for ($row = 1; $row <= $rowsPerBlock; $row++) {
            for ($seat = 1; $seat <= $seatsPerRow; $seat++) {
                $type = in_array($row, $vipRows) ? 'vip' : 'regular';
                $seatNumber = $blockPrefix . '-' . $row . '-' . $seat;
                $stmt->execute([$seatNumber, $block, $row, $seat, $type]);
            }
        }
    }

    echo "Successfully seeded seats!";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
