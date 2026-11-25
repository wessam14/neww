import { randomBytes } from 'crypto';
import { makeTicket } from '../lib/ticket.js';
import { stripe, db, mail } from '../lib/clients.js';
import { EVENT } from '../public/config.js';

export const config = { api: { bodyParser: false } };
const raw = async (req) => { const c = []; for await (const x of req) c.push(x); return Buffer.concat(c); };

export default async function handler(req, res) {
  let event;
  try {
    event = stripe.webhooks.constructEvent(await raw(req), req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch { return res.status(400).end(); }

  const s = event.data.object;
  if (event.type !== 'checkout.session.completed' || s.payment_status !== 'paid') return res.json({ ok: true });

  // Stripe may send the same event twice: create tickets only once per payment.
  const { data: existing } = await db.from('tickets').select('id').eq('session_id', s.id).limit(1);
  if (existing?.length) return res.json({ ok: true });

  const email = s.customer_details.email;
  const rows = Array.from({ length: parseInt(s.metadata.qty) || 1 }, () => ({
    code: randomBytes(16).toString('hex'), session_id: s.id, name: s.metadata.name, email }));
  const { error } = await db.from('tickets').insert(rows);
  if (error) return res.status(500).end();

  try {
    const attachments = await Promise.all(rows.map(async (r, i) => ({
      filename: `ticket-${i + 1}.png`, cid: `t${i}`, content: await makeTicket(r.code, s.metadata.name) })));
    await mail.sendMail({
      from: `${EVENT.name} <${process.env.GMAIL_USER}>`, to: email,
      subject: `Your ${EVENT.name} ticket${rows.length > 1 ? 's' : ''}`,
      html: `<p>Hi ${s.metadata.name.replace(/[<>&]/g, '')},</p>
        <p>Thanks for your purchase. Show ${rows.length > 1 ? 'one ticket per person' : 'this ticket'} at the entrance, on your phone or printed.
        Each code works once.</p><p>${EVENT.date}<br>${EVENT.venue}</p>
        ${rows.map((_, i) => `<p><img src="cid:t${i}" width="560" style="max-width:100%;height:auto" alt="Ticket ${i + 1}"></p>`).join('')}`,
      attachments,
    });
  } catch {
    // Email failed: undo so Stripe retries the whole webhook.
    await db.from('tickets').delete().eq('session_id', s.id);
    return res.status(500).end();
  }
  res.json({ ok: true });
}
