<?php

namespace App\Http\Controllers;

use App\Models\Locality;
use Illuminate\Http\Request;

class CityController extends Controller
{
    public function show($id)
    {
        $locality = Locality::findOrFail($id);
        return response()->json([
            'id' => $locality->id,
            'name' => $locality->name,
            'region_id' => $locality->region_id,
            'latitude' => $locality->latitude,
            'longitude' => $locality->longitude,
        ]);
    }
}
