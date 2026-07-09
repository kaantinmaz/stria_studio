<?php

namespace App\Http\Controllers;

use App\Http\Resources\FaqResource;
use App\Http\Resources\GalleryImageResource;
use App\Http\Resources\PostApiResource;
use App\Http\Resources\PostListResource;
use App\Http\Resources\ServiceApiResource;
use App\Http\Resources\SettingResource;
use App\Models\Faq;
use App\Models\GalleryImage;
use App\Models\Lead;
use App\Models\Post;
use App\Models\Service;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

// Public, read-only API for per-service SEO microsites (e.g. mikrobladingankara.com).
// Content is scoped by the `site` slug; the studio identity (NAP/hours) is shared
// with the main site — same physical business — so settings reuse Setting::current().
class MicrositeController extends Controller
{
    // Resolve + validate the microsite slug against config/microsites.php.
    private function config(string $site): array
    {
        $cfg = config("microsites.$site");
        if (! $cfg) {
            throw new NotFoundHttpException("Unknown microsite: $site");
        }

        return $cfg;
    }

    public function service(string $site): ServiceApiResource
    {
        $cfg = $this->config($site);
        $service = Service::active()->where('slug', $cfg['service'])->firstOrFail();

        return new ServiceApiResource($service);
    }

    public function posts(Request $request, string $site)
    {
        $this->config($site);

        $posts = Post::published()
            ->where('site', $site)
            ->with(['category', 'tags'])
            ->when($request->query('tag'), fn ($q, $slug) =>
                $q->whereHas('tags', fn ($t) => $t->where('slug', $slug)))
            ->orderByDesc('published_at')
            ->paginate(9);

        return PostListResource::collection($posts);
    }

    public function post(string $site, string $slug): PostApiResource
    {
        $this->config($site);

        $post = Post::published()
            ->where('site', $site)
            ->with(['category', 'tags'])
            ->where('slug', $slug)
            ->firstOrFail();

        return new PostApiResource($post);
    }

    public function faqs(string $site)
    {
        $this->config($site);

        return FaqResource::collection(Faq::active()->where('site', $site)->get());
    }

    public function gallery(string $site)
    {
        $this->config($site);

        return GalleryImageResource::collection(
            GalleryImage::active()->where('site', $site)->get()
        );
    }

    public function settings(string $site): SettingResource
    {
        $this->config($site);

        return new SettingResource(Setting::current());
    }

    public function contact(Request $request, string $site): JsonResponse
    {
        $this->config($site);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:160'],
            'service' => ['nullable', 'string', 'max:80'],
            'preferred_date' => ['nullable', 'date'],
            'message' => ['nullable', 'string', 'max:2000'],
        ]);

        $lead = Lead::create($data + ['site' => $site, 'locale' => 'tr']);

        return response()->json(['ok' => true, 'id' => $lead->id], 201);
    }
}
