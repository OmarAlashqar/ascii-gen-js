const sharp = require('sharp');
const argv = require('minimist')(process.argv.slice(2));

const { asciify, CHARS_PER_PIXEL } = require('./index');

// validate cli arguments & flags
const { _: [fileName], invert: iInvert, i, iType, t } = argv;
const invert = iInvert || i;
const type = iType || t;

if (!fileName) throw Error('Expected an image filename as an argument, did not find any');

const clearConsole = () => console.log('\033[2J');

async function run() {
  const terminalWidthPx = Math.floor(process.stdout.columns / CHARS_PER_PIXEL) || 80;
  const terminalHeightPx = Math.floor(process.stdout.rows) || undefined;

  const { data, info } = await sharp(fileName)
    .resize({ width: terminalWidthPx, height: terminalHeightPx, fit: 'inside' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const options = { invert, brightnessMapFn: type };
  const ascii = asciify(data, info.width, info.height, options);

  clearConsole();
  console.log(ascii);
}

run().catch(console.error);
