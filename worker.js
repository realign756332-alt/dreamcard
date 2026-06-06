export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    const { prompt } = await request.json();
    const REPLICATE_KEY = '';
    const r = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
      method: 'POST',
      headers: { 'Authorization': 'Token ' + REPLICATE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: { prompt, num_outputs: 1, aspect_ratio: '16:9', output_format: 'webp', output_quality: 90 } })
    });
    const data = await r.json();
    let prediction = data;
    for (let i = 0; i < 30; i++) {
      await new Promise(res => setTimeout(res, 2000));
      const poll = await fetch('https://api.replicate.com/v1/predictions/' + prediction.id, {
        headers: { 'Authorization': 'Token ' + REPLICATE_KEY }
      });
      prediction = await poll.json();
      if (prediction.status === 'succeeded' || prediction.status === 'failed') break;
    }
    return new Response(JSON.stringify(prediction), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
};