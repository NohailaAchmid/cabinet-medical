<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Availability;
use Carbon\Carbon;

class SlotService
{
    public function slotsForDate(string $date): array
    {
        $day = Carbon::parse($date)->startOfDay();
        if ($day->lt(Carbon::today())) {
            return [];
        }

        $availabilities = Availability::query()
            ->where('is_active', true)
            ->where('weekday', $day->dayOfWeek)
            ->orderBy('start_time')
            ->get();

        if ($availabilities->isEmpty()) {
            return [];
        }

        $taken = Appointment::query()
            ->whereDate('date', $day->toDateString())
            ->whereNotIn('status', ['cancelled', 'refused'])
            ->pluck('time')
            ->map(fn ($time) => Carbon::parse($time)->format('H:i'))
            ->all();

        $slots = [];
        foreach ($availabilities as $availability) {
            $cursor = Carbon::parse($day->toDateString().' '.$availability->start_time);
            $end = Carbon::parse($day->toDateString().' '.$availability->end_time);
            $minutes = $availability->slot_minutes ?: 30;

            while ($cursor->copy()->addMinutes($minutes)->lte($end)) {
                $value = $cursor->format('H:i');
                $slots[] = [
                    'time' => $value,
                    'available' => ! in_array($value, $taken, true),
                ];
                $cursor->addMinutes($minutes);
            }
        }

        return $slots;
    }
}
