document.addEventListener('DOMContentLoaded', () => {
  try {
    const iframe = document.getElementById('ghl-form');
    const errorEl = document.getElementById('error');
    if (!iframe || !errorEl) return;

    const parts = window.location.host.split('.');
    let clientSlug;

    if (parts.length >= 2) {
      clientSlug = parts[0];
    } else {
      return showError();
    }

    const isLocalhost = window.location.host.includes('localhost');
    if ((parts.length === 2 || clientSlug === 'www') && !isLocalhost) {
      window.location.href = 'https://www.logichealth.co';
      return;
    }

    const SUPABASE_URL = '{{SUPABASE_URL}}';
    const SUPABASE_ANON_KEY = '{{SUPABASE_ANON_KEY}}';

    loadForm(clientSlug, SUPABASE_URL, SUPABASE_ANON_KEY)
      .then(formUrl => {
        iframe.src = formUrl;
        document.title = `Application Form - ${clientSlug}`;
        iframe.style.display = 'block';
        errorEl.classList.add('is-hidden');
      })
      .catch(err => {
        console.error('Failed to load form:', err);
        showError();
      });

    function loadForm(slug, url, key) {
      const query = `client_slug=eq.${slug}&status=eq.active&select=form_url_short`;
      return fetch(`${url}/rest/v1/sellerportal_affiliate_codes?${query}`, {
        headers: {
          apikey: key,
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          if (!res.ok) throw new Error('API request failed');
          return res.json();
        })
        .then(data => {
          if (!data || data.length === 0) throw new Error('No affiliate found');
          const baseUrl = data[0].form_url_short;
          const iframeUrl = new URL(baseUrl);
          const currentParams = new URLSearchParams(window.location.search);
          const allowedParams = new Set([
            'affiliate',
            'master',
            'utm_source',
            'utm_medium',
            'utm_campaign',
            'utm_term',
            'utm_content',
            'gclid',
            'fbclid',
            'ref',
            'source'
          ]);

          for (const [keyName, value] of currentParams) {
            if (allowedParams.has(keyName)) {
              iframeUrl.searchParams.set(keyName, value);
            }
          }

          return iframeUrl.toString() + (window.location.hash || '');
        });
    }

    function showError() {
      iframe.style.display = 'none';
      errorEl.classList.remove('is-hidden');
    }
  } catch (err) {
    console.error('Unexpected error rendering application form:', err);
    const iframe = document.getElementById('ghl-form');
    const errorEl = document.getElementById('error');
    if (iframe) iframe.style.display = 'none';
    errorEl?.classList.remove('is-hidden');
  }
});
