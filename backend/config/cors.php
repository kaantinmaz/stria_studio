<?php

// CORS for the public API. The frontends live on different domains than this
// backend (striastudio.com.tr + microsites vs admin.striastudio.com.tr), and
// the browser calls /api/track and /api/contact directly — so their origins
// must be allowed here. Comma-separated env override; '*' only for local dev.
return [
    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_map('trim', explode(',', env(
        'CORS_ALLOWED_ORIGINS',
        // Production default: every site that talks to this API.
        'https://striastudio.com.tr,https://www.striastudio.com.tr,'
        .'https://microbladingankara.com,https://www.microbladingankara.com,'
        .'https://kastasarimiankara.com,https://www.kastasarimiankara.com'
    ))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];
