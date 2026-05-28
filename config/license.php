<?php

return [

    /*
    |--------------------------------------------------------------------------
    | License Server Configuration
    |--------------------------------------------------------------------------
    |
    | These endpoints point to the CRM license server. Values are stored
    | obfuscated in the .env file and decoded at runtime using the
    | decode_string() helper.
    |
    */

    'activate_url' => decode_string(env('BVUIVSM', '')),
    'check_url' => decode_string(env('VSM', '')),
    'login_url' => decode_string(env('WVSM', '')),

];
