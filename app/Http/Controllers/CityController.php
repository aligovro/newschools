<?php

namespace App\Http\Controllers;

use App\Models\City;
use Illuminate\Http\Request;

class CityController extends Controller
{
    public function show($id)
    {
        $city = City::findOrFail($id);
        return response()->json([
            'id' => $city->id,
            'name' => $city->name,
            'region_id' => $city->region_id,
            'latitude' => $city->latitude,
            'longitude' => $city->longitude,
        ]);
    }
}
