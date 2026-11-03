<?php

namespace Database\Seeders;

use App\Models\Availability;
use App\Models\CabinetSetting;
use App\Models\Medication;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Seeder;
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'medecin@cabinet.local'],
            [
                'name' => 'Dr. Médecin Traitant',
                'password' => 'password',
                'role' => 'doctor',
                'phone' => '0522 00 11 22',
                'specialty' => 'Médecine générale',
            ]
        );

        CabinetSetting::query()->updateOrCreate(
            ['id' => 1],
            [
                'name' => 'Cabinet Médical Santé & Soins',
                'doctor_name' => 'Dr. Médecin Traitant',
                'specialty' => 'Médecine générale',
                'address' => '12 Boulevard Zerktouni',
                'city' => 'Casablanca',
                'postal_code' => '20000',
                'phone' => '0522 00 11 22',
                'email' => 'contact@cabinet-atlas.ma',
                'location_text' => 'Maarif, Casablanca',
                'about' => 'Le Cabinet Médical Atlas accompagne les patients dans un cadre calme et moderne. Consultations, suivi chronique, prévention et documents médicaux numérisés.',
                'opening_hours' => "Lundi–Vendredi : 09h00–13h00 / 15h00–19h00\nSamedi : 09h00–13h00",
            ]
        );

        $days = [1, 2, 3, 4, 5];
        foreach ($days as $day) {
            Availability::query()->updateOrCreate(
                ['weekday' => $day, 'start_time' => '09:00:00'],
                ['end_time' => '13:00:00', 'slot_minutes' => 30, 'is_active' => true]
            );
            if ($day < 6) {
                Availability::query()->updateOrCreate(
                    ['weekday' => $day, 'start_time' => '15:00:00'],
                    ['end_time' => '19:00:00', 'slot_minutes' => 30, 'is_active' => true]
                );
            }
        }
        Availability::query()->updateOrCreate(
            ['weekday' => 6, 'start_time' => '09:00:00'],
            ['end_time' => '13:00:00', 'slot_minutes' => 30, 'is_active' => true]
        );

        $meds = [
            ['name' => 'Paracétamol', 'form' => 'Comprimé', 'dosage' => '1000 mg', 'manufacturer' => 'Générique'],
            ['name' => 'Ibuprofène', 'form' => 'Comprimé', 'dosage' => '400 mg', 'manufacturer' => 'Générique'],
            ['name' => 'Amoxicilline', 'form' => 'Gélule', 'dosage' => '500 mg', 'manufacturer' => 'Générique'],
            ['name' => 'Oméprazole', 'form' => 'Gélule', 'dosage' => '20 mg', 'manufacturer' => 'Générique'],
            ['name' => 'Loratadine', 'form' => 'Comprimé', 'dosage' => '10 mg', 'manufacturer' => 'Générique'],
            ['name' => 'Salbutamol', 'form' => 'Inhalateur', 'dosage' => '100 µg', 'manufacturer' => 'Générique'],
            ['name' => 'Metformine', 'form' => 'Comprimé', 'dosage' => '850 mg', 'manufacturer' => 'Générique'],
            ['name' => 'Amlodipine', 'form' => 'Comprimé', 'dosage' => '5 mg', 'manufacturer' => 'Générique'],
        ];
        foreach ($meds as $med) {
            Medication::query()->updateOrCreate(['name' => $med['name'], 'dosage' => $med['dosage']], $med);
        }

        Patient::query()->updateOrCreate(
            ['email' => 'sara.benali@email.ma'],
            [
                'first_name' => 'Sara',
                'last_name' => 'Benali',
                'phone' => '0611223344',
                'birth_date' => '1992-04-18',
                'gender' => 'F',
                'city' => 'Casablanca',
                'address' => 'Rue des Orangers',
                'blood_type' => 'A+',
            ]
        );
        Patient::query()->updateOrCreate(
            ['email' => 'youssef.amrani@email.ma'],
            [
                'first_name' => 'Youssef',
                'last_name' => 'Amrani',
                'phone' => '0666778899',
                'birth_date' => '1985-11-02',
                'gender' => 'M',
                'city' => 'Casablanca',
                'blood_type' => 'O+',
            ]
        );
    }
}
