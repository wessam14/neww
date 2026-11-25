import { db } from '../lib/clients.js';

export default async function handler(req, res) {
  if (req.headers['x-scan-key'] !== process.env.SCANNER_PASSWORD) return res.status(401).json({ status: 'denied' });
  const code = String(req.body?.code || '').trim();
  const { data: t } = await db.from('tickets').select('name, used_at').eq('code', code).maybeSingle();
  if (!t) return res.json({ status: 'invalid' });
  // Only succeeds if the ticket is still unused, so two scans can't both pass.
  const { data: claimed } = await db.from('tickets').update({ used_at: new Date().toISOString() })
    .eq('code', code).is('used_at', null).select('name');
  if (claimed?.length) return res.json({ status: 'valid', name: t.name });
  res.json({ status: 'used', name: t.name, at: t.used_at });
}
