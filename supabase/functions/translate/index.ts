import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// DeepL API configuration
const DEEPL_API_URL = "https://api-free.deepl.com/v2/translate";

serve(async (req) => {
  // Handle CORS preflight
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

    const apiKey = Deno.env.get("DEEPL_API_KEY");
    if (!apiKey) {
      console.error("DEEPL_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Translation service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build request body for DeepL
    const requestBody: Record<string, string | string[]> = {
      text: [text],
      target_lang: target_lang,
    };

    // Only add source_lang if provided and not auto-detect
    if (source_lang && source_lang !== "AUTO") {
      // DeepL requires just the base language code for source (no regional variants)
      requestBody.source_lang = source_lang.split("-")[0];
    }

    console.log("Calling DeepL API with:", { target_lang, source_lang: requestBody.source_lang || "auto" });

    const response = await fetch(DEEPL_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepL API error:", response.status, errorText);

      if (response.status === 403) {
        return new Response(
          JSON.stringify({ error: "Invalid API key. Please check your DeepL API key." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else if (response.status === 456) {
        return new Response(
          JSON.stringify({ error: "DeepL quota exceeded. Please check your usage limits." }),
          { status: 456, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
    console.log("DeepL response:", data);

    const translatedText = data.translations[0].text;
    const detectedSourceLang = data.translations[0].detected_source_language;

    return new Response(
      JSON.stringify({
        translated_text: translatedText,
        detected_source_lang: detectedSourceLang,
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
