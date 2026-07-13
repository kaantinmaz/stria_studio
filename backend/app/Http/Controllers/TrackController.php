<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Visit;
use App\Support\TrafficSource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TrackController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'type' => ['required', 'in:pageview,event'],
            'path' => ['required', 'string', 'max:512'],
            'referrer' => ['nullable', 'string', 'max:512'],
            'name' => ['required_if:type,event', 'string', 'max:64'],
            'site' => ['nullable', 'string', 'max:40'],
            'utm_source' => ['nullable', 'string', 'max:255'],
            'utm_medium' => ['nullable', 'string', 'max:255'],
            'utm_campaign' => ['nullable', 'string', 'max:255'],
        ]);

        // Microsites send their slug; the main site sends none. Keep only known
        // slugs so a bad value can't pollute the per-site dashboard. NULL = main.
        $site = $data['site'] ?? null;
        if ($site !== null && ! config("microsites.$site")) {
            $site = null;
        }

        $ua = (string) $request->userAgent();
        if (preg_match('/bot|crawl|spider|slurp|headless|preview/i', $ua)) {
            return response()->noContent();
        }

        $visitorId = hash('sha256', $request->ip().$ua.now()->toDateString().config('app.key'));

        if ($data['type'] === 'event') {
            Event::create([
                'visitor_id' => $visitorId,
                'site' => $site,
                'name' => $data['name'],
                'path' => $data['path'],
            ]);
        } else {
            $referrer = $data['referrer'] ?? null;
            Visit::create([
                'visitor_id' => $visitorId,
                'site' => $site,
                'path' => $data['path'],
                'source' => TrafficSource::classify($referrer, $data['utm_source'] ?? null),
                'referrer_host' => $referrer ? Str::lower((string) parse_url($referrer, PHP_URL_HOST)) : null,
                'utm_source' => $data['utm_source'] ?? null,
                'utm_medium' => $data['utm_medium'] ?? null,
                'utm_campaign' => $data['utm_campaign'] ?? null,
            ]);
        }

        return response()->noContent();
    }
}
