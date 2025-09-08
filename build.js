const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const terser = require('terser');
const archiver = require('archiver');

if (!fs.existsSync('dist')) fs.mkdirSync('dist');
if (!fs.existsSync(path.join('dist', 'css'))) fs.mkdirSync(path.join('dist', 'css'), { recursive: true });

const jsFiles = [
  'js/sound.js',
  'js/sprites.js',
  'js/gameplay.js',
  'js/main.js'
];

const concatenated = jsFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');
const tempFile = path.join('dist', 'temp_main.js');
fs.writeFileSync(tempFile, concatenated);

const esbuildResult = esbuild.buildSync({
  entryPoints: [tempFile],
  bundle: true,
  minify: false,
  write: false,
});

let jsCode = esbuildResult.outputFiles[0].text;

(async () => {
  const terserResult = await terser.minify(jsCode, {
    compress: {
      drop_console: true,
      dead_code: true,
      passes: 3,
    },
    mangle: {
      toplevel: true,
      reserved: ['gamePaused', 'document', 'window']
    },
    format: { comments: false },
  });

  if (terserResult.code) {
    fs.writeFileSync('dist/bundle.js', terserResult.code);
    fs.unlinkSync(tempFile);
  } else {
    throw new Error('Terser failed to produce output');
  }

  let css = fs.readFileSync('css/style.css', 'utf8');
  css = css.replace(/\s+/g, ' ').trim();
  fs.writeFileSync('dist/css/style.css', css);

  let html = fs.readFileSync('index.html', 'utf8');
  html = html.replace(/<script\s+src=".*?\.js"><\/script>/gs, '');
  html = html.replace(
    /<link rel="stylesheet" href="css\/style.css">/,
    '<link rel="stylesheet" href="css/style.css">'
  );
  html = html.replace(/\s+/g, ' ').trim();
  html = html.replace(
    '</body>',
    '  <script src="bundle.js"></script>\n</body>'
  );
  fs.writeFileSync('dist/index.html', html);

  // === Zip the dist folder ===
  const output = fs.createWriteStream('game.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    console.log(`📦 Zip created: game.zip (${archive.pointer()} total bytes)`);
  });

  archive.on('error', err => { throw err; });

  archive.pipe(output);
  archive.directory('dist/', false); // include all contents of dist
  await archive.finalize();

  console.log('🚀 Build complete! Dist folder is fully optimized and zipped.');
})();
