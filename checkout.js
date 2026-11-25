import { stripe, db } from '../lib/clients.js';
import { EVENT } from '../public/config.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { name, email, qty } = req.body || {};
  const n = Math.min(Math.max(parseInt(qty) || 1, 1), EVENT.maxPerOrder);
  if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email || ''))
    return res.status(400).json({ error: 'Enter your name and a valid email address.' });

  const { count } = await db.from('tickets').select('*', { count: 'exact', head: true });
  if ((count ?? 0) + n > EVENT.capacity)
    return res.status(409).json({ error: 'Not enough tickets left.' });

  const origin = `https://${req.headers.host}`;
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: email,
    line_items: [{ quantity: n, price_data: { currency: 'eur', unit_amount: EVENT.priceCents,
      product_data: { name: `${EVENT.name} ticket` } } }],
    metadata: { name: name.trim().slice(0, 100), qty: String(n) },
    success_url: `${origin}/?paid=1`,
    cancel_url: origin,
  });
  res.json({ url: session.url });
}
