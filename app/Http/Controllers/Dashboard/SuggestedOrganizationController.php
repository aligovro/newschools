<?php
namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\SuggestedOrganization\SuggestedOrganizationListRequest;
use App\Models\SuggestedOrganization;
use Inertia\Inertia;
use Inertia\Response;

class SuggestedOrganizationController extends Controller
{
    public function index(SuggestedOrganizationListRequest $request): Response
    {
        $filters = $request->validated();

        return Inertia::render('dashboard/suggested-organizations/IndexPage', [
            'initialFilters' => $filters,
            'options' => [
                'statuses' => SuggestedOrganization::STATUSES,
                'sortableFields' => SuggestedOrganization::SORTABLE_FIELDS,
                'perPageOptions' => [10, 15, 25, 50, 100],
            ],
        ]);
    }
}
