// Edit these values. Used by both the website and the server.
export const EVENT = {
  name: 'ISC Ball 2027',
  school: 'International School Carinthia',
  date: '12/11/2026',        // e.g. 'Saturday, 15 May 2027, 19:00'
  venue: 'Casino Velden',
  priceCents: 2500,             // 25.00 EUR
  capacity: 650,                // total tickets you can sell
  maxPerOrder: 10,
};

// Where the QR code and the buyer's name go on your ticket image (pixels).
// Easiest: open /designer.html, place them by dragging, and paste the result here.
export const TICKET = {
  qr:   { x: 1020, y: 120, size: 320 },
  name: { x: 70, y: 440, size: 56, maxWidth: 820, color: '#f1ece0' },
};
