<?php

// Registry of per-service SEO microsites. The key is the `site` slug stored on
// scoped content rows (posts/faqs/gallery_images/leads) and used in the public
// API path /api/microsites/{site}/*. `service` maps the microsite to a row in
// the shared `services` table. Unknown slugs are rejected (404) by the API.
return [
    'mikroblading-ankara' => [
        'name' => 'Mikroblading Ankara',
        'service' => 'microblading',
        'url' => 'https://microbladingankara.com',
    ],
    'kas-tasarimi-ankara' => [
        'name' => 'Kaş Tasarımı Ankara',
        'service' => 'kas-tasarimi',
        'url' => 'https://kastasarimiankara.com',
    ],
];
