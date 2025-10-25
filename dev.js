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

// Read and inject templates
const indexTemplate = fs.readFileSync('index.html', 'utf8');
const testTemplate = fs.readFileSync('test.html', 'utf8');

const indexHtml = indexTemplate
  .replace('{{SUPABASE_URL}}', SUPABASE_URL)
  .replace('{{SUPABASE_ANON_KEY}}', SUPABASE_ANON_KEY);

const testHtml = testTemplate
  .replace(/\{\{SUPABASE_URL\}\}/g, SUPABASE_URL)
  .replace(/\{\{SUPABASE_ANON_KEY\}\}/g, SUPABASE_ANON_KEY);

const server = http.createServer((req, res) => {
  const host = req.headers.host || 'localhost:3000';
  const url = req.url;
  console.log(`Request from: ${host}${url}`);

  // Serve test page at /test
  if (url === '/test' || url === '/test.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(testHtml);
    return;
  }

  // Serve main page
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(indexHtml);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`\n✓ Dev server running at http://localhost:${PORT}`);
  console.log(`\nTo test subdomain routing, you need to:`);
  console.log(`1. Edit your hosts file to add test domains`);
  console.log(`2. Or use a service like ngrok with wildcard subdomains\n`);
  console.log(`Example test URLs (with hosts file):`);
  console.log(`  http://monster_michael_todd.direct.localhost:${PORT}`);
  console.log(`  http://grinders_fitness.prestige_labs.localhost:${PORT}\n`);
});
