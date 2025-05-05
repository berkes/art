const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [1080, 1080],
};

const sketch = () => {
  return ({ context, width, height }) => {
    if (Math.random() > 0.5) {
      context.fillStyle = 'black';
      context.strokeStyle = 'white';
    } else {
      context.fillStyle = 'white';
      context.strokeStyle = 'black';
    }

    context.fillRect(0, 0, width, height);
    context.lineWidth = width * 0.006;

    const cellWidth = width * 0.1;
    const cellHeight = cellWidth;
    const gap = width * 0.03;

    const ix = width * 0.17;
    const iy = height * 0.17;

    const off = width * 0.02;

    let x, y;
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        x = ix + (cellWidth + gap) * i;
        y = iy + (cellHeight + gap) * j;

        context.beginPath();
        context.rect(x, y, cellWidth, cellHeight);
        context.stroke();

        if (Math.random() > 0.5) {
          context.beginPath();
          context.rect(x + off / 2, y + off / 2, cellWidth - off, cellHeight - off);
          context.stroke();
        }
      }
    }

  };
};

canvasSketch(sketch, settings);
