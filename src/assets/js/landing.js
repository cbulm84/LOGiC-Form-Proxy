document.addEventListener('DOMContentLoaded', () => {
  try {
    const landingPage = document.getElementById('landing-page');
    const errorBlock = document.getElementById('error');

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

    fetchAffiliateData(clientSlug, SUPABASE_URL, SUPABASE_ANON_KEY)
      .then(affiliateName => {
        document.title = `${affiliateName} × LOGiC Health - Transform Your Health`;

        const badgeElement = document.getElementById('affiliate-name-badge');
        if (badgeElement) badgeElement.textContent = affiliateName;

        const nameElement = document.getElementById('affiliate-name');
        if (nameElement) nameElement.textContent = affiliateName;

        const nameElement2 = document.getElementById('affiliate-name-2');
        if (nameElement2) nameElement2.textContent = affiliateName;

        landingPage?.classList.remove('is-hidden');
        errorBlock?.classList.add('is-hidden');
      })
      .catch(err => {
        console.error('Failed to load affiliate page:', err);
        showError();
      });

    function fetchAffiliateData(slug, url, key) {
      const query = `client_slug=eq.${slug}&status=eq.active&select=client_slug,company_name,form_url,form_url_short`;
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
          const affiliateData = data[0];
          return affiliateData.company_name || slug.replace(/-/g, ' ');
        });
    }

    function showError() {
      landingPage?.classList.add('is-hidden');
      errorBlock?.classList.remove('is-hidden');
    }
  } catch (err) {
    console.error('Unexpected error loading landing page:', err);
    const landingPage = document.getElementById('landing-page');
    const errorBlock = document.getElementById('error');
    landingPage?.classList.add('is-hidden');
    errorBlock?.classList.remove('is-hidden');
  }
});
