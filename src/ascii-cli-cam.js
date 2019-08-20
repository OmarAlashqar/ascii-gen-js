const NodeWebcam = require('node-webcam');
const sharp = require('sharp');
const Jimp = require('jimp');
const argv = require('minimist')(process.argv.slice(2));

const { asciify, CHARS_PER_PIXEL } = require('./index');
const { clearConsole } = require('./util');

// validate cli arguments & flags
const {
  invert: iInvert, i, iType, t,
} = argv;
const invert = iInvert || i;
const type = iType || t;

const options = {
  width: 1280,
  height: 720,
  quality: 100,
  saveShots: false,
  output: 'jpeg',
  device: false,
  callbackReturn: 'buffer',
  verbose: false,
};

const webcam = NodeWebcam.create(options);

const filename = 'temp-shot';

const capture = (filename) => new Promise((res, rej) => {
  webcam.capture(filename, (err, data) => {
    if (err) return rej(err);
    res(data);
  });
});

const convert = async () => {
  const lenna = await Jimp.read(`${filename}.jpg`);
  return lenna.contrast(0.2).normalize().getBufferAsync(Jimp.MIME_JPEG);
};

async function run() {
  while (true) {
    const terminalWidthPx = Math.floor(process.stdout.columns / CHARS_PER_PIXEL) || 80;
    const terminalHeightPx = Math.floor(process.stdout.rows) || undefined;

    await capture(filename);
    const buff = await convert();

    const { data, info } = await sharp(buff)
      .gamma()
      .normalise()
      .resize({ width: terminalWidthPx, height: terminalHeightPx, fit: 'inside' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const options = { invert, brightnessMapFn: type };
    const ascii = asciify(data, info.width, info.height, options);

    clearConsole();
    console.log(ascii);

    await new Promise((res) => setTimeout(res, 200));
  }
}

run().catch(console.error);
