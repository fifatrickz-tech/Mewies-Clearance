MEWIE'S CLEARANCE WEBSITE

MEWIE'S CLEARANCE WEBSITE

Folder structure:
- index.html
- services.html
- about.html
- areas.html
- reviews.html
- contact.html
- css/styles.css
- js/script.js
- api/contact.js
- package.json

Deployment:
Upload the whole folder to GitHub and connect the repository to Vercel.

Cloudflare Turnstile:
1. Create a Turnstile widget in Cloudflare.
2. Add your live domain as a hostname.
3. Replace YOUR_TURNSTILE_SITE_KEY in contact.html with your Turnstile Site Key.
4. Add TURNSTILE_SECRET_KEY in Vercel Environment Variables.

Resend:
Add these Vercel Environment Variables:
RESEND_API_KEY
TURNSTILE_SECRET_KEY
FROM_EMAIL
TO_EMAIL

Testing sender example:
FROM_EMAIL = Mewie's Clearance <onboarding@resend.dev>
TO_EMAIL = the email address connected to your Resend account

Production example after verifying the domain in Resend:
FROM_EMAIL = Mewie's Clearance <hello@mewiesclearance.co.uk>
TO_EMAIL = enquiries@mewiesclearance.co.uk

The contact form backend is already connected to /api/contact.
