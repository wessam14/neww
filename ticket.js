import path from 'path';
import QRCode from 'qrcode';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { TICKET } from '../public/config.js';

const dir = path.join(process.cwd(), 'assets');
GlobalFonts.registerFromPath(path.join(dir, 'font.ttf'), 'TicketFont');
let template;

// Draws the buyer's name and their unique QR code onto your ticket design.
export async function makeTicket(code, name) {
  template ??= await loadImage(path.join(dir, 'ticket-template.png'));
  const canvas = createCanvas(template.width, template.height), x = canvas.getContext('2d');
  x.drawImage(template, 0, 0);

  const { qr, name: n } = TICKET;
  const qrPng = await QRCode.toBuffer(code, { margin: 1, width: qr.size });
  x.drawImage(await loadImage(qrPng), qr.x, qr.y, qr.size, qr.size);

  x.fillStyle = n.color; x.font = `bold ${n.size}px TicketFont`;
  x.textBaseline = 'top'; x.textAlign = 'left';
  x.fillText(name, n.x, n.y, n.maxWidth);
  return canvas.toBuffer('image/png');
}
