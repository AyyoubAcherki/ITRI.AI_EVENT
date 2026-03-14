<?php

namespace Database\Seeders;

use App\Models\Speaker;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Seeder to create actual event speakers
 */
class SpeakerSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF;');
        } else {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        }
        
        Speaker::truncate();
        
        if (DB::getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = ON;');
        } else {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }
        $speakers = [
            [
                'name' => 'Dr. Zakia El Yakouti',
                'job_title' => 'Experte en Souveraineté Numérique',
                'bio' => 'Spécialiste en confiance numérique et protection des données à caractère personnel.',
                'photo' => null,
            ],
            [
                'name' => 'Mohamed Tajdid Edine',
                'job_title' => 'Expert en Gouvernance IT',
                'bio' => 'Consultant senior en gouvernance et application institutionnelle du numérique.',
                'photo' => null,
            ],
            [
                'name' => 'Aya Chihal',
                'job_title' => 'Innovatrice en Solutions AI',
                'bio' => 'Spécialiste de l\'intégration de l\'IA au sein des entreprises pour la création de valeur ajoutée.',
                'photo' => null,
            ],
            [
                'name' => 'Loubna',
                'job_title' => 'Experte en Compétitivité Numérique',
                'bio' => 'Formatrice en transformation des idées en solutions technologiques concrètes.',
                'photo' => null,
            ],
            [
                'name' => 'Dr. Ahmed Yassine Chakour',
                'job_title' => 'Chercheur en Sécurité des Systèmes',
                'bio' => 'Expert en impacts de l\'IA sur le marché de l\'emploi et risques de cybersécurité.',
                'photo' => null,
            ],
            [
                'name' => 'Ayoub El Fellah',
                'job_title' => 'Expert en Cybersécurité',
                'bio' => 'Spécialiste de la détection et de la prévention des menaces liées à l\'IA.',
                'photo' => null,
            ],
        ];

        foreach ($speakers as $speaker) {
            Speaker::create($speaker);
        }
    }
}
