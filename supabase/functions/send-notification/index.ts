
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as djwt from "https://deno.land/x/djwt@v2.8/mod.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

async function getAccessToken(creds: any) {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600;

    const header: djwt.Header = { alg: "RS256", typ: "JWT" };
    const payload = {
        iss: creds.client_email,
        sub: creds.client_email,
        aud: "https://oauth2.googleapis.com/token",
        iat,
        exp,
        scope: "https://www.googleapis.com/auth/firebase.messaging",
    };

    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";
    const pemContents = creds.private_key
        .replace(pemHeader, "")
        .replace(pemFooter, "")
        .replace(/\s/g, "");

    const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

    const key = await crypto.subtle.importKey(
        "pkcs8",
        binaryDer,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const jwt = await djwt.create(header, payload, key);

    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: jwt,
        }),
    });

    const data = await response.json();
    return data.access_token;
}

serve(async (req) => {
    try {
        const { targetId, targetRole, title, body, data, broadcast } = await req.json();
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        let recipients = [];

        if (broadcast) {
            // Fetch all students with a token
            const { data: students, error: fetchError } = await supabase
                .from('students')
                .select('id, fcm_token, name')
                .not('fcm_token', 'is', null);

            if (fetchError) throw fetchError;
            recipients = (students || []).map(s => ({ id: s.id, token: s.fcm_token, role: 'STUDENT' }));
        } else {
            // Single recipient
            const table = targetRole === 'TRAINER' ? 'trainers' : 'students';
            const { data: user, error: userError } = await supabase
                .from(table)
                .select('fcm_token, name')
                .eq('id', targetId)
                .single();

            if (userError || !user?.fcm_token) {
                return new Response(JSON.stringify({ success: false, message: 'User or FCM token not found' }), { status: 404 });
            }
            recipients = [{ id: targetId, token: user.fcm_token, role: targetRole }];
        }

        if (recipients.length === 0) {
            return new Response(JSON.stringify({ success: true, message: 'No recipients with FCM tokens found' }));
        }

        // 1. SAVE TO DATABASE (Persistence)
        const notificationRecords = recipients.map(r => ({
            user_id: r.id,
            user_role: r.role,
            title,
            body,
            data: data || {},
            is_read: false
        }));

        const { error: dbError } = await supabase
            .from('notifications')
            .insert(notificationRecords);

        if (dbError) console.error("Error saving notifications to DB:", dbError);

        // 3. SEND PUSH
        const credsJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT');
        if (!credsJson) return new Response(JSON.stringify({ error: 'Firebase config missing in Edge Function secrets' }), { status: 500 });

        const creds = JSON.parse(credsJson);
        const accessToken = await getAccessToken(creds);

        const fcmUrl = `https://fcm.googleapis.com/v1/projects/${creds.project_id}/messages:send`;

        const results = await Promise.all(recipients.map(async (r) => {
            try {
                const response = await fetch(fcmUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: {
                            token: r.token,
                            notification: { title, body },
                            data: data || {}
                        }
                    }),
                });
                return { id: r.id, success: response.ok, status: response.status };
            } catch (err) {
                return { id: r.id, success: false, error: err.message };
            }
        }));

        return new Response(JSON.stringify({ success: true, results }));
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
});
