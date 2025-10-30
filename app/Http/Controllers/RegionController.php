<?php

namespace App\Http\Controllers;

use App\Models\Region;
use Illuminate\Http\Request;

class RegionController extends Controller
{
    public function show($id)
    {
        $region = Region::findOrFail($id);
        return response()->json([
            'id' => $region->id,
            'name' => $region->name,
            'code' => $region->code,
            'latitude' => $region->latitude,
            'longitude' => $region->longitude,
        ]);
    }
}
