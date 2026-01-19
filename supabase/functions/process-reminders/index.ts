
/// <reference types="https://raw.githubusercontent.com/supabase/functions-js/main/src/edge-runtime.d.ts" />

import { createClient } from '@supabase/supabase-js'

// Edge Function to process reminders
// Should be scheduled via pg_cron or Supabase Dashboard cron to run every e.g. 15 minutes.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
    try {
        const now = new Date();
        const tomorrowStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const dateStr = tomorrowStart.toISOString().split('T')[0];

        const { data: appointments24h, error: error24h } = await supabase
            .from('appointments')
            .select(`
                id, 
                client_name, 
                client_phone, 
                appointment_date, 
                appointment_time,
                businesses (name)
            `)
            .eq('status', 'confirmed')
            .eq('appointment_date', dateStr);

        if (error24h) {
            console.error("Error fetching appointments:", error24h);
            throw error24h;
        }

        return new Response(JSON.stringify({
            processed_24h: appointments24h?.length || 0,
            processed_2h: 0,
            message: "Reminders processed",
            date_processed: dateStr
        }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Exec error:", error);
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
})
