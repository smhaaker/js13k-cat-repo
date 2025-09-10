const fs = require('fs');
const path = require('path');
const terser = require('terser');
const archiver = require('archiver');

if (!fs.existsSync('dist')) fs.mkdirSync('dist', { recursive: true });
if (!fs.existsSync('dist/css')) fs.mkdirSync('dist/css', { recursive: true });
if (!fs.existsSync('archive')) fs.mkdirSync('archive', { recursive: true });

const jsFiles = [
  'js/sound.js','js/sprites.js','js/settings.js',
  'js/world.js','js/render.js','js/gameplay.js','js/main.js'
];


let concatenated = jsFiles.map(f => {
  let code = fs.readFileSync(f, 'utf8');
  code = code.replace(/\/\/.*$/gm, '')
             .replace(/\/\*[\s\S]*?\*\//g, '')
             .replace(/\n\s*/g, '\n');
  return code;
}).join('\n');

(async () => {
  const minified = await terser.minify(concatenated, {
    compress: { drop_console: true, dead_code: true, passes: 3 },
    mangle: { toplevel: true, reserved: ['document','window'] },
    format: { comments: false }
  });

  if (!minified.code) throw new Error('Terser failed');

  fs.writeFileSync('dist/bundle.js', minified.code);

  let css = fs.readFileSync('css/style.css', 'utf8')
              .replace(/\/\*[\s\S]*?\*\//g, '')
              .replace(/\s+/g, ' ')
              .replace(/\s*([:;{},])\s*/g, '$1')
              .trim();
  fs.writeFileSync('dist/css/style.css', css);

  let html = fs.readFileSync('index.html', 'utf8')
               .replace(/<!--[\s\S]*?-->/g, '')
               .replace(/\s+/g, ' ')
               .replace(/<script\s+src=".*?\.js"><\/script>/g, '')
               .replace('</body>', '  <script src="bundle.js"></script></body>')
               .trim();
  fs.writeFileSync('dist/index.html', html);

  const output = fs.createWriteStream('archive/game.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => console.log(`📦 Zip created: game.zip (${archive.pointer()} bytes)`));
  archive.on('error', err => { throw err; });

  archive.pipe(output);
  archive.directory('dist/', false);
  await archive.finalize();

  console.log('🚀 Build complete!');
})();
