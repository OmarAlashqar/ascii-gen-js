// necessary since terminal characters are not monospace, and are about 2-3 times taller than wide
const CHARS_PER_PIXEL = 2;

// ordered from least to most dense
const CHAR_LOOKUP = '`^\",:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';

// computes the average of a list of numbers
const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

// note: they must return a value between 0 - 1
const brightnessMapFns = {
  avg: (rgbList) => avg(rgbList) / 255,
  lightness: (rgbList) => (Math.max(...rgbList) + Math.min(...rgbList)) / 2 / 255,
  luminocity: ([r, g, b]) => (0.21 * r + 0.72 * g + 0.07 * b) / 255,
};

const getChar = (brightness, invert = false) => {
  if (typeof brightness !== 'number' || brightness < 0 || brightness > 1) {
    throw Error(`Invalid brightness received: ${brightness}. It must be a number between 0 - 1.`);
  }

  const fixedBrightness = invert ? 1 - brightness : brightness; // inverts the brightness if needed
  const char = CHAR_LOOKUP[Math.floor(fixedBrightness * (CHAR_LOOKUP.length - 1))];

  if (!char) throw Error(`Encountered brightness out of bounds: ${brightness}`);
  return char;
};

/**
 * wraps a buffer and returns a function that can be used to get
 * a specific pixel lazily
 */
function getPixelParser(buffer, width, height) {
  return function getPixelData(row, col) {
    if (row < 0 || row >= height || col < 0 || col >= width) throw Error('out of bounds');

    const data = [];
    const startIndex = 3 * ((width * row) + col);

    for (let i = 0; i < 3; i++) data[i] = buffer[startIndex + i];

    return data;
  };
}

/**
 * **options.brightnessMapFn** Can be one of 'avg', 'lightness', 'luminocity' or a
 * custom fn with signature (rgb: Number[3]) -> Number between 0-1
 *
 * @param {ArrayBuffer} imgBuffer
 * @param {Number} widthPx
 * @param {Number} heightPx
 * @param {Object} options
 * @param {Number} options.charsPerPixel
 * @param {Boolean} options.invert
 * @param {String | Function} options.brightnessMapFn
 */
function asciify(imgBuffer, widthPx, heightPx, options = {}) {
  const {
    charsPerPixel = CHARS_PER_PIXEL,
    brightnessMapFn = 'avg',
    invert = false,
  } = options;


  // validate input
  const getBrightness = typeof brightnessMapFn === 'string'
    ? brightnessMapFns[brightnessMapFn]
    : brightnessMapFn;

  if (typeof getBrightness !== 'function') {
    throw Error(`The given "brightnessMapFn" is invalid. Try one of: ${Object.keys(brightnessMapFns)}`);
  }

  const getPixelData = getPixelParser(imgBuffer, widthPx, heightPx);

  // build the ascii art :^)
  let result = '';
  let buffer = '';
  for (let row = 0; row < heightPx; row++) {
    for (let col = 0; col < widthPx; col++) {
      const rgbList = getPixelData(row, col);
      const brightness = getBrightness(rgbList);
      const char = getChar(brightness, invert);

      for (let i = 0; i < charsPerPixel; i++) buffer += char;
    }

    result += `${buffer}\n`;
    buffer = '';
  }

  return result;
}

module.exports = {
  asciify,
  CHARS_PER_PIXEL,
};
