const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');
const Tweakpane = require('tweakpane');

let manager;

const params = {
  debug: false,

  glyph: 'A',
  fontSize: 108,
  fontFamily: 'serif',
  fontWeight: 'normal',
};

const settings = {
  dimensions: [1080, 1080],
};

const shadowCanvas = document.createElement('canvas');
const shadowContext = shadowCanvas.getContext('2d');

const sketch = ({ width, height }) => {
  const cell = 40;
  const cols = Math.floor(width / cell);
  const rows = Math.floor(height / cell);
  const numCells = cols * rows;

  shadowCanvas.width = cols;
  shadowCanvas.height = rows;

  return ({ context, width, height, frame }) => {
    shadowContext.fillStyle = 'rgba(0, 0, 0, 1)';
    shadowContext.fillRect(0, 0, cols, rows);

    params.fontSize = cols * 1.2;

    shadowContext.fillStyle = 'white';
    shadowContext.textBaseline = 'top';
    shadowContext.font = `${params.fontSize}px ${params.fontFamily}`;

    const metrics = shadowContext.measureText(params.glyph);
    const mx = metrics.actualBoundingBoxLeft * -1;
    const my = metrics.actualBoundingBoxAscent * -1;
    const mw = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
    const mh = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    const tx = (cols - mw) / 2 - mx;
    const ty = (rows - mh) / 2 - my;

    shadowContext.save();
    shadowContext.translate(tx, ty);

    shadowContext.fillText(params.glyph, 0, 0);
    shadowContext.restore();

    const imageData = shadowContext.getImageData(0, 0, cols, rows).data;

    context.fillStyle = 'rgba(255, 255, 255, 1)';
    context.fillRect(0, 0, width, height);
    context.textBaseline = 'middle';
    context.textAlign = 'center';

    for (let i = 0; i < numCells; i++) {

      const x = (i % cols) * cell;
      const y = Math.floor(i / cols) * cell;

      const r = imageData[i * 4 + 0];
      // const g = imageData[i * 4 + 1];
      // const b = imageData[i * 4 + 2];
      // const a = imageData[i * 4 + 3];
      const glyph = getGlyph(r);
      const fontadjust = random.range(0, 2);
      context.font = `bold ${cell * fontadjust}px ${params.fontFamily}`;

      context.save();
      context.translate(x, y);

      context.fillStyle = `black`;
      context.fillText(glyph, 0, 0);

      context.restore();
    }

    if (params.debug) {
      context.drawImage(shadowCanvas, 0, 0);
    }
  };
};

const getGlyph = (r) => {
  if (r < 50) return ' ';
  if (r < 100) return '.';
  if (r < 150) return '-';
  if (r < 200) return params.glyph;

  otherGlyphs = '_/[]X'.split('');
  return random.pick(otherGlyphs);
}

document.addEventListener('keyup', (event) => {
  if (params.debug) {
    console.log(event.key);
  }
  if (event.key.length === 1 && /^[a-zA-Z]$/.test(event.key)) {
    params.glyph = event.key.toUpperCase();
    if (manager) {
      manager.update();
    }
  }
});

const start = async () => {
  manager = await canvasSketch(sketch, settings);
};
start();
