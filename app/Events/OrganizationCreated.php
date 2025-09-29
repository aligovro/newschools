<?php

namespace App\Events;

use App\Models\Organization;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrganizationCreated implements ShouldBroadcast
{
  use Dispatchable, InteractsWithSockets, SerializesModels;

  public Organization $organization;

  /**
   * Create a new event instance.
   */
  public function __construct(Organization $organization)
  {
    $this->organization = $organization;
  }

  /**
   * Get the channels the event should broadcast on.
   */
  public function broadcastOn(): array
  {
    return [
      new PrivateChannel('admin.notifications'),
    ];
  }

  /**
   * Get the data to broadcast.
   */
  public function broadcastWith(): array
  {
    return [
      'type' => 'organization.created',
      'organization' => [
        'id' => $this->organization->id,
        'name' => $this->organization->name,
        'type' => $this->organization->type,
        'status' => $this->organization->status,
        'created_at' => $this->organization->created_at->toISOString(),
      ],
      'timestamp' => now()->toISOString(),
    ];
  }

  /**
   * The event's broadcast name.
   */
  public function broadcastAs(): string
  {
    return 'organization.created';
  }
}
