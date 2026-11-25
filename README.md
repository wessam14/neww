# ISC Ball 2027 tickets

Edit `public/config.js` (school, date, venue) and the organiser line at the bottom of `public/index.html`.
Create `public/impressum.html` and `public/datenschutz.html` (required in Austria).

## Your own ticket design
Design a ticket image in Canva or any editor (about 1400 x 560 px is good), leave empty space for the QR code and the name,
and export it as PNG. Save it over `assets/ticket-template.png`. Then open `/designer.html` on your site (or just open the file
in a browser), choose your image, drag the QR square and the name into place, and paste the text it shows into `public/config.js`
(replace the `TICKET` block). Every buyer then gets your design with their own name and a unique QR code.
To change the font, replace `assets/font.ttf` with any .ttf file.

## Setup (easiest on a computer)
1. **Supabase** (supabase.com, free): new project, open SQL Editor, paste and run `schema.sql`.
   Settings > API: copy the Project URL and the `service_role` key.
2. **Gmail**: use a dedicated Gmail account for the ball. Turn on 2-step verification, then create an
   App Password (myaccount.google.com/apppasswords). Gmail allows about 500 emails per day.
3. **Stripe** (stripe.com, Austria): finish account activation with the school/association details and its IBAN.
   Stay in Test mode first. Copy the Secret key. In Settings > Payment methods, turn on EPS, Apple Pay, Google Pay.
4. **Vercel** (vercel.com, free): put this folder in a GitHub repo, "Add New Project", import it.
   Add environment variables: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (step 5), `SUPABASE_URL`,
   `SUPABASE_SERVICE_KEY`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `SCANNER_PASSWORD` (choose one). Deploy.
5. **Stripe webhook**: Developers > Webhooks > add endpoint `https://YOUR-SITE.vercel.app/api/webhook`,
   event `checkout.session.completed`. Copy its signing secret into `STRIPE_WEBHOOK_SECRET`, then redeploy.
6. **Test**: buy with card 4242 4242 4242 4242 (any future date, any CVC). Check the email arrives, then open
   `/scan.html` on a phone, enter the scanner password and scan the QR code. Scanning twice must say "Already used".
7. **Go live**: switch Stripe to Live mode, replace the keys and webhook secret, redeploy.
   Delete test rows in Supabase (Table Editor > tickets) before the real sale.

Entrance: open `/scan.html` on a phone. Green = let in, orange = already used, red = invalid.
