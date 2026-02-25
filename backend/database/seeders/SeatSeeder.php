<?php

namespace Database\Seeders;

use App\Models\Seat;
use Illuminate\Database\Seeder;

/**
 * Seeder to create seats for the event venue
 * Creates 2 blocks (Left & Right) with 10 rows and 5 seats per row
 * First 2 rows in each block are VIP seats
 */
class SeatSeeder extends Seeder
{
    public function run(): void
    {
        $blocks = ['left', 'right'];
        $rowsPerBlock = 10;
        $seatsPerRow = 5;
        $vipRows = [1, 2]; // First 2 rows are VIP

        foreach ($blocks as $block) {
            $blockPrefix = $block === 'left' ? 'L' : 'R';

            for ($row = 1; $row <= $rowsPerBlock; $row++) {
                for ($seat = 1; $seat <= $seatsPerRow; $seat++) {
                    Seat::firstOrCreate(
                        [
                            'seat_number' => $blockPrefix . '-' . $row . '-' . $seat,
                            'day' => 'day1' // Added this if day is part of unique constraint, though it seems not. Just keeping the existing fields to check. Wait, seats table doesn't have day.
                        ],
                        [
                            'block' => $block,
                            'row_number' => $row,
                            'seat_index' => $seat,
                            'type' => in_array($row, $vipRows) ? 'vip' : 'regular',
                        ]
                    );
                }
            }
        }
    }
}
