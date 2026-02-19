<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'is_active',
        'photo',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function organizations(): BelongsToMany
    {
        return $this->belongsToMany(Organization::class, 'organization_users')
            ->withPivot(['role', 'status', 'permissions', 'joined_at', 'last_active_at'])
            ->withTimestamps();
    }

    public function organizationProfiles(): HasMany
    {
        return $this->hasMany(OrganizationUserProfile::class);
    }

    public function profileForOrganization(int $organizationId): ?OrganizationUserProfile
    {
        return $this->organizationProfiles()->where('organization_id', $organizationId)->first();
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }

    public function isOrganizationAdmin(?int $organizationId = null): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        $query = $this->organizations()
            ->wherePivot('role', 'organization_admin');

        if ($organizationId) {
            $query->where('organizations.id', $organizationId);
        }

        return $query->exists();
    }

    public function belongsToOrganization(int $organizationId): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->organizations()
            ->where('organizations.id', $organizationId)
            ->exists();
    }

    /**
     * Получить количество непросмотренных предложенных организаций
     */
    public function getUnviewedSuggestedOrganizationsCount(): int
    {
        if (!$this->isSuperAdmin()) {
            return 0;
        }

        $viewedIds = ViewedSuggestedOrganization::where('user_id', $this->id)
            ->pluck('suggested_organization_id');

        return SuggestedOrganization::where('status', SuggestedOrganization::STATUS_PENDING)
            ->whereNotIn('id', $viewedIds)
            ->count();
    }

    /**
     * Отметить предложенную организацию как просмотренную
     */
    public function markSuggestedOrganizationAsViewed(SuggestedOrganization $suggestedOrganization): void
    {
        ViewedSuggestedOrganization::firstOrCreate(
            [
                'user_id' => $this->id,
                'suggested_organization_id' => $suggestedOrganization->id,
            ],
            [
                'viewed_at' => now(),
            ]
        );
    }
}
