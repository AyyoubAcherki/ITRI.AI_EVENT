<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    /**
     * Send a WhatsApp message to a specific number.
     *
     * @param string $to The recipient's phone number.
     * @param string $message The message content.
     * @return bool
     */
    public function send(string $to, string $message): bool
    {
        // Format the phone number if necessary (e.g., remove leading 0, add country code)
        // Assuming Moroccan numbers for this context (06... -> 2126...)
        $formattedTo = $this->formatPhoneNumber($to);

        // Configure UltraMsg API
        $instanceId = env('WHATSAPP_INSTANCE_ID', 'instance162815');
        $token = env('WHATSAPP_TOKEN', 'bplyfzxy1ruqi862');
        $apiUrl = "https://api.ultramsg.com/{$instanceId}/messages/chat";

        if (!$instanceId || !$token) {
            Log::warning('WhatsApp API URL or Token not configured.');
            return false;
        }

        try {
            // Send to UltraMsg API
            $response = Http::post($apiUrl, [
                'token' => $token,
                'to' => $formattedTo,
                'body' => $message,
            ]);

            if ($response->successful()) {
                Log::info("WhatsApp message sent to $to via UltraMsg");
                return true;
            } else {
                Log::error("Failed to send WhatsApp message via UltraMsg: " . $response->body());
                return false;
            }
        } catch (\Exception $e) {
            Log::error("WhatsApp Service Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Format phone number to international format (212...)
     */
    private function formatPhoneNumber($phone)
    {
        // Remove spaces, hyphens, and other non-numeric chars
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // If it starts with 0 (e.g. 06...), replace 0 with 212
        if (str_starts_with($phone, '0')) {
            return '212' . substr($phone, 1);
        }

        return $phone;
    }
}
