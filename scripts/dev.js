// Local development server with environment variable injection
// Run: node dev.js

const http = require('http');
const fs = require('fs');
const path = require('path');

// Load .env file
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('ERROR: Missing environment variables in .env file');
  console.error('Required: SUPABASE_URL, SUPABASE_ANON_KEY');
  process.exit(1);
}

// Function to inject environment variables into templates
function injectEnvVars(template) {
  return template
    .replace(/\{\{SUPABASE_URL\}\}/g, SUPABASE_URL)
    .replace(/\{\{SUPABASE_ANON_KEY\}\}/g, SUPABASE_ANON_KEY);
}

// Function to read and inject template files (reads fresh on each request)
function getTemplate(filename) {
  return injectEnvVars(fs.readFileSync(`src/pages/${filename}`, 'utf8'));
}

const server = http.createServer((req, res) => {
  const host = req.headers.host || 'localhost:3000';
  const url = req.url;
  console.log(`Request from: ${host}${url}`);

  // Serve JavaScript files from /assets/js/
  if (url.startsWith('/assets/js/') && url.endsWith('.js')) {
    const filename = path.basename(url);
    const filePath = path.join(__dirname, '..', 'src', 'assets', 'js', filename);
    if (fs.existsSync(filePath)) {
      const jsContent = injectEnvVars(fs.readFileSync(filePath, 'utf8'));
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(jsContent);
      return;
    }
  }

  // Serve static files (images)
  if (url.match(/\.(webp|png|jpg|jpeg|gif|svg)$/)) {
    const filePath = path.join(__dirname, '..', 'src', 'assets', 'images', path.basename(url));
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const contentTypes = {
        '.webp': 'image/webp',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
      };
      res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  res.writeHead(200, { 'Content-Type': 'text/html' });

  // Route handling (reads files fresh on each request)
  if (url === '/test' || url === '/test.html') {
    res.end(getTemplate('test.html'));
  } else if (url === '/form' || url === '/form.html') {
    res.end(getTemplate('form.html'));
  } else if (url === '/hhc' || url === '/hhc.html') {
    res.end(getTemplate('hhc.html'));
  } else {
    // Default: serve landing page
    res.end(getTemplate('landing.html'));
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`\n✓ Dev server running at http://localhost:${PORT}`);
  console.log(`\nAvailable routes:`);
  console.log(`  /       - Landing page with affiliate name`);
  console.log(`  /form   - Short application form (iframe)`);
  console.log(`  /hhc    - Health History & Consent form (iframe)`);
  console.log(`  /test   - Database connection test page\n`);
  console.log(`To test subdomain routing, you need to:`);
  console.log(`1. Edit your hosts file to add test domains`);
  console.log(`2. Or use a service like ngrok with wildcard subdomains\n`);
  console.log(`Example test URLs (with hosts file):`);
  console.log(`  http://monster-michael-todd.localhost:${PORT}`);
  console.log(`  http://monster-michael-todd.localhost:${PORT}/form`);
  console.log(`  http://monster-michael-todd.localhost:${PORT}/hhc\n`);
});
