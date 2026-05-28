<?php

if (! function_exists('encode_string')) {
    /**
     * Caesar cipher encoding — shift each character forward by 1.
     */
    function encode_string(string $string): string
    {
        $encoded = '';
        $length = strlen($string);

        for ($i = 0; $i < $length; $i++) {
            $encoded .= chr(ord($string[$i]) + 1);
        }

        return $encoded;
    }
}

if (! function_exists('decode_string')) {
    /**
     * Caesar cipher decoding — shift each character backward by 1.
     */
    function decode_string(string $string): string
    {
        $decoded = '';
        $length = strlen($string);

        for ($i = 0; $i < $length; $i++) {
            $decoded .= chr(ord($string[$i]) - 1);
        }

        return $decoded;
    }
}
