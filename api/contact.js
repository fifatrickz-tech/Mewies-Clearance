import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ error: 'Email service is not configured.' });
    }

    if (!process.env.TURNSTILE_SECRET_KEY) {
      return res.status(500).json({ error: 'Security check is not configured.' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

    const {
      name = '',
      phone = '',
      email = '',
      postcode = '',
      service = '',
      message = '',
      company = '',
    } = body;

    const turnstileToken = body['cf-turnstile-response'] || body.turnstileToken || '';

    if (company) {
      return res.status(200).json({ success: true });
    }

    if (!name.trim() || !email.trim() || !message.trim()) {
      return res.status(400).json({ error: 'Please complete your name, email and message.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!turnstileToken) {
      return res.status(400).json({ error: 'Please complete the security check.' });
    }

    const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
      }),
    });

    const turnstileResult = await turnstileResponse.json();

    if (!turnstileResult.success) {
      return res.status(403).json({ error: 'Security check failed. Please try again.' });
    }

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "Mewie's Clearance <onboarding@resend.dev>",
      to: [process.env.TO_EMAIL || 'your-email@example.com'],
      replyTo: email,
      subject: `New clearance enquiry from ${name.trim()}`,
      html: buildEmailHtml({ name, phone, email, postcode, service, message }),
      text: buildEmailText({ name, phone, email, postcode, service, message }),
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: error.message || 'Email failed to send.' });
    }

    return res.status(200).json({
      success: true,
      emailId: data?.id || null,
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
}

function isValidEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function buildEmailHtml({ name, phone, email, postcode, service, message }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; line-height: 1.6; color: #111827;">
      <h2>New Mewie's Clearance enquiry</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone || 'Not provided')}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Postcode:</strong> ${escapeHtml(postcode || 'Not provided')}</p>
      <p><strong>Service:</strong> ${escapeHtml(service || 'Not provided')}</p>
      <hr>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
    </div>
  `;
}

function buildEmailText({ name, phone, email, postcode, service, message }) {
  return `
New Mewie's Clearance enquiry

Name: ${name}
Phone: ${phone || 'Not provided'}
Email: ${email}
Postcode: ${postcode || 'Not provided'}
Service: ${service || 'Not provided'}

Message:
${message}
  `.trim();
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
