// Build script to inject environment variables into index.html
// Run this during Vercel build: node build.js

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('ERROR: Missing required environment variables');
  console.error('Required: SUPABASE_URL, SUPABASE_ANON_KEY');
  process.exit(1);
}

// Read the template
const template = fs.readFileSync('index.html', 'utf8');

// Replace placeholders
const output = template
  .replace('{{SUPABASE_URL}}', SUPABASE_URL)
  .replace('{{SUPABASE_ANON_KEY}}', SUPABASE_ANON_KEY);

// Write to dist folder
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

fs.writeFileSync('dist/index.html', output);

console.log('✓ Build complete: dist/index.html');
