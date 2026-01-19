
/// <reference types="https://raw.githubusercontent.com/supabase/functions-js/main/src/edge-runtime.d.ts" />


// Removed outdated import


const WHATSAPP_API_URL = "https://graph.facebook.com/v19.0"

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            }
        });
    }

    try {
        const body = await req.json();
        const { phone, templateName, components, languageCode = 'es' } = body;

        const token = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
        const businessPhoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

        if (!token || !businessPhoneNumberId) {
            throw new Error("Missing WhatsApp configuration (WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID)");
        }

        const payload = {
            messaging_product: "whatsapp",
            to: phone,
            type: "template",
            template: {
                name: templateName,
                language: {
                    code: languageCode
                },
                components: components || []
            }
        };

        const response = await fetch(`${WHATSAPP_API_URL}/${businessPhoneNumberId}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("WhatsApp API Error:", data);
            return new Response(JSON.stringify({ error: data }), {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        return new Response(JSON.stringify(data), {
            headers: {
                "Content-Type": "application/json",
                'Access-Control-Allow-Origin': '*'
            },
        });

    } catch (error) {
        console.error("Exec error:", error);
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
                'Access-Control-Allow-Origin': '*'
            },
        });
    }
})
