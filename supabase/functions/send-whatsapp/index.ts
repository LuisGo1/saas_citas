import { createClient } from 'jsr:@supabase/supabase-js@2'

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
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const body = await req.json();
        const {
            phone,
            templateName: providedTemplateName,
            components: providedComponents,
            languageCode = 'es',
            businessId,
            // New dynamic fields
            clientName,
            businessName: providedBusinessName,
            date,
            time
        } = body;

        let token = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
        let businessPhoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
        let templateName = providedTemplateName || "hello_world";
        let finalBusinessName = providedBusinessName;

        // Logic to switch provider based on Plan
        if (businessId) {
            const { data: business } = await supabase
                .from('businesses')
                .select('name, owner_id, whatsapp_settings')
                .eq('id', businessId)
                .single();

            if (business) {
                finalBusinessName = business.name;
                const { data: subscription } = await supabase
                    .from('subscriptions')
                    .select('plan, whatsapp_provider')
                    .eq('user_id', business.owner_id)
                    .single();

                const settings = typeof business.whatsapp_settings === 'string'
                    ? JSON.parse(business.whatsapp_settings)
                    : (business.whatsapp_settings || {});

                if (settings.templateName) {
                    templateName = settings.templateName;
                }

                // If Basic plan or explicitly own_api, try to use custom credentials
                if (subscription?.plan === 'basic' || subscription?.whatsapp_provider === 'own_api') {
                    if (settings.accessToken && settings.phoneNumberId) {
                        token = settings.accessToken;
                        businessPhoneNumberId = settings.phoneNumberId;
                        console.log("Using Custom WhatsApp Credentials for Business:", businessId);
                    } else {
                        throw new Error("Plan Basic requiere configuración de WhatsApp en Ajustes.");
                    }
                }
            }
        }

        if (!token || !businessPhoneNumberId) {
            throw new Error("Configuración de WhatsApp incompleta.");
        }

        // Build Dynamic Components for Template
        let components = providedComponents || [];

        if (components.length === 0 && (clientName || finalBusinessName || date || time)) {
            // Standard mapping: 1=Client, 2=Business, 3=Date, 4=Time
            const params = [];
            if (clientName) params.push({ type: "text", text: clientName });
            if (finalBusinessName) params.push({ type: "text", text: finalBusinessName });
            if (date) params.push({ type: "text", text: date });
            if (time) params.push({ type: "text", text: time });

            components = [
                {
                    type: "body",
                    parameters: params
                }
            ];
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
                components: components
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
