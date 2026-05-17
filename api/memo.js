export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const JSONBIN_KEY = process.env.JSONBIN_API_KEY;
  const MASTER_BIN = process.env.JSONBIN_MASTER_BIN;
  const BASE_URL = 'https://api.jsonbin.io/v3';

  const headers = {
    'Content-Type': 'application/json',
    'X-Master-Key': JSONBIN_KEY,
    'X-Bin-Private': 'false',
  };

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { action, keyword, memos } = body;

    // マスターBin（合言葉→BinID のマップ）を読む
    async function getMaster() {
      const r = await fetch(`${BASE_URL}/b/${MASTER_BIN}/latest`, { headers });
      const d = await r.json();
      return d.record || {};
    }

    // マスターBinを更新
    async function updateMaster(data) {
      await fetch(`${BASE_URL}/b/${MASTER_BIN}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
      });
    }

    if (action === 'get') {
      // 合言葉でメモ取得
      const master = await getMaster();
      const binId = master[keyword];
      if (!binId) {
        res.status(200).json({ memos: [], isNew: true });
        return;
      }
      const r = await fetch(`${BASE_URL}/b/${binId}/latest`, { headers });
      const d = await r.json();
      res.status(200).json({ memos: d.record.memos || [], isNew: false });

    } else if (action === 'save') {
      // メモ保存
      const master = await getMaster();
      let binId = master[keyword];

      if (!binId) {
        // 新規Bin作成
        const r = await fetch(`${BASE_URL}/b`, {
          method: 'POST',
          headers: { ...headers, 'X-Bin-Name': 'paranoise-memo-' + keyword },
          body: JSON.stringify({ memos })
        });
        const d = await r.json();
        binId = d.metadata.id;
        master[keyword] = binId;
        await updateMaster(master);
      } else {
        // 既存Bin更新
        await fetch(`${BASE_URL}/b/${binId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ memos })
        });
      }
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
