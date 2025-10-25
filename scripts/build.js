// Build script to inject environment variables into HTML files
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

// Create dist folder if it doesn't exist
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// List of HTML files to process
const htmlFiles = ['landing.html', 'form.html', 'hhc.html'];

// Process each HTML file
htmlFiles.forEach(filename => {
  const template = fs.readFileSync(path.join('src', 'pages', filename), 'utf8');

  // Replace all placeholders (use regex to handle multiple occurrences)
  const output = template
    .replace(/\{\{SUPABASE_URL\}\}/g, SUPABASE_URL)
    .replace(/\{\{SUPABASE_ANON_KEY\}\}/g, SUPABASE_ANON_KEY);

  // Determine output filename
  let outputFilename = filename;

  // Rename landing.html to index.html for the root route
  if (filename === 'landing.html') {
    outputFilename = 'index.html';
  }

  fs.writeFileSync(path.join('dist', outputFilename), output);
  console.log(`✓ Built: dist/${outputFilename}`);
});

// Ensure JS output directory exists
const jsOutputDir = path.join('dist', 'assets', 'js');
fs.mkdirSync(jsOutputDir, { recursive: true });

// List of JS files to process (with placeholder replacement)
const jsFiles = ['landing.js', 'form.js', 'hhc.js', 'session-timeout.js'];

jsFiles.forEach(filename => {
  const template = fs.readFileSync(path.join('src', 'assets', 'js', filename), 'utf8');
  const output = template
    .replace(/\{\{SUPABASE_URL\}\}/g, SUPABASE_URL)
    .replace(/\{\{SUPABASE_ANON_KEY\}\}/g, SUPABASE_ANON_KEY);

  fs.writeFileSync(path.join(jsOutputDir, filename), output);
  console.log(`✓ Built: dist/assets/js/${filename}`);
});

// Copy static assets
const assets = [
  { src: 'src/assets/images/BlackBackgroundLogoWide.webp', dest: 'dist/BlackBackgroundLogoWide.webp' },
  { src: 'src/assets/images/favicon.png', dest: 'dist/favicon.png' }
];

assets.forEach(asset => {
  fs.copyFileSync(asset.src, asset.dest);
  console.log(`✓ Copied: ${asset.dest}`);
});

console.log('\n✓ Build complete!');
