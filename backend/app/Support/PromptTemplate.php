<?php

namespace App\Support;

use RuntimeException;

/**
 * `resources/prompts/<name>.md` şablonundaki {{KEY}} yer tutucularını verilen
 * değerlerle değiştirir. İşlem sonunda hâlâ {{TOKEN}} kalmışsa (yazım hatası
 * ya da eksik değişken) hata fırlatır — sessizce eksik prompt gönderilmez.
 */
final class PromptTemplate
{
    /**
     * @param  array<string, string>  $vars
     */
    public static function render(string $name, array $vars): string
    {
        $path = resource_path("prompts/{$name}.md");

        if (! is_file($path)) {
            throw new RuntimeException("Prompt şablonu bulunamadı: {$path}");
        }

        $template = (string) file_get_contents($path);

        $replacements = [];
        foreach ($vars as $key => $value) {
            $replacements['{{'.$key.'}}'] = $value;
        }

        $rendered = strtr($template, $replacements);

        if (preg_match('/\{\{[A-Z_]+\}\}/', $rendered, $matches)) {
            throw new RuntimeException("Prompt şablonunda değeri verilmeyen yer tutucu kaldı: {$matches[0]} ({$name})");
        }

        return $rendered;
    }
}
