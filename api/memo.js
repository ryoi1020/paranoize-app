export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const SUPABASE_URL = 'https://hpyaocrnmvnnbltbazrx.supabase.co';
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  try {
    if (req.method === 'GET') {
      const { keyword } = req.query;
      const r = await fetch(`${SUPABASE_URL}/rest/v1/memo_data?keyword=eq.${encodeURIComponent(keyword)}&select=data`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      const rows = await r.json();
      if (rows.length > 0) {
        res.status(200).json({ data: rows[0].data });
      } else {
        res.status(200).json({ data: null });
      }
    } else if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { keyword, data } = body;
      await fetch(`${SUPABASE_URL}/rest/v1/memo_data`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({ keyword, data })
      });
      res.status(200).json({ ok: true });
    }
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
