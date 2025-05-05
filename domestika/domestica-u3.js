const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [ 1080, 1080 ],
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = '#f2f2f2';
    context.fillRect(0, 0, width, height);

    context.fillStyle = 'black';

    const cx = width * 0.5;
    const cy = height * 0.5;

    const w = width * 0.01;
    const h = height * 0.1;
    let x, y;

    const num = 48;
    const radius = width * 0.4;

    const bgArcSize = 6;
    for (let i = 0; i < height * 0.8; i += bgArcSize) {
      context.save();
      context.translate(cx, cy);
      context.lineWidth = bgArcSize;
      context.beginPath();

      const beginArc = random.range(0, Math.PI * 2);
      const endArc = beginArc + random.range(0, Math.PI * 2);

      context.strokeStyle = '#E6E6E6';
      context.arc(0, 0, i, beginArc, endArc);
      context.stroke();

      context.restore();
    }

    for (let i = 0; i < num; i++) {
      const slice = math.degToRad(360 / num);
      const angle = slice * i;

      const thisRadius = radius * random.range(0.9, 1.1);

      x = cx + thisRadius * Math.sin(angle);
      y = cy + thisRadius * Math.cos(angle);
      context.save();
      if (random.chance(0.8)) {
        context.fillStyle = '#FB1A8E';
        context.strokeStyle = '#FB1A8E';
      } else {
        context.fillStyle = '#5500dd';
        context.strokeStyle = '#5500dd';
      }
      
      context.save();
      context.translate(x, y);
      context.rotate(-angle);
      context.scale(random.range(0.1, 2), random.range(0.2, 0.5));

      context.beginPath();
      context.rect(0, 0, w, h);
      context.fill();
      context.restore();

      context.save();
      context.translate(cx, cy);
      context.rotate(-angle);

      context.lineWidth = random.range(5, 20);
      context.beginPath();
      context.arc(0, 0, thisRadius, slice, slice * random.range(1, Math.PI * 4));
      context.stroke();
      context.restore();
    }
  };
};

canvasSketch(sketch, settings);
