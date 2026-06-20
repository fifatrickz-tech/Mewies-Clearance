const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    });
  });
}

const reveals = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  reveals.forEach((element) => observer.observe(element));
} else {
  reveals.forEach((element) => element.classList.add('in-view'));
}

const contactForm = document.getElementById('contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector('[type="submit"]');
    const formMessage = document.getElementById('form-message');
    const originalButtonText = submitButton.textContent;

    formMessage.textContent = '';
    formMessage.className = 'form-message';
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    try {
      const formData = new FormData(contactForm);

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to send message.');
      }

      formMessage.textContent = "Message sent ✓ We'll be in touch shortly.";
      formMessage.classList.add('success');
      contactForm.reset();

      if (window.turnstile) {
        window.turnstile.reset();
      }

      submitButton.textContent = 'Message sent ✓';

      setTimeout(() => {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }, 3000);
    } catch (error) {
      formMessage.textContent = error.message || 'Unable to send message. Please try again.';
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
}


// Functional before/after reveal sliders
const beforeAfterSliders = document.querySelectorAll('[data-before-after]');

beforeAfterSliders.forEach((slider) => {
  const range = slider.querySelector('.ba-range');

  if (!range) return;

  const updateSlider = (value) => {
    const safeValue = Math.max(0, Math.min(100, Number(value)));
    slider.style.setProperty('--ba-position', `${safeValue}%`);
  };

  updateSlider(range.value || 50);

  range.addEventListener('input', () => {
    updateSlider(range.value);
  });
});
