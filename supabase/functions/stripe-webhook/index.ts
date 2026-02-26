import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from 'npm:stripe@^14.0.0';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

Deno.serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature');
  
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!signature || !webhookSecret) {
    return new Response('Webhook secret not configured or signature missing.', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      const userId = session.client_reference_id;
      
      if (userId) {
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        
        // Atribui ou atualiza o status de subscription dentro do JSON user_metadata
        // Fetch existing metadata first to merge properly
        const { data: { user }, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
        
        if (user) {
            const currentMetadata = user.user_metadata || {};
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                userId,
                { user_metadata: { ...currentMetadata, subscription_status: 'active' } }
            );
            
            if (updateError) {
                console.error('Failed to update user status: ', updateError);
                return new Response('Error updating user', { status: 500 });
            }
            console.log(`User ${userId} subscription activated successfully.`);
        } else {
            console.error('User not found in Auth table', fetchError);
        }
      } else {
        console.log('No client_reference_id found in session.');
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});
