import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Langbly API configuration (Google Translate v2 compatible)
const LANGBLY_API_URL = "https://api.langbly.com/language/translate/v2";

// Map DeepL-style codes to ISO 639-1 codes for Langbly
const mapToLangblyCode = (code: string): string => {
  const mapping: Record<string, string> = {
    "EN": "en",
    "ES": "es",
    "FR": "fr",
    "DE": "de",
    "IT": "it",
    "PT-BR": "pt",
    "PT-PT": "pt",
    "RU": "ru",
    "ZH-HANS": "zh",
    "ZH-HANT": "zh-TW",
    "JA": "ja",
    "KO": "ko",
    "AR": "ar",
    "TR": "tr",
    "NL": "nl",
    "PL": "pl",
    "SV": "sv",
    "DA": "da",
    "FI": "fi",
    "NB": "no",
    "EL": "el",
    "ID": "id",
    "CS": "cs",
    "HU": "hu",
    "RO": "ro",
    "UK": "uk",
    "SK": "sk",
    "BG": "bg",
    "LT": "lt",
    "LV": "lv",
    "ET": "et",
    "SL": "sl",
  };
  return mapping[code] || code.toLowerCase().split("-")[0];
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, source_lang, target_lang } = await req.json();

    if (!text || !target_lang) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: text and target_lang" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("LANGBLY_API_KEY");
    if (!apiKey) {
      console.error("LANGBLY_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Translation service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const targetCode = mapToLangblyCode(target_lang);
    const requestBody: Record<string, string> = {
      q: text,
      target: targetCode,
    };

    if (source_lang && source_lang !== "AUTO") {
      requestBody.source = mapToLangblyCode(source_lang);
    }

    console.log("Calling Langbly API with:", { target: targetCode, source: requestBody.source || "auto" });

    const response = await fetch(LANGBLY_API_URL, {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Langbly API error:", response.status, errorText);

      if (response.status === 401 || response.status === 403) {
        return new Response(
          JSON.stringify({ error: "Invalid API key. Please check your Langbly API key." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Translation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("Langbly response:", data);

    const translatedText = data.data.translations[0].translatedText;
    const detectedSourceLang = data.data.translations[0].detectedSourceLanguage;

    return new Response(
      JSON.stringify({
        translated_text: translatedText,
        detected_source_lang: detectedSourceLang ? detectedSourceLang.toUpperCase() : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Translation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
