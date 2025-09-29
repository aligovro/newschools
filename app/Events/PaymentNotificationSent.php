<?php

namespace App\Events;

use App\Models\Donation;
use App\Models\Organization;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PaymentNotificationSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Organization $organization;
    public Donation $donation;
    public string $type;
    public array $data;

    /**
     * Create a new event instance.
     */
    public function __construct(Organization $organization, Donation $donation, string $type, array $data = [])
    {
        $this->organization = $organization;
        $this->donation = $donation;
        $this->type = $type;
        $this->data = $data;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('organization.' . $this->organization->id),
            new PrivateChannel('admin.notifications'),
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'type' => $this->type,
            'organization_id' => $this->organization->id,
            'organization_name' => $this->organization->name,
            'donation' => [
                'id' => $this->donation->id,
                'amount' => $this->donation->amount,
                'currency' => $this->donation->currency,
                'donor_name' => $this->donation->donor_name,
                'donor_email' => $this->donation->donor_email,
                'created_at' => $this->donation->created_at->toISOString(),
            ],
            'data' => $this->data,
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'payment.notification';
    }
}
