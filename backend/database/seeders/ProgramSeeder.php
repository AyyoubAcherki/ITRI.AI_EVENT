<?php

namespace Database\Seeders;

use App\Models\Program;
use App\Models\Speaker;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Seeder to create the actual event program
 */
class ProgramSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF;');
        } else {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        }
        
        Program::truncate();
        
        if (DB::getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = ON;');
        } else {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }
        // Get actual speakers by name
        $zakia = Speaker::where('name', 'Dr. Zakia El Yakouti')->first();
        $mohamed = Speaker::where('name', 'Mohamed Tajdid Edine')->first();
        $aya = Speaker::where('name', 'Aya Chihal')->first();
        $loubna = Speaker::where('name', 'Loubna')->first();
        $ahmed = Speaker::where('name', 'Dr. Ahmed Yassine Chakour')->first();
        $ayoub = Speaker::where('name', 'Ayoub El Fellah')->first();

        $programs = [
            // Day 1: Mercredi 01 Avril 2026
            [
                'title' => 'Accueil & Enregistrement',
                'day' => 'day1',
                'start_time' => '08:00',
                'end_time' => '09:10',
                'speaker_id' => null,
            ],
            [
                'title' => 'Ouverture Officielle (كلمة المدير + تقديم الإيفنت)',
                'day' => 'day1',
                'start_time' => '09:10',
                'end_time' => '09:25',
                'speaker_id' => null,
            ],
            [
                'title' => 'AXE 1: السيادة والثقة (Dr. Zakia El Yakouti & Mohamed Tajdid Edine)',
                'day' => 'day1',
                'start_time' => '09:30',
                'end_time' => '10:00',
                'speaker_id' => $zakia->id ?? null,
            ],
            [
                'title' => 'Pause Café',
                'day' => 'day1',
                'start_time' => '10:00',
                'end_time' => '10:15',
                'speaker_id' => null,
            ],
            [
                'title' => 'Interventions Sponsors (3 × 10 min)',
                'day' => 'day1',
                'start_time' => '10:15',
                'end_time' => '10:45',
                'speaker_id' => null,
            ],
            [
                'title' => 'AXE 2: الابتكار والتنافسية (Aya Chihal & Loubna)',
                'day' => 'day1',
                'start_time' => '10:45',
                'end_time' => '11:15',
                'speaker_id' => $aya->id ?? null,
            ],
            [
                'title' => 'AXE 3: الآثار والانتشار (Dr. Ahmed Yassine Chakour & Ayoub El Fellah)',
                'day' => 'day1',
                'start_time' => '11:15',
                'end_time' => '11:45',
                'speaker_id' => $ahmed->id ?? null,
            ],
            [
                'title' => 'Présentation de 3 Projets AI',
                'day' => 'day1',
                'start_time' => '11:45',
                'end_time' => '12:15',
                'speaker_id' => null,
            ],
            [
                'title' => 'الخلاصة والشكر (Clôture Jour 1)',
                'day' => 'day1',
                'start_time' => '12:15',
                'end_time' => '12:20',
                'speaker_id' => null,
            ],

            // Day 2 (Placeholder or existing contents refined)
            [
                'title' => 'Workshops Techniques & IA Appliquée',
                'day' => 'day2',
                'start_time' => '09:00',
                'end_time' => '12:00',
                'speaker_id' => $ayoub->id ?? null,
            ],
            [
                'title' => 'IA & Éducation: Défis et Opportunités',
                'day' => 'day2',
                'start_time' => '14:00',
                'end_time' => '16:00',
                'speaker_id' => $loubna->id ?? null,
            ],

            // Day 3 (Placeholder or existing contents refined)
            [
                'title' => 'Table Ronde: Éthique et IA au Maroc',
                'day' => 'day3',
                'start_time' => '09:30',
                'end_time' => '11:30',
                'speaker_id' => $ahmed->id ?? null,
            ],
            [
                'title' => 'Cérémonie de Clôture & Remise des Prix',
                'day' => 'day3',
                'start_time' => '14:00',
                'end_time' => '16:00',
                'speaker_id' => null,
            ],
        ];

        foreach ($programs as $program) {
            Program::create($program);
        }
    }
}
